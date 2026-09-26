import React, { useState } from 'react';
import { 
  InferenceTrace, 
  RuleEvaluationLog, 
  RiskLevel 
} from '../types/expert-system';
import { RULE_BASE } from '../expert-system/rule-base';
import { 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  ArrowDown, 
  Sparkles, 
  Search, 
  Filter, 
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';

interface ExpertSystemVisualizerProps {
  trace: InferenceTrace | null;
  onSelectSampleScenario?: () => void;
}

export const ExpertSystemVisualizer: React.FC<ExpertSystemVisualizerProps> = ({
  trace,
}) => {
  const [selectedRuleFilter, setSelectedRuleFilter] = useState<'ALL' | 'MATCHED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [contrastiveRuleId, setContrastiveRuleId] = useState<string>('R001');

  if (!trace) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center">
          <Cpu className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Active Inference Trace Loaded</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Submit an assessment through the Clinical Form or AI Chat to visualize the complete step-by-step forward-chaining rule execution.
        </p>
      </div>
    );
  }

  const allEvaluations = [...trace.matchedRules, ...trace.unmatchedRules].sort((a, b) => b.priority - a.priority);

  const filteredRules = allEvaluations.filter((rule) => {
    if (selectedRuleFilter === 'MATCHED' && !rule.matched) return false;
    if (selectedRuleFilter === 'FAILED' && rule.matched) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        rule.ruleId.toLowerCase().includes(q) ||
        rule.ruleName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const contrastiveRuleLog = allEvaluations.find((r) => r.ruleId === contrastiveRuleId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Expert System White-Box Inspector
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-100 text-purple-800">
                  Execution Trace
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect how facts flowed into Working Memory, how {trace.candidateRulesCount} candidate rules were tested, and how conflict resolution resolved the winning advisory.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-purple-50 px-4 py-2.5 rounded-2xl border border-purple-200">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Winning Rule</span>
              <span className="text-xs font-mono font-bold text-purple-950">
                {trace.selectedRule?.id} ({trace.selectedRule?.priority} pts)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Architecture Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
            1
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Raw Input &bull; Fact Base</h3>
          <p className="text-[11px] text-slate-500">
            Intake symptoms, timeline, vitals, and modifiers are extracted into a normalized state.
          </p>
          <div className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded inline-block">
            {Object.keys(trace.workingMemory).length} facts generated
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
            2
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Forward Chaining</h3>
          <p className="text-[11px] text-slate-500">
            Inference engine matches working memory facts against premise IF conditions.
          </p>
          <div className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded inline-block">
            {trace.matchedRules.length} of {trace.candidateRulesCount} rules satisfied
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
            3
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Conflict Resolution</h3>
          <p className="text-[11px] text-slate-500">
            Matched rules form Conflict Set. Priority scoring (Emergency &gt; Urgent &gt; Moderate) and specificity break ties.
          </p>
          <div className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded inline-block">
            Priority {trace.selectedRule?.priority} selected
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
            4
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Explainability</h3>
          <p className="text-[11px] text-slate-500">
            Safety layer verifies red flags, produces actionable care guidance, and builds the "Why?" audit trace.
          </p>
          <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded inline-block">
            Deterministic advisory ready
          </div>
        </div>
      </div>

      {/* Working Memory Fact Vector Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Working Memory: Instantiated Fact Vector
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {Object.keys(trace.workingMemory).length} total state variables
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(trace.workingMemory).map(([key, val]) => {
            const isBool = typeof val === 'boolean';
            const isTrue = val === true;
            return (
              <div
                key={key}
                className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                  isBool && isTrue
                    ? 'bg-teal-50/80 border-teal-300 text-teal-950 font-bold'
                    : isBool && !isTrue
                    ? 'bg-slate-50/60 border-slate-200 text-slate-400'
                    : 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-semibold'
                }`}
              >
                <span className="text-[10px] text-slate-500 font-mono truncate block" title={key}>
                  {key}
                </span>
                <span className="text-xs mt-1">
                  {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : String(val)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conflict Resolution Rationale Card */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-6 space-y-2">
        <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Conflict Resolution Strategy in Action</span>
        </div>
        <p className="text-xs text-purple-950 leading-relaxed font-medium">
          {trace.conflictResolutionRationale}
        </p>
      </div>

      {/* Contrastive "Why didn't Rule X fire?" Inspector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Contrastive Inspector: "Why didn't Rule X fire?"
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Rule:</span>
            <select
              value={contrastiveRuleId}
              onChange={(e) => setContrastiveRuleId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 outline-hidden cursor-pointer"
            >
              {RULE_BASE.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.name.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {contrastiveRuleLog ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-900">{contrastiveRuleLog.ruleId}</span>
                <span className="text-xs font-semibold text-slate-700 ml-2">{contrastiveRuleLog.ruleName}</span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  contrastiveRuleLog.matched
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {contrastiveRuleLog.matched ? 'SATISFIED' : 'FAILED / DID NOT FIRE'}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Condition-by-Condition Evaluation:
              </span>
              {contrastiveRuleLog.conditionEvaluations.map((cond, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                    cond.passed
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {cond.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-mono font-medium">
                      {cond.condition.description || `${cond.condition.factKey} ${cond.condition.operator} ${cond.condition.value}`}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold">
                    Actual: {JSON.stringify(cond.factValue)} &bull; {cond.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Rule not found in evaluation trace.</p>
        )}
      </div>

      {/* Candidate Rules Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Comprehensive Rule Base Evaluation Matrix ({filteredRules.length} rules)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of every rule in the knowledge base evaluated against current patient facts.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search rule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-hidden"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSelectedRuleFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedRuleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedRuleFilter('MATCHED')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedRuleFilter === 'MATCHED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Fired
              </button>
              <button
                type="button"
                onClick={() => setSelectedRuleFilter('FAILED')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedRuleFilter === 'FAILED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Failed
              </button>
            </div>
          </div>
        </div>

        {/* Rules Table / Cards */}
        <div className="space-y-3">
          {filteredRules.map((rule) => {
            const isWinner = trace.selectedRule?.id === rule.ruleId;
            return (
              <div
                key={rule.ruleId}
                className={`p-4 rounded-2xl border transition-all ${
                  isWinner
                    ? 'bg-purple-50/70 border-purple-400 ring-2 ring-purple-300 shadow-xs'
                    : rule.matched
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/40 border-slate-200 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {rule.ruleId}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{rule.ruleName}</h4>
                    {isWinner && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white">
                        Selected Winner
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Priority: <strong>{rule.priority}</strong>
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        rule.riskLevel === 'EMERGENCY'
                          ? 'bg-rose-100 text-rose-800'
                          : rule.riskLevel === 'URGENT'
                          ? 'bg-amber-100 text-amber-800'
                          : rule.riskLevel === 'MODERATE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {rule.riskLevel}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        rule.matched
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rule.matched ? 'MATCH' : 'NO MATCH'}
                    </span>
                  </div>
                </div>

                {/* Sub conditions */}
                {rule.conditionEvaluations.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 pt-2 border-t border-slate-200/60">
                    {rule.conditionEvaluations.map((cond, ci) => (
                      <div
                        key={ci}
                        className={`text-[11px] px-2 py-1 rounded flex items-center justify-between ${
                          cond.passed
                            ? 'bg-emerald-100/60 text-emerald-900'
                            : 'bg-slate-200/60 text-slate-600'
                        }`}
                      >
                        <span className="truncate pr-1">
                          {cond.condition.description || cond.condition.factKey}
                        </span>
                        <span className="font-bold text-[10px]">
                          {cond.passed ? '✓ TRUE' : '✗ FALSE'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
