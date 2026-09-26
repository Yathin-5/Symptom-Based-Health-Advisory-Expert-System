import { 
  RuleDefinition, 
  WorkingMemory, 
  RuleEvaluationLog, 
  ExplanationItem, 
  RiskLevel,
  PatientInput
} from '../types/expert-system';

export function generateExplanationItems(
  selectedRule: RuleDefinition,
  matchedRules: RuleEvaluationLog[],
  workingMemory: WorkingMemory,
  patientInput: PatientInput,
  redFlags: string[]
): { explanations: ExplanationItem[]; detailedWhy: string[] } {
  const explanations: ExplanationItem[] = [];
  const detailedWhy: string[] = [];

  // 1. Red flag safety overrides
  if (redFlags.length > 0) {
    redFlags.forEach((flag) => {
      explanations.push({
        type: 'red_flag',
        title: 'Critical Clinical Red Flag Triggered',
        detail: flag,
        ruleId: selectedRule.id,
      });
      detailedWhy.push(`Critical Warning: ${flag}`);
    });
  }

  // 2. Primary Rule Fired Explanation
  explanations.push({
    type: 'rule_fired',
    title: `Decision Rule Triggered: ${selectedRule.id} - ${selectedRule.name}`,
    detail: `This rule was selected as the dominant clinical recommendation based on Priority ${selectedRule.priority} and matched physiological conditions.`,
    ruleId: selectedRule.id,
  });

  detailedWhy.push(
    `Rule ${selectedRule.id} (${selectedRule.name}) matched your primary symptom profile.`
  );

  // 3. Condition details for the selected rule
  const primaryLog = matchedRules.find((m) => m.ruleId === selectedRule.id);
  if (primaryLog) {
    primaryLog.conditionEvaluations.forEach((cond) => {
      if (cond.passed) {
        const readableDesc = cond.condition.description || `${cond.condition.factKey} = ${cond.condition.value}`;
        explanations.push({
          type: 'condition',
          title: `Matched Condition: ${readableDesc}`,
          detail: `Your input met this requirement: fact '${cond.condition.factKey}' has value ${JSON.stringify(cond.factValue)}.`,
          ruleId: selectedRule.id,
        });
        detailedWhy.push(`You reported: ${readableDesc}.`);
      }
    });
  }

  // 4. Duration aspect
  const duration = patientInput.durationDays || 1;
  if (duration > 7) {
    explanations.push({
      type: 'duration',
      title: 'Persistent Duration Factor (> 7 Days)',
      detail: `Your reported symptom duration of ${duration} days surpasses self-limiting viral benchmarks, elevating the recommendation for direct clinical evaluation.`,
    });
    detailedWhy.push(`Your symptoms have persisted for ${duration} days, exceeding the normal self-limiting timeframe for simple acute viruses.`);
  } else if (duration <= 3) {
    detailedWhy.push(`Symptom duration of ${duration} day(s) represents an acute early phase.`);
  }

  // 5. Comorbidities & Age modifiers
  if (patientInput.age >= 65) {
    explanations.push({
      type: 'comorbidity',
      title: 'Age Risk Modifier (Geriatric)',
      detail: `Patient age (${patientInput.age}) increases susceptibility to rapid respiratory and metabolic decompensation.`,
    });
    detailedWhy.push(`Patient is 65+ years old, which lowers physiological reserve and necessitates earlier consultation.`);
  } else if (patientInput.age < 2) {
    explanations.push({
      type: 'comorbidity',
      title: 'Pediatric Vulnerability Factor',
      detail: `Young children under 2 require careful monitoring for dehydration and occult infections.`,
    });
    detailedWhy.push(`Pediatric consideration: Patient is under 2 years old.`);
  }

  if (patientInput.existingConditions && patientInput.existingConditions.length > 0) {
    explanations.push({
      type: 'comorbidity',
      title: 'Pre-existing Chronic Conditions',
      detail: `Co-morbidities noted: ${patientInput.existingConditions.join(', ')}. These conditions influence infection severity and medical clearance.`,
    });
    detailedWhy.push(`Pre-existing medical conditions (${patientInput.existingConditions.join(', ')}) were factored into the decision threshold.`);
  }

  // 6. Secondary rules note
  if (matchedRules.length > 1) {
    const secondary = matchedRules
      .filter((m) => m.ruleId !== selectedRule.id)
      .map((m) => `${m.ruleId} (${m.ruleName})`);
    if (secondary.length > 0) {
      detailedWhy.push(`Secondary supporting rules also satisfied: ${secondary.join(', ')}.`);
    }
  }

  return { explanations, detailedWhy };
}

export function generateContrastiveExplanation(
  targetRuleId: string,
  unmatchedRules: RuleEvaluationLog[]
): string {
  const log = unmatchedRules.find((u) => u.ruleId === targetRuleId);
  if (!log) return `Rule ${targetRuleId} was not in the evaluated candidate pool.`;

  const failedConds = log.conditionEvaluations.filter((c) => !c.passed);
  if (failedConds.length === 0) return `Rule ${targetRuleId} was evaluated and satisfied.`;

  const reasons = failedConds.map((c) => c.condition.description || `${c.condition.factKey} was not ${c.condition.value}`);
  return `Rule ${targetRuleId} did NOT fire because: ${reasons.join('; ')}.`;
}
