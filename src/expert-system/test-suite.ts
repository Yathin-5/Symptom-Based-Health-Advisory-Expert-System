import { PatientInput, RiskLevel, TestResult } from '../types/expert-system';
import { runInference } from './inference-engine';

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  patientInput: PatientInput;
  expectedRiskLevel: RiskLevel;
  expectedRuleId: string;
  expectedAdvisoryCategoryContains: string;
}

export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'T01',
    name: 'Mild Acute Viral Upper Respiratory Symptoms',
    description: 'Patient reports mild runny nose for 2 days with no red flags or high fever.',
    patientInput: {
      age: 26,
      mainSymptom: 'runny nose',
      additionalSymptoms: ['sneezing'],
      durationDays: 2,
      severity: 'mild',
      temperatureC: 37.1,
      existingConditions: [],
    },
    expectedRiskLevel: 'LOW',
    expectedRuleId: 'R030',
    expectedAdvisoryCategoryContains: 'Upper Respiratory Infection',
  },
  {
    id: 'T02',
    name: 'Multiple Acute Viral Symptoms (Fever + Cough + Mild)',
    description: 'Fever and cough lasting 2 days with mild severity; matches acute uncomplicated viral prodrome.',
    patientInput: {
      age: 32,
      mainSymptom: 'fever',
      additionalSymptoms: ['cough', 'mild body ache'],
      durationDays: 2,
      severity: 'mild',
      temperatureC: 38.2,
      existingConditions: [],
    },
    expectedRiskLevel: 'LOW',
    expectedRuleId: 'R031',
    expectedAdvisoryCategoryContains: 'Viral Syndrome',
  },
  {
    id: 'T03',
    name: 'Persistent Symptoms (> 7 Days)',
    description: 'Cough and fatigue lasting 10 days, exceeding normal acute viral self-limiting timeframe.',
    patientInput: {
      age: 40,
      mainSymptom: 'cough',
      additionalSymptoms: ['fatigue'],
      durationDays: 10,
      severity: 'moderate',
      temperatureC: 37.4,
      existingConditions: [],
    },
    expectedRiskLevel: 'MODERATE',
    expectedRuleId: 'R020',
    expectedAdvisoryCategoryContains: 'Prolonged Illness',
  },
  {
    id: 'T04',
    name: 'Critical Red Flag: Acute Chest Pain',
    description: 'Acute substernal chest pressure reported. Must immediately trigger EMERGENCY cardiovascular rule.',
    patientInput: {
      age: 58,
      mainSymptom: 'chest pain',
      additionalSymptoms: ['shortness of breath'],
      durationDays: 1,
      severity: 'severe',
      temperatureC: 36.9,
      existingConditions: ['hypertension'],
      chestPain: true,
    },
    expectedRiskLevel: 'EMERGENCY',
    expectedRuleId: 'R001',
    expectedAdvisoryCategoryContains: 'Cardiovascular Emergency',
  },
  {
    id: 'T05',
    name: 'Pediatric High Pyrexia Vulnerability',
    description: 'Infant aged 1 year with fever of 39.8°C (high fever). Triggers urgent pediatric evaluation.',
    patientInput: {
      age: 1,
      mainSymptom: 'fever',
      additionalSymptoms: ['irritability'],
      durationDays: 1,
      severity: 'moderate',
      temperatureC: 39.8,
      existingConditions: [],
    },
    expectedRiskLevel: 'URGENT',
    expectedRuleId: 'R014',
    expectedAdvisoryCategoryContains: 'Pediatric Vulnerability',
  },
  {
    id: 'T06',
    name: 'Conflicting Symptoms with Priority Resolution',
    description: 'Patient has mild runny nose (which matches low-risk R030) BUT ALSO sudden arm numbness (R003). Priority resolution must select R003 Emergency.',
    patientInput: {
      age: 52,
      mainSymptom: 'runny nose',
      additionalSymptoms: ['sudden weakness in left arm'],
      durationDays: 1,
      severity: 'severe',
      temperatureC: 37.0,
      existingConditions: [],
      suddenWeaknessOrNumbness: true,
    },
    expectedRiskLevel: 'EMERGENCY',
    expectedRuleId: 'R003',
    expectedAdvisoryCategoryContains: 'Cerebrovascular Deficit',
  },
  {
    id: 'T07',
    name: 'Meningismus Red Flag (Stiff Neck + High Fever)',
    description: 'Patient reports stiff neck with fever. Red flag override must trigger R004 CNS infection rule.',
    patientInput: {
      age: 23,
      mainSymptom: 'stiff neck',
      additionalSymptoms: ['fever', 'headache'],
      durationDays: 1,
      severity: 'severe',
      temperatureC: 39.1,
      existingConditions: [],
      stiffNeck: true,
    },
    expectedRiskLevel: 'EMERGENCY',
    expectedRuleId: 'R004',
    expectedAdvisoryCategoryContains: 'Nervous System Infection',
  },
  {
    id: 'T08',
    name: 'Severe Abdominal Pain Suspicious for Appendicitis',
    description: 'Severe acute abdominal pain for 1 day, urgent surgical/medical evaluation required.',
    patientInput: {
      age: 29,
      mainSymptom: 'abdominal pain',
      additionalSymptoms: ['nausea'],
      durationDays: 1,
      severity: 'severe',
      temperatureC: 37.8,
      existingConditions: [],
    },
    expectedRiskLevel: 'URGENT',
    expectedRuleId: 'R013',
    expectedAdvisoryCategoryContains: 'Acute Abdomen',
  },
];

export function runAllTests(): TestResult[] {
  return TEST_SCENARIOS.map((scenario) => {
    const result = runInference(scenario.patientInput);
    const riskMatch = result.riskLevel === scenario.expectedRiskLevel;
    const ruleMatch = result.primaryTriggeredRule.id === scenario.expectedRuleId;
    const passed = riskMatch && ruleMatch;

    return {
      scenarioId: scenario.id,
      title: scenario.name,
      passed,
      expectedRisk: scenario.expectedRiskLevel,
      actualRisk: result.riskLevel,
      expectedRule: scenario.expectedRuleId,
      actualRule: result.primaryTriggeredRule.id,
      details: passed
        ? `PASSED: Correctly resolved to ${result.riskLevel} under Rule ${result.primaryTriggeredRule.id}.`
        : `FAILED: Expected [${scenario.expectedRiskLevel} / ${scenario.expectedRuleId}], but got [${result.riskLevel} / ${result.primaryTriggeredRule.id}].`,
    };
  });
}
