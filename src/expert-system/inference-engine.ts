import {
  PatientInput,
  AssessmentResult,
  RuleEvaluationLog,
  InferenceTrace,
  RuleDefinition,
} from '../types/expert-system';
import { RULE_BASE } from './rule-base';
import { buildWorkingMemory, evaluateCondition } from './fact-base';
import { performSafetyCheck } from './safety-layer';
import { generateExplanationItems } from './explainability-engine';

export function runInference(input: PatientInput): AssessmentResult {
  // 1. Build Working Memory (Fact Base)
  const workingMemory = buildWorkingMemory(input);

  // 2. Perform Safety Red-Flag Gatekeeper Check
  const safetyCheck = performSafetyCheck(input, workingMemory);

  // 3. Forward Chaining Cycle: Match Rules against Working Memory
  const matchedRulesLogs: RuleEvaluationLog[] = [];
  const unmatchedRulesLogs: RuleEvaluationLog[] = [];

  for (const rule of RULE_BASE) {
    if (rule.conditions.length === 0) {
      // Unconditional rule (e.g., fallback rule R040)
      matchedRulesLogs.push({
        ruleId: rule.id,
        ruleName: rule.name,
        matched: true,
        priority: rule.priority,
        riskLevel: rule.result.riskLevel,
        conditionEvaluations: [],
      });
      continue;
    }

    const conditionResults = rule.conditions.map((cond) =>
      evaluateCondition(cond, workingMemory)
    );

    let isMatch = false;
    if (rule.logic === 'ALL') {
      isMatch = conditionResults.every((c) => c.passed);
    } else {
      isMatch = conditionResults.some((c) => c.passed);
    }

    const log: RuleEvaluationLog = {
      ruleId: rule.id,
      ruleName: rule.name,
      matched: isMatch,
      priority: rule.priority,
      riskLevel: rule.result.riskLevel,
      conditionEvaluations: conditionResults.map((r, idx) => ({
        condition: rule.conditions[idx],
        factValue: r.factValue,
        passed: r.passed,
        reason: r.reason,
      })),
      failureReason: isMatch
        ? undefined
        : conditionResults
            .filter((c) => !c.passed)
            .map((c) => c.reason)
            .join('; '),
    };

    if (isMatch) {
      matchedRulesLogs.push(log);
    } else {
      unmatchedRulesLogs.push(log);
    }
  }

  // 4. Conflict Resolution
  // Sort matched rules by:
  // - Priority DESC (e.g. 100 -> 98 -> 85 -> 65 -> 35 -> 5)
  // - Tie-breaker: Number of conditions DESC (specificity)
  const conflictSet = [...matchedRulesLogs].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    const ruleA = RULE_BASE.find((r) => r.id === a.ruleId)!;
    const ruleB = RULE_BASE.find((r) => r.id === b.ruleId)!;
    return (ruleB?.conditions?.length || 0) - (ruleA?.conditions?.length || 0);
  });

  const topMatchLog = conflictSet[0] || matchedRulesLogs.find((m) => m.ruleId === 'R040');
  const selectedRule = RULE_BASE.find((r) => r.id === topMatchLog.ruleId) || RULE_BASE[RULE_BASE.length - 1];

  const conflictRationale = `Evaluated ${RULE_BASE.length} rules. ${matchedRulesLogs.length} rules satisfied premise conditions. Selected ${selectedRule.id} (${selectedRule.name}) based on highest clinical priority (${selectedRule.priority}) and specificity.`;

  // 5. Generate Explanations
  const { explanations, detailedWhy } = generateExplanationItems(
    selectedRule,
    matchedRulesLogs,
    workingMemory,
    input,
    safetyCheck.redFlagsDetected
  );

  // 6. Gather all triggered Rule definitions
  const allTriggeredRules = conflictSet
    .map((m) => RULE_BASE.find((r) => r.id === m.ruleId))
    .filter((r): r is RuleDefinition => r !== undefined);

  // 7. Contextual Self-Care & Warning Signs
  const selfCareAdvice: string[] = [];
  const warningSignsToMonitor: string[] = [
    'Sudden onset of shortness of breath or persistent chest tightness',
    'Confusion, disorientation, or extreme lethargy',
    'Inability to drink liquids or keep food down for over 24 hours',
    'High fever (>39.5°C / 103°F) that does not respond to standard antipyretics',
    'Severe or worsening localized pain',
  ];

  if (selectedRule.result.riskLevel === 'LOW') {
    selfCareAdvice.push('Prioritize 8+ hours of rest and sleep to support immune function.');
    selfCareAdvice.push('Drink plenty of water, herbal teas, or clear broths (2-3 liters/day).');
    selfCareAdvice.push('Use warm saline gargles for sore throat or saline nasal drops for congestion.');
    selfCareAdvice.push('Monitor your temperature twice daily.');
  } else if (selectedRule.result.riskLevel === 'MODERATE') {
    selfCareAdvice.push('Record your symptoms and temperature progression to share with your doctor.');
    selfCareAdvice.push('Rest comfortably and stay hydrated with electrolyte solutions.');
    selfCareAdvice.push('Schedule an in-person or telehealth medical consultation if symptoms do not improve within 48 hours.');
  }

  const safetyNotes: string[] = [
    safetyCheck.disclaimer,
  ];

  if (safetyCheck.emergencyBannerText) {
    safetyNotes.unshift(safetyCheck.emergencyBannerText);
  }

  const trace: InferenceTrace = {
    workingMemory,
    candidateRulesCount: RULE_BASE.length,
    matchedRules: matchedRulesLogs,
    unmatchedRules: unmatchedRulesLogs,
    conflictSet,
    selectedRule,
    conflictResolutionRationale: conflictRationale,
    redFlagsTriggered: safetyCheck.redFlagsDetected,
  };

  const headline = selectedRule.result.riskLevel === 'EMERGENCY'
    ? 'EMERGENCY CARE REQUIRED: Immediate Medical Attention Strongly Indicated'
    : selectedRule.result.riskLevel === 'URGENT'
    ? 'URGENT MEDICAL ASSESSMENT RECOMMENDED: Seek Same-Day Medical Care'
    : selectedRule.result.riskLevel === 'MODERATE'
    ? 'HEALTHCARE CONSULTATION ADVISED: Schedule Clinical Evaluation'
    : 'MILD SELF-LIMITING PROFILE: Home Supportive Care & Monitoring';

  return {
    id: 'ASM-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    timestamp: new Date().toISOString(),
    patientInput: input,
    riskLevel: selectedRule.result.riskLevel,
    advisoryCategory: selectedRule.result.advisoryCategory,
    recommendedCare: selectedRule.result.recommendedCare,
    headline,
    actionSummary: selectedRule.result.actionSummary,
    primaryTriggeredRule: selectedRule,
    allTriggeredRules,
    explanations,
    detailedWhy,
    safetyNotes,
    selfCareAdvice: selfCareAdvice.length > 0 ? selfCareAdvice : undefined,
    warningSignsToMonitor,
    inferenceTrace: trace,
  };
}
