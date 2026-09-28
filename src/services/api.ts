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
  // Check if nutrient query first
  const nutrient = findNutrientProfile(userMessage);

  try {
    const res = await fetch('/api/chat/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        currentFacts,
        chatHistory,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (!data.nutrientProfile && nutrient) {
        data.nutrientProfile = nutrient;
      }
      return data;
    }
  } catch (err) {
    // BUG-15 fix: surface API errors in dev mode
    if (import.meta.env.DEV) console.warn('[API] /api/chat/extract unreachable, using client-side NLP fallback:', err);
  }

  // Fallback client-side rule-based extractor
  return clientSideNLPExtractor(userMessage, currentFacts);
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
      quickOptions: [
        'Vitamin B12',
        'Vitamin D',
        'Iron',
        'Magnesium',
        'Zinc',
        'Other health problem',
      ],
      nutrientProfile: nutrientMatch,
    };
  }

  // 2. Check for "Other / Custom Problem" trigger
  // BUG-09 fix: use word-boundary regex instead of bare .includes('other')
  // Previously matched substrings like 'mother', 'together', 'another medication', etc.
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

  // 3. Symptoms Extraction
  const detectedSymptoms: string[] = [...(updated.additionalSymptoms || [])];
  let main = updated.mainSymptom || '';

  const symptomMap: Record<string, string[]> = {
    fever: ['fever', 'temperature', 'hot', 'chills', 'feverish'],
    cough: ['cough', 'coughing', 'hack'],
    'headache': ['headache', 'head ache', 'migraine'],
    'sore throat': ['sore throat', 'throat pain', 'swallow hurts'],
    fatigue: ['fatigue', 'tired', 'exhausted', 'malaise', 'low energy'],
    'runny nose': ['runny nose', 'congestion', 'stuffy nose', 'sneezing'],
    'abdominal pain': ['stomach pain', 'belly pain', 'abdominal pain', 'cramps', 'gut pain'],
    vomiting: ['vomiting', 'throwing up', 'nausea', 'vomit'],
    diarrhea: ['diarrhea', 'loose motion'],
    dizziness: ['dizzy', 'lightheaded', 'faint', 'vertigo'],
    'shortness of breath': ['shortness of breath', 'hard to breathe', 'difficulty breathing', 'breathless', 'wheezing'],
    'chest pain': ['chest pain', 'chest tightness', 'chest pressure'],
    'stiff neck': ['stiff neck', 'cant bend neck', 'neck stiffness'],
    'rash': ['rash', 'spots', 'hives', 'itching', 'skin eruption'],
    'joint pain': ['joint pain', 'knee pain', 'arthritis', 'joint ache', 'back pain'],
    'tingling': ['tingling', 'numbness', 'pins and needles', 'paresthesia'],
    'hair loss': ['hair loss', 'hair thinning', 'alopecia'],
    'insomnia': ['insomnia', 'cant sleep', 'trouble sleeping', 'sleeplessness'],
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

  // If user described something custom that wasn't in the predefined list
  if (!main && text.length > 3 && !text.match(/^(hi|hello|hey|start|test)$/)) {
    main = text.slice(0, 40); // record custom complaint
  }

  if (main) updated.mainSymptom = main;
  updated.additionalSymptoms = detectedSymptoms;

  // Duration
  const daysMatch = text.match(/(\d+)\s*(day|days|d)\b/);
  if (daysMatch) {
    updated.durationDays = parseInt(daysMatch[1], 10);
  } else if (text.includes('yesterday')) {
    updated.durationDays = 2;
  } else if (text.includes('today') || text.includes('just started')) {
    updated.durationDays = 1;
  } else if (text.includes('a week') || text.includes('one week')) {
    updated.durationDays = 7;
  } else if (text.includes('two weeks') || text.includes('2 weeks')) {
    updated.durationDays = 14;
  }

  // Severity
  if (text.includes('severe') || text.includes('unbearable') || text.includes('intense') || text.includes('extreme')) {
    updated.severity = 'severe';
  } else if (text.includes('moderate') || text.includes('medium')) {
    updated.severity = 'moderate';
  } else if (text.includes('mild') || text.includes('slight') || text.includes('little bit')) {
    updated.severity = 'mild';
  }

  // Temperature
  const tempMatch = text.match(/(\d{2,3}(?:\.\d)?)\s*(?:c|degrees c|°c)\b/i);
  if (tempMatch) {
    updated.temperatureC = parseFloat(tempMatch[1]);
  }
  const fMatch = text.match(/(\d{2,3}(?:\.\d)?)\s*(?:f|degrees f|°f)\b/i);
  if (fMatch) {
    const fVal = parseFloat(fMatch[1]);
    updated.temperatureC = parseFloat((((fVal - 32) * 5) / 9).toFixed(1));
  }

  // Red flags
  if (text.includes('chest pain') || text.includes('chest pressure')) updated.chestPain = true;
  if (text.includes('trouble breathing') || text.includes('severe breath')) updated.severeDyspnea = true;
  if (text.includes('stiff neck')) updated.stiffNeck = true;
  if (text.includes('weakness in arm') || text.includes('face drooping') || text.includes('slurred')) updated.suddenWeaknessOrNumbness = true;

  // Check what's missing
  const missing: string[] = [];
  if (!updated.mainSymptom) missing.push('main symptom');
  if (!updated.durationDays) missing.push('how many days you have had these symptoms');
  if (!updated.severity) missing.push('severity (mild, moderate, or severe)');

  let reply = '';
  let quickOptions: string[] = [];

  if (!updated.mainSymptom) {
    reply = "I'm here to evaluate your symptoms. Could you please specify your chief health complaint, or choose from common issues or nutrients below:";
    quickOptions = ['Fever & Cough', 'Severe Headache', 'Other / Custom Problem', 'Vitamin B12 Foods', 'Iron Deficiency Foods'];
  } else if (!updated.durationDays) {
    reply = `I noted: **${updated.mainSymptom}**. Approximately how many days have you been experiencing this?`;
    quickOptions = ['1 day (just started)', '2 - 3 days', '4 - 7 days', 'Over a week (> 7 days)'];
  } else if (!updated.severity) {
    reply = `Got it, ${updated.durationDays} day(s). How severe is it? Does it interrupt your normal daily activities or work?`;
    quickOptions = ['Mild (manageable)', 'Moderate (disrupts tasks)', 'Severe (incapacitating)'];
  } else if (!updated.chestPain && !updated.severeDyspnea && !updated.stiffNeck && !updated.suddenWeaknessOrNumbness) {
    reply = `Thank you. Lastly, to ensure safety: Do you have any emergency warning signs such as chest pain, severe shortness of breath, sudden arm weakness, or stiff neck?`;
    quickOptions = ['No warning signs', 'Chest pain or pressure', 'Trouble breathing', 'Evaluate my symptoms now'];
  } else {
    reply = `All critical clinical observations recorded for **${updated.mainSymptom}**. I'm ready to evaluate your symptoms against the expert rule engine.`;
    quickOptions = ['Evaluate my symptoms now', 'Add another symptom', 'Check Vitamin B12', 'Start over'];
  }

  return {
    extractedFacts: updated,
    assistantReply: reply,
    // BUG-10 fix: severity is required by multiple critical rules (R002, R013, R031, R032, R034)
  // Previously fired inference engine without severity, causing those rules to silently fail
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
