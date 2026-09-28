import { PatientInput, WorkingMemory, RuleCondition } from '../types/expert-system';

export function buildWorkingMemory(input: PatientInput): WorkingMemory {
  const memory: WorkingMemory = {};

  const allSymptoms = new Set([
    (input.mainSymptom || '').toLowerCase().trim(),
    ...(input.additionalSymptoms || []).map((s) => s.toLowerCase().trim()),
  ]);

  const hasSymptom = (keywords: string[]): boolean => {
    for (const sym of allSymptoms) {
      if (keywords.some((kw) => sym.includes(kw))) {
        return true;
      }
    }
    return false;
  };

  // Temperature logic
  const temp = input.temperatureC || 0;
  const feverByTemp = temp >= 38.0;
  const highFeverByTemp = temp >= 39.5;

  // Primary Symptoms extraction
  const fever = hasSymptom(['fever', 'pyrexia', 'chills', 'hot', 'temperature']) || feverByTemp;
  const cough = hasSymptom(['cough', 'coughing', 'phlegm', 'sputum']);
  const soreThroat = hasSymptom(['sore throat', 'throat', 'pharyngitis', 'swallowing pain']);
  const headache = hasSymptom(['headache', 'head pain', 'migraine', 'cephalea']);
  const fatigue = hasSymptom(['fatigue', 'tired', 'exhausted', 'malaise', 'weakness', 'lethargy']);
  const runnyNose = hasSymptom(['runny nose', 'congestion', 'stuffy nose', 'sneezing', 'rhinorrhea', 'cold']);
  const abdominalPain = hasSymptom(['abdominal', 'stomach', 'belly pain', 'cramps', 'gut']);
  const vomiting = hasSymptom(['vomit', 'throwing up', 'emesis']); // BUG-14 fix: nausea is clinically distinct from vomiting
  const diarrhea = hasSymptom(['diarrhea', 'loose stool', 'watery stool']);
  const dizziness = hasSymptom(['dizzy', 'dizziness', 'lightheaded', 'vertigo', 'faint']);
  const shortnessOfBreath = hasSymptom(['breathing', 'breath', 'dyspnea', 'shortness of breath', 'wheezing']) || !!input.severeDyspnea;
  const chestPain = hasSymptom(['chest pain', 'chest pressure', 'angina', 'tight chest']) || !!input.chestPain;
  const stiffNeck = hasSymptom(['stiff neck', 'neck rigidity', 'cant bend neck']) || !!input.stiffNeck;
  const skinRash = hasSymptom(['rash', 'spots', 'petechiae', 'hives', 'urticaria', 'itching', 'itch']);
  const earPain = hasSymptom(['ear pain', 'earache', 'otalgia']); // BUG-13 fix: bare 'ear' matched 'hear', 'fear', etc.
  const bodyAches = hasSymptom(['body ache', 'muscle pain', 'myalgia']);
  const jointPain = hasSymptom(['joint', 'knee', 'back pain', 'spine', 'shoulder', 'hip pain', 'arthritis', 'joint ache']);
  const tinglingNumbness = hasSymptom(['tingling', 'numbness', 'pins and needles', 'paresthesia', 'numb fingers', 'numb feet', 'prickling']);
  const acidReflux = hasSymptom(['acid reflux', 'heartburn', 'gerd', 'indigestion', 'bloating', 'sour burp', 'stomach burning']);
  // BUG-01 fix: facts defined in knowledge-base but previously never written to working memory
  const lossOfTasteSmell = hasSymptom(['loss of taste', 'loss of smell', 'anosmia', 'ageusia', 'no taste', 'no smell', 'cant smell', 'cant taste']);
  const wheezing = hasSymptom(['wheez', 'stridor', 'whistling breath', 'high pitched breath']);

  // Red Flags
  const suddenWeakness = hasSymptom(['sudden weakness', 'facial droop', 'slurred speech', 'arm numbness']) || !!input.suddenWeaknessOrNumbness;
  const confusion = hasSymptom(['confusion', 'disoriented', 'altered mental', 'delirium']) || !!input.alteredMentalStatus;
  const bloodInStoolOrVomit = hasSymptom(['blood in stool', 'blood in vomit', 'coffee ground', 'hematemesis', 'black stool']) || !!input.bloodInVomitOrStool;
  const unableToKeepFluids = hasSymptom(['unable to keep fluids', 'cannot drink', 'dehydrated', 'no urination']) || !!input.unableToKeepFluidsDown;

  // Set Boolean & Value facts
  memory['fever'] = fever;
  memory['cough'] = cough;
  memory['sore_throat'] = soreThroat;
  memory['headache'] = headache;
  memory['fatigue'] = fatigue;
  memory['runny_nose'] = runnyNose;
  memory['abdominal_pain'] = abdominalPain;
  memory['vomiting'] = vomiting;
  memory['diarrhea'] = diarrhea;
  memory['dizziness'] = dizziness;
  memory['shortness_of_breath'] = shortnessOfBreath;
  memory['chest_pain'] = chestPain;
  memory['stiff_neck'] = stiffNeck;
  memory['skin_rash'] = skinRash;
  memory['ear_pain'] = earPain;
  memory['body_aches'] = bodyAches;
  memory['joint_pain'] = jointPain;
  memory['tingling_numbness'] = tinglingNumbness;
  memory['acid_reflux'] = acidReflux;
  memory['loss_of_taste_smell'] = lossOfTasteSmell; // BUG-01 fix
  memory['wheezing'] = wheezing;                     // BUG-01 fix

  memory['sudden_weakness'] = suddenWeakness;
  memory['confusion'] = confusion;
  memory['blood_in_stool_or_vomit'] = bloodInStoolOrVomit;
  memory['unable_to_keep_fluids'] = unableToKeepFluids;

  // High Fever
  memory['high_fever'] = highFeverByTemp; // BUG-06 fix: second clause was always a subset of highFeverByTemp
  memory['temperature_val'] = temp;

  // Duration
  const duration = input.durationDays || 1;
  memory['duration_days'] = duration;
  memory['duration_acute'] = duration <= 3;
  memory['duration_subacute'] = duration >= 4 && duration <= 7;
  memory['duration_chronic'] = duration > 14;               // BUG-08 fix: chronic checked first
  memory['duration_persistent'] = duration > 7 && duration <= 14; // mutually exclusive with chronic

  // Severity
  const sev = input.severity || 'mild';
  memory['severity_raw'] = sev;
  memory['severity_mild'] = sev === 'mild';
  memory['severity_moderate'] = sev === 'moderate';
  memory['severity_severe'] = sev === 'severe';

  // Demographics & Modifiers
  const age = input.age || 25;
  memory['age_val'] = age;
  memory['age_infant'] = age < 2;
  memory['infant_with_fever'] = age < 2 && fever;
  memory['age_elderly'] = age >= 65;
  memory['is_pregnant'] = !!input.isPregnant;
  memory['has_chronic_disease'] = (input.existingConditions || []).length > 0;

  return memory;
}

export function evaluateCondition(condition: RuleCondition, memory: WorkingMemory): { passed: boolean; factValue: any; reason: string } {
  const factValue = memory[condition.factKey];
  let passed = false;

  switch (condition.operator) {
    case 'is_true':
      passed = factValue === true;
      break;
    case 'is_false':
      passed = factValue === false || factValue === undefined;
      break;
    case '==':
      passed = factValue === condition.value;
      break;
    case '!=':
      passed = factValue !== condition.value;
      break;
    case '>':
      passed = typeof factValue === 'number' && factValue > condition.value;
      break;
    case '>=':
      passed = typeof factValue === 'number' && factValue >= condition.value;
      break;
    case '<':
      passed = typeof factValue === 'number' && factValue < condition.value;
      break;
    case '<=':
      passed = typeof factValue === 'number' && factValue <= condition.value;
      break;
    case 'includes':
      passed = Array.isArray(factValue) && factValue.includes(condition.value);
      break;
    default:
      passed = false;
  }

  const reason = passed
    ? `Condition [${condition.factKey} ${condition.operator} ${condition.value}] matched (actual value: ${JSON.stringify(factValue)})`
    : `Condition [${condition.factKey} ${condition.operator} ${condition.value}] failed (actual value: ${JSON.stringify(factValue)})`;

  return { passed, factValue, reason };
}
