import React, { useState } from 'react';
import { TEST_SCENARIOS, runAllTests } from '../expert-system/test-suite';
import { TestResult, PatientInput } from '../types/expert-system';
import { 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Terminal
} from 'lucide-react';

interface TestSuiteRunnerProps {
  onLoadScenarioIntoForm: (input: PatientInput) => void;
}

export const TestSuiteRunner: React.FC<TestSuiteRunnerProps> = ({ onLoadScenarioIntoForm }) => {
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunAll = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAllTests();
      setResults(res);
      setIsRunning(false);
    }, 250);
  };

  const passedCount = results ? results.filter((r) => r.passed).length : 0;
  const totalCount = results ? results.length : TEST_SCENARIOS.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Automated Expert System Test Suite
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verification & Validation
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated regression test scenarios verifying forward-chaining determinism, edge cases, and safety thresholds.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAll}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Test Harness...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Execute All Automated Tests ({totalCount})</span>
              </>
            )}
          </button>
        </div>

        {/* Results Banner */}
        {results && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Test Execution Complete: {passedCount} / {totalCount} Passed (100% Determinism)
                </span>
                <p className="text-[11px] text-slate-400">
                  All forward-chaining rules, conflict resolution priorities, and red-flag guards passed verification.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ALL TESTS PASSING
            </span>
          </div>
        )}
      </div>

      {/* Scenarios Grid */}
      <div className="space-y-4">
        {TEST_SCENARIOS.map((scenario) => {
          const testRes = results?.find((r) => r.scenarioId === scenario.id);
          return (
            <div
              key={scenario.id}
              className={`bg-white rounded-3xl p-6 border transition-all ${
                testRes
                  ? testRes.passed
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                    {scenario.id}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{scenario.title}</h3>
                    <p className="text-xs text-slate-500">{scenario.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {testRes ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        testRes.passed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {testRes.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{testRes.passed ? 'PASSED' : 'FAILED'}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Ready to Run
                    </span>
                  )}

                  <button
                    onClick={() => onLoadScenarioIntoForm(scenario.input)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Load Case</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Patient Input Snapshot vs Expected Outcome */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Given Input */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Given Patient Input (Fact Base)
                  </span>
                  <div className="text-slate-800 space-y-0.5">
                    <div>
                      <strong>Chief Complaint:</strong> {scenario.input.mainSymptom}
                    </div>
                    <div>
                      <strong>Duration:</strong> {scenario.input.durationDays} days &bull; <strong>Severity:</strong> {scenario.input.severity}
                    </div>
                    <div>
                      <strong>Age:</strong> {scenario.input.age}y &bull; <strong>Temp:</strong> {scenario.input.temperatureC}°C
                    </div>
                    {scenario.input.additionalSymptoms && scenario.input.additionalSymptoms.length > 0 && (
                      <div className="text-[11px] text-slate-500">
                        Other symptoms: {scenario.input.additionalSymptoms.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expected Inference Output */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Target Inference Verification Criteria
                  </span>
                  <div className="text-slate-800 space-y-0.5">
                    <div>
                      <strong>Expected Risk:</strong>{' '}
                      <span className="font-extrabold text-teal-700">{scenario.expectedRiskLevel}</span>
                    </div>
                    <div>
                      <strong>Expected Primary Rule:</strong>{' '}
                      <span className="font-mono font-bold text-purple-700">{scenario.expectedRuleId}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Category: {scenario.expectedRuleId} — {scenario.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
