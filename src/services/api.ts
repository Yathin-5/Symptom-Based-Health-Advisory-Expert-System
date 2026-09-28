import { PatientInput, AssessmentResult, TestResult } from '../types/expert-system';
import { NutrientProfile } from '../types/nutrition';
import { runInference } from '../expert-system/inference-engine';
import { runAllTests } from '../expert-system/test-suite';
import { findNutrientProfile } from '../expert-system/nutrition-knowledge-base';

const LOCAL_STORAGE_KEY = 'healthadvisor_assessment_history';

export async function submitAssessment(input: PatientInput): Promise<AssessmentResult> {
  try {
    const res = await fetch('/api/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = await res.json();
      saveAssessmentLocally(data);
      return data;
    }
  } catch (err) {
    // BUG-15 fix: surface API errors in dev mode so real bugs aren't silently swallowed
    if (import.meta.env.DEV) console.warn('[API] Server unreachable, using client-side expert system fallback:', err);
  }

  // Client-side fallback
  const result = runInference(input);
  saveAssessmentLocally(result);
  return result;
}

export interface ExtractedChatData {
  extractedFacts: Partial<PatientInput>;
  assistantReply: string;
  isReadyForInference: boolean;
  missingCrucialInfo?: string[];
  quickOptions?: string[];
  nutrientProfile?: NutrientProfile;
}

export async function extractSymptomsWithAI(
  userMessage: string,
  currentFacts: Partial<PatientInput>,
  chatHistory: { role: 'user' | 'assistant'; text: string }[]
): Promise<ExtractedChatData> {
  // Always run client-side NLP first — the system works 100% offline.
  // The server API (Gemini) is used as an optional enhancement only when available.
  const localResult = clientSideNLPExtractor(userMessage, currentFacts);

  // If the server is reachable AND has Gemini configured, enhance the result.
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    const res = await fetch('/api/chat/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, currentFacts, chatHistory }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      // Merge: prefer server reply for richer AI response, keep local nutrient if server missed it
      if (!data.nutrientProfile && localResult.nutrientProfile) {
        data.nutrientProfile = localResult.nutrientProfile;
      }
      return data;
    }
  } catch {
    // Server unreachable or timed out — silently fall through to local result
  }

  return localResult;
}

function clientSideNLPExtractor(
  message: string,
  currentFacts: Partial<PatientInput>
): ExtractedChatData {
  const text = message.toLowerCase().trim();
  const updated: Partial<PatientInput> = { ...currentFacts };

  // 1. Check for Nutrient / Food Enrichment lookup
  const nutrientMatch = findNutrientProfile(text);
  if (nutrientMatch) {
    return {
      extractedFacts: updated,
      assistantReply: `Here is the verified nutritional breakdown for **${nutrientMatch.name} (${nutrientMatch.chemicalName || ''})** — detailing its physiological functions in the human body, recommended daily intake, and food sources ranked in descending order by enrichment percentage:`,
      isReadyForInference: false,
      quickOptions: ['Vitamin B12', 'Vitamin D', 'Iron', 'Magnesium', 'Zinc', 'Other health problem'],
      nutrientProfile: nutrientMatch,
    };
  }

  // 2. Reset / Start Over triggers
  const isResetTrigger =
    /\b(start over|reset|new chat|begin again|restart|clear)\b/.test(text);
  if (isResetTrigger) {
    return {
      extractedFacts: { age: updated.age || 30, additionalSymptoms: [], existingConditions: [] },
      assistantReply: `No problem! Let's start fresh. **What symptoms are you experiencing today?** You can also ask about vitamins & minerals.`,
      isReadyForInference: false,
      quickOptions: ['Fever & Cough', 'Severe Headache', 'Stomach Pain', 'Check Vitamin B12 Foods'],
    };
  }

  // 3. Explicit evaluation triggers — run inference immediately if we have enough data
  const isEvaluateTrigger =
    /\b(evaluate|diagnose|assess|run|tell me|what should i do|analyse|analyze|check my symptoms|ready)\b/.test(text);
  if (isEvaluateTrigger && updated.mainSymptom && updated.durationDays && updated.severity) {
    return {
      extractedFacts: updated,
      assistantReply: `Running the expert system analysis for **${updated.mainSymptom}** now...`,
      isReadyForInference: true,
      quickOptions: [],
    };
  }

  // 4. "Other / Custom Problem" trigger
  const isOtherTrigger =
    text === 'other' ||
    /\bother\b/.test(text) ||
    text.includes('something else') ||
    text.includes('other symptom') ||
    text.includes('other problem') ||
    text.includes('different issue') ||
    text.includes('different problem') ||
    /\banother option\b/.test(text) ||
    /\bsome other\b/.test(text);

  if (isOtherTrigger && (!updated.mainSymptom || text.includes('another') || text.includes('some other'))) {
    updated.mainSymptom = undefined;
    updated.durationDays = undefined;
    updated.severity = undefined;
    return {
      extractedFacts: updated,
      assistantReply: `If your issue is outside common acute illnesses, our clinical expert system asks:\n\n1. **Location**: Where in your body is the discomfort?\n2. **Type of Sensation**: What does it feel like? (e.g., joint/back stiffness, skin rash or itching, tingling/numbness in fingers or toes, acid reflux/heartburn, or chronic exhaustion?)\n3. **Onset**: Did it occur suddenly or build up gradually over weeks?\n\nSelect an option below or type what you're feeling:`,
      isReadyForInference: false,
      quickOptions: [
        'Joint or back pain',
        'Tingling in hands / feet',
        'Skin rash or itching',
        'Acid reflux & heartburn',
        'Chronic fatigue & brain fog',
        'Check Vitamin B12 Foods',
      ],
    };
  }

  // 5. Symptom Extraction — comprehensive keyword map
  const detectedSymptoms: string[] = [...(updated.additionalSymptoms || [])];
  let main = updated.mainSymptom || '';

  const symptomMap: Record<string, string[]> = {
    fever: ['fever', 'high temperature', 'hot', 'chills', 'feverish', 'pyrexia', 'hyperthermia'],
    cough: ['cough', 'coughing', 'hacking', 'dry cough', 'wet cough', 'phlegm', 'sputum'],
    headache: ['headache', 'head ache', 'migraine', 'head pain', 'head is pounding', 'throbbing head'],
    'sore throat': ['sore throat', 'throat pain', 'swallow hurts', 'throat ache', 'pharyngitis', 'scratchy throat', 'throat irritation'],
    fatigue: ['fatigue', 'tired', 'exhausted', 'malaise', 'low energy', 'weakness', 'lethargy', 'no energy', 'drained', 'weak'],
    'runny nose': ['runny nose', 'congestion', 'stuffy nose', 'sneezing', 'blocked nose', 'nasal drip', 'rhinorrhea'],
    'abdominal pain': ['stomach pain', 'belly pain', 'abdominal pain', 'cramps', 'gut pain', 'stomach ache', 'tummy pain', 'abdomen'],
    vomiting: ['vomiting', 'throwing up', 'vomit', 'puking', 'emesis'],
    diarrhea: ['diarrhea', 'loose motion', 'watery stool', 'loose stool', 'bowel upset'],
    dizziness: ['dizzy', 'dizziness', 'lightheaded', 'faint', 'vertigo', 'unsteady', 'spinning'],
    'shortness of breath': ['shortness of breath', 'hard to breathe', 'difficulty breathing', 'breathless', 'cant breathe', 'breathing problem', 'dyspnea', 'out of breath'],
    'chest pain': ['chest pain', 'chest tightness', 'chest pressure', 'tight chest', 'angina', 'chest hurts'],
    'stiff neck': ['stiff neck', 'cant bend neck', 'neck stiffness', 'neck rigidity', 'painful neck'],
    'skin rash': ['rash', 'spots', 'hives', 'itching', 'skin eruption', 'skin problem', 'skin irritation', 'itch', 'urticaria', 'red spots', 'petechiae'],
    'joint pain': ['joint pain', 'knee pain', 'arthritis', 'joint ache', 'back pain', 'joint stiffness', 'hip pain', 'shoulder pain', 'bone pain'],
    'tingling numbness': ['tingling', 'numbness', 'pins and needles', 'paresthesia', 'numb hands', 'numb feet', 'numb fingers', 'tingling sensation'],
    'ear pain': ['ear pain', 'earache', 'ear hurts', 'painful ear', 'otalgia'],
    'body aches': ['body ache', 'muscle pain', 'myalgia', 'muscle ache', 'body pain', 'all over pain', 'aching all over'],
    'acid reflux': ['acid reflux', 'heartburn', 'indigestion', 'bloating', 'gerd', 'sour stomach', 'stomach burning'],
    'loss of taste smell': ['loss of taste', 'loss of smell', 'cant taste', 'cant smell', 'no taste', 'no smell', 'anosmia', 'ageusia'],
    wheezing: ['wheeze', 'wheezing', 'whistling breath', 'stridor', 'high pitched breath'],
    'blood in stool': ['blood in stool', 'blood in vomit', 'black stool', 'bloody stool', 'rectal bleeding', 'melena'],
    confusion: ['confused', 'confusion', 'disoriented', 'not thinking clearly', 'mental fog', 'delirium', 'altered'],
    'sudden weakness': ['sudden weakness', 'arm weakness', 'leg weakness', 'facial droop', 'face drooping', 'slurred speech', 'can not move arm'],
  };

  for (const [key, keywords] of Object.entries(symptomMap)) {
    if (keywords.some((kw) => text.includes(kw))) {
      if (!main) {
        main = key;
      } else if (!detectedSymptoms.includes(key) && main !== key) {
        detectedSymptoms.push(key);
      }
    }
  }

  // Custom complaint if nothing matched
  if (!main && text.length > 3 && !text.match(/^(hi|hello|hey|start|test|ok|yes|no|sure)$/)) {
    main = text.slice(0, 60);
  }

  if (main) updated.mainSymptom = main;
  updated.additionalSymptoms = detectedSymptoms;

  // 6. Duration extraction — handles phrases and numbers
  const daysMatch = text.match(/(\d+)\s*(day|days|d)\b/);
  const weeksMatch = text.match(/(\d+)\s*(week|weeks|wk|wks)\b/);
  const monthsMatch = text.match(/(\d+)\s*(month|months|mo)\b/);
  if (monthsMatch) {
    updated.durationDays = parseInt(monthsMatch[1], 10) * 30;
  } else if (weeksMatch) {
    updated.durationDays = parseInt(weeksMatch[1], 10) * 7;
  } else if (daysMatch) {
    updated.durationDays = parseInt(daysMatch[1], 10);
  } else if (text.includes('since yesterday') || text.includes('yesterday')) {
    updated.durationDays = 2;
  } else if (text.includes('since this morning') || text.includes('just started') || text.includes('since today') || text.includes('started today')) {
    updated.durationDays = 1;
  } else if (text.includes('a week') || text.includes('one week') || text.includes('1 week')) {
    updated.durationDays = 7;
  } else if (text.includes('two weeks') || text.includes('2 weeks')) {
    updated.durationDays = 14;
  } else if (text.includes('a month') || text.includes('one month') || text.includes('1 month')) {
    updated.durationDays = 30;
  } else if (/\b(1-2 day|one.?two day)/.test(text)) {
    updated.durationDays = 2;
  } else if (/\b(3-5 day|three.?five day)/.test(text)) {
    updated.durationDays = 4;
  } else if (/over a week|more than a week|more than 7/.test(text)) {
    updated.durationDays = 10;
  }

  // 7. Severity extraction
  if (/\b(severe|unbearable|extreme|very bad|intense|worst|critical|terrible|horrible)\b/.test(text)) {
    updated.severity = 'severe';
  } else if (/\b(moderate|medium|fairly bad|quite bad|disrupts|cannot work|can't work)\b/.test(text)) {
    updated.severity = 'moderate';
  } else if (/\b(mild|slight|little|manageable|minor|not too bad|bearable|ok|fine)\b/.test(text)) {
    updated.severity = 'mild';
  }
  // Quick option chip responses
  if (text === 'mild (manageable)') updated.severity = 'mild';
  if (text === 'moderate (disrupts tasks)') updated.severity = 'moderate';
  if (text === 'severe (incapacitating)') updated.severity = 'severe';

  // 8. Temperature extraction
  const tempCMatch = text.match(/(\d{2,3}(?:\.\d)?)\s*(?:c|degrees c|°c|celsius)\b/i);
  if (tempCMatch) updated.temperatureC = parseFloat(tempCMatch[1]);
  const tempFMatch = text.match(/(\d{2,3}(?:\.\d)?)\s*(?:f|degrees f|°f|fahrenheit)\b/i);
  if (tempFMatch) {
    updated.temperatureC = parseFloat((((parseFloat(tempFMatch[1]) - 32) * 5) / 9).toFixed(1));
  }

  // 9. Age extraction
  const ageMatch = text.match(/\b(\d{1,3})\s*(year|yr|years)[- ]?old\b/i);
  if (ageMatch) updated.age = parseInt(ageMatch[1], 10);
  else if (/\bi am (\d+)\b/.test(text)) {
    const m = text.match(/\bi am (\d+)\b/);
    if (m) updated.age = parseInt(m[1], 10);
  }

  // 10. Pregnancy
  if (/\b(pregnant|pregnancy)\b/.test(text)) updated.isPregnant = true;

  // 11. Red-flag boolean fields
  if (/\b(chest pain|chest pressure|chest tightness)\b/.test(text)) updated.chestPain = true;
  if (/\b(trouble breathing|severe breath|can't breathe|shortness of breath|breathless)\b/.test(text)) updated.severeDyspnea = true;
  if (/\bstiff neck\b/.test(text)) updated.stiffNeck = true;
  if (/\b(weakness in arm|face drooping|slurred|sudden weakness|arm numb)\b/.test(text)) updated.suddenWeaknessOrNumbness = true;
  if (/\b(blood in stool|blood in vomit|black stool|bloody)\b/.test(text)) updated.bloodInVomitOrStool = true;
  if (/\b(can't keep fluids|can't drink|unable to drink|severe dehydration)\b/.test(text)) updated.unableToKeepFluidsDown = true;
  if (/\b(confused|confusion|disoriented|delirium|altered mental)\b/.test(text)) updated.alteredMentalStatus = true;

  // 12. No warning signs chip
  if (text === 'no warning signs') {
    // User confirmed no red flags — ready to evaluate
    return {
      extractedFacts: updated,
      assistantReply: `Great — no emergency red flags noted. I have everything I need to evaluate your symptoms. Shall I run the clinical expert analysis now?`,
      isReadyForInference: !!updated.mainSymptom && !!updated.durationDays && !!updated.severity,
      quickOptions: ['Evaluate my symptoms now', 'Add more symptoms', 'Check Vitamin B12 Foods'],
    };
  }

  // 13. Build reply based on what's still missing
  const missing: string[] = [];
  if (!updated.mainSymptom) missing.push('main symptom');
  if (!updated.durationDays) missing.push('how many days you have had these symptoms');
  if (!updated.severity) missing.push('severity (mild, moderate, or severe)');

  let reply = '';
  let quickOptions: string[] = [];

  if (!updated.mainSymptom) {
    reply = `I'm here to help evaluate your symptoms. What is your **main health concern today?** Choose below or describe it in your own words:`;
    quickOptions = ['Fever & Cough', 'Severe Headache', 'Stomach Pain / Diarrhea', 'Chest Pain', 'Other / Something else', 'Vitamin B12 Foods'];
  } else if (!updated.durationDays) {
    reply = `I noted: **${updated.mainSymptom}**. Approximately how many days have you been experiencing this?`;
    quickOptions = ['1 day (just started)', '2 - 3 days', '4 - 7 days', 'Over a week (> 7 days)', 'More than 2 weeks'];
  } else if (!updated.severity) {
    reply = `Got it — **${updated.durationDays} day(s)** of **${updated.mainSymptom}**. How would you rate the severity? Does it disrupt your daily activities or work?`;
    quickOptions = ['Mild (manageable)', 'Moderate (disrupts tasks)', 'Severe (incapacitating)'];
  } else if (!updated.chestPain && !updated.severeDyspnea && !updated.stiffNeck && !updated.suddenWeaknessOrNumbness && !updated.bloodInVomitOrStool) {
    reply = `Thank you. One final safety check: do you have any of these emergency warning signs?`;
    quickOptions = ['No warning signs', 'Chest pain or pressure', 'Trouble breathing', 'Stiff neck with fever', 'Evaluate my symptoms now'];
  } else {
    reply = `All clinical observations recorded for **${updated.mainSymptom}** (${updated.durationDays} day(s), ${updated.severity}). The expert rule engine is ready to evaluate.`;
    quickOptions = ['Evaluate my symptoms now', 'Add another symptom', 'Check Vitamin B12', 'Start over'];
  }

  return {
    extractedFacts: updated,
    assistantReply: reply,
    // Severity is required by multiple critical rules — do not fire without it
    isReadyForInference: !!updated.mainSymptom && !!updated.durationDays && !!updated.severity,
    missingCrucialInfo: missing,
    quickOptions,
  };
}

export function saveAssessmentLocally(result: AssessmentResult): void {
  try {
    const list = getLocalAssessments();
    const filtered = list.filter((i) => i.id !== result.id);
    filtered.unshift(result);
    // Keep last 30
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered.slice(0, 30)));
  } catch (err) {
    console.error('Failed to save assessment to localStorage', err);
  }
}

export function getLocalAssessments(): AssessmentResult[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return getSampleAssessments();
    return JSON.parse(raw);
  } catch {
    return getSampleAssessments();
  }
}

export function executeTestSuite(): TestResult[] {
  return runAllTests();
}

function getSampleAssessments(): AssessmentResult[] {
  // Pre-seed 3 realistic sample assessments so the dashboard and history aren't empty initially
  const sample1 = runInference({
    age: 28,
    mainSymptom: 'runny nose',
    additionalSymptoms: ['sneezing', 'mild headache'],
    durationDays: 2,
    severity: 'mild',
    temperatureC: 37.2,
    existingConditions: [],
  });

  const sample2 = runInference({
    age: 45,
    mainSymptom: 'cough',
    additionalSymptoms: ['fatigue'],
    durationDays: 9,
    severity: 'moderate',
    temperatureC: 37.8,
    existingConditions: ['asthma'],
  });

  const sample3 = runInference({
    age: 68,
    mainSymptom: 'cough',
    additionalSymptoms: ['fever', 'malaise'],
    durationDays: 4,
    severity: 'moderate',
    temperatureC: 38.5,
    existingConditions: ['diabetes type 2', 'hypertension'],
  });

  return [sample3, sample2, sample1];
}
