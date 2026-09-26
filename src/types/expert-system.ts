export type RiskLevel = 'LOW' | 'MODERATE' | 'URGENT' | 'EMERGENCY';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export type CareSetting = 
  | 'SELF_CARE' 
  | 'TELEHEALTH' 
  | 'PRIMARY_CARE' 
  | 'URGENT_CARE' 
  | 'EMERGENCY_ROOM';

export interface FactDefinition {
  id: string; // e.g., 'F001'
  key: string; // e.g., 'fever'
  name: string; // e.g., 'Fever'
  category: 'symptom' | 'warning_sign' | 'duration' | 'severity' | 'demographic' | 'vitals' | 'comorbidity';
  description: string;
  type: 'boolean' | 'number' | 'string';
  unit?: string;
  isRedFlag?: boolean;
}

export type ConditionOperator = 
  | '==' 
  | '!=' 
  | '>' 
  | '>=' 
  | '<' 
  | '<=' 
  | 'in' 
  | 'includes'
  | 'is_true'
  | 'is_false';

export interface RuleCondition {
  factKey: string;
  operator: ConditionOperator;
  value: any;
  description?: string;
}

export interface RuleDefinition {
  id: string; // e.g., 'R001'
  name: string;
  priority: number; // Higher number = higher priority in conflict resolution (Emergency: 90-100, Urgent: 70-89, Moderate: 40-69, Low: 10-39)
  category: string; // e.g., 'Respiratory', 'Cardiovascular', 'Gastrointestinal', 'Neurological', 'Systemic'
  conditions: RuleCondition[];
  logic: 'ALL' | 'ANY'; // AND vs OR across top-level conditions
  result: {
    riskLevel: RiskLevel;
    advisoryCategory: string;
    recommendedCare: CareSetting;
    actionSummary: string;
    clinicalRationale: string;
    guidelineReference?: string;
  };
}

export interface PatientInput {
  age: number;
  gender?: 'male' | 'female' | 'other';
  mainSymptom: string;
  additionalSymptoms: string[];
  durationDays: number;
  severity: SymptomSeverity;
  temperatureC?: number;
  existingConditions: string[];
  currentMedications?: string[];
  isPregnant?: boolean;
  notes?: string;
  // Specific red-flag flags
  chestPain?: boolean;
  severeDyspnea?: boolean;
  alteredMentalStatus?: boolean;
  stiffNeck?: boolean;
  suddenWeaknessOrNumbness?: boolean;
  unableToKeepFluidsDown?: boolean;
  bloodInVomitOrStool?: boolean;
}

export interface WorkingMemory {
  [factKey: string]: any;
}

export interface RuleEvaluationLog {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  priority: number;
  riskLevel: RiskLevel;
  conditionEvaluations: {
    condition: RuleCondition;
    factValue: any;
    passed: boolean;
    reason: string;
  }[];
  failureReason?: string;
}

export interface InferenceTrace {
  workingMemory: WorkingMemory;
  candidateRulesCount: number;
  matchedRules: RuleEvaluationLog[];
  unmatchedRules: RuleEvaluationLog[];
  conflictSet: RuleEvaluationLog[];
  selectedRule: RuleDefinition | null;
  conflictResolutionRationale: string;
  redFlagsTriggered: string[];
}

export interface ExplanationItem {
  type: 'condition' | 'red_flag' | 'duration' | 'comorbidity' | 'rule_fired' | 'safety_override';
  title: string;
  detail: string;
  ruleId?: string;
}

export interface AssessmentResult {
  id: string;
  timestamp: string;
  patientInput: PatientInput;
  riskLevel: RiskLevel;
  advisoryCategory: string;
  recommendedCare: CareSetting;
  headline: string;
  actionSummary: string;
  primaryTriggeredRule: RuleDefinition;
  allTriggeredRules: RuleDefinition[];
  explanations: ExplanationItem[];
  detailedWhy: string[];
  safetyNotes: string[];
  selfCareAdvice?: string[];
  warningSignsToMonitor: string[];
  inferenceTrace: InferenceTrace;
}

export interface TestScenario {
  id: string; // e.g., 'T01'
  title: string;
  description: string;
  input: PatientInput;
  expectedRiskLevel: RiskLevel;
  expectedRuleId: string;
}

export interface TestResult {
  scenarioId: string;
  title: string;
  passed: boolean;
  expectedRisk: RiskLevel;
  actualRisk: RiskLevel;
  expectedRule: string;
  actualRule: string;
  details: string;
}
