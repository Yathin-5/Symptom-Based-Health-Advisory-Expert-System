import { PatientInput, WorkingMemory } from '../types/expert-system';

export interface SafetyCheckResult {
  hasCriticalRedFlag: boolean;
  redFlagsDetected: string[];
  immediateActionRequired: boolean;
  emergencyBannerText?: string;
  disclaimer: string;
}

export const MANDATORY_MEDICAL_DISCLAIMER = 
  "DISCLAIMER: This system is a rule-based expert decision-support tool designed for informational and educational triage guidance only. It is NOT a substitute for professional clinical diagnosis, emergency evaluation, or individualized medical advice. If you are experiencing sudden, severe, or life-threatening symptoms, call emergency services (911 / 112) or go to the nearest emergency department immediately.";

export function performSafetyCheck(input: PatientInput, memory: WorkingMemory): SafetyCheckResult {
  const flags: string[] = [];

  if (memory['chest_pain']) {
    flags.push('Acute Chest Pain / Pressure: potential acute coronary or aortic event.');
  }

  if (memory['shortness_of_breath'] && memory['severity_severe']) {
    flags.push('Severe Respiratory Distress / Dyspnea at rest: high risk of respiratory decompensation.');
  }

  if (memory['sudden_weakness']) {
    flags.push('Sudden Focal Neurological Weakness / Facial Droop: acute stroke warning sign.');
  }

  if (memory['stiff_neck'] && memory['fever']) {
    flags.push('Nuchal Rigidity with Fever: cardinal sign of acute bacterial meningitis.');
  }

  if (memory['confusion'] && memory['fever']) {
    flags.push('Acute Delirium / Altered Mentation with Pyrexia: potential severe sepsis or encephalitis.');
  }

  if (memory['blood_in_stool_or_vomit']) {
    flags.push('Active Gastrointestinal Bleeding (Hematemesis or Melena).');
  }

  const hasCriticalRedFlag = flags.length > 0;

  return {
    hasCriticalRedFlag,
    redFlagsDetected: flags,
    immediateActionRequired: hasCriticalRedFlag,
    emergencyBannerText: hasCriticalRedFlag
      ? 'CRITICAL RED FLAG DETECTED: Immediate in-person emergency medical care is strongly indicated.'
      : undefined,
    disclaimer: MANDATORY_MEDICAL_DISCLAIMER,
  };
}
