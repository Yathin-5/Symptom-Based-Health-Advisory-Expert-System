import React, { useState } from 'react';
import { 
  AssessmentResult, 
  RiskLevel, 
  CareSetting 
} from '../types/expert-system';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock, 
  Calendar, 
  User, 
  HelpCircle, 
  BookOpen, 
  Printer, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Heart
} from 'lucide-react';

interface AssessmentResultViewProps {
  result: AssessmentResult;
  onNewAssessment: () => void;
  onViewTrace: () => void;
}

const RISK_CONFIG: Record<
  RiskLevel,
  {
    badgeClass: string;
    borderClass: string;
    bgGradient: string;
    icon: React.ReactNode;
    title: string;
  }
> = {
  EMERGENCY: {
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    borderClass: 'border-rose-400',
    bgGradient: 'from-rose-600 to-red-700',
    icon: <ShieldAlert className="w-8 h-8 text-white" />,
    title: 'CRITICAL / EMERGENCY TRIAGE',
  },
  URGENT: {
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    borderClass: 'border-amber-400',
    bgGradient: 'from-amber-600 to-orange-600',
    icon: <AlertTriangle className="w-8 h-8 text-white" />,
    title: 'URGENT MEDICAL ATTENTION INDICATED',
  },
  MODERATE: {
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    borderClass: 'border-blue-400',
    bgGradient: 'from-blue-600 to-indigo-700',
    icon: <Info className="w-8 h-8 text-white" />,
    title: 'CLINICAL EVALUATION RECOMMENDED',
  },
  LOW: {
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderClass: 'border-emerald-400',
    bgGradient: 'from-teal-600 to-emerald-700',
    icon: <CheckCircle className="w-8 h-8 text-white" />,
    title: 'LOW RISK / SUPPORTIVE SELF-CARE',
  },
};

const CARE_SETTING_LABELS: Record<CareSetting, { label: string; timeframe: string; color: string }> = {
  EMERGENCY_ROOM: { label: 'Emergency Department (A&E / 911)', timeframe: 'Immediately / Right now', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  URGENT_CARE: { label: 'Urgent Care Center / Same-Day Clinic', timeframe: 'Within 6 to 12 hours today', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  PRIMARY_CARE: { label: 'Primary Care Physician / Outpatient Clinic', timeframe: 'Within 24 to 48 hours', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  TELEHEALTH: { label: 'Virtual Telehealth Consultation', timeframe: 'Today / Next available slot', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  SELF_CARE: { label: 'Home Supportive Care & Hydration', timeframe: 'Continuous monitoring for 48-72h', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
};

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({
  result,
  onNewAssessment,
  onViewTrace,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const riskInfo = RISK_CONFIG[result.riskLevel];
  const careSetting = CARE_SETTING_LABELS[result.recommendedCare];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 print:p-0 print:max-w-none">
      {/* Top Action Ribbon (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Assessment Ref:</span>
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {result.id}
          </span>
          <span className="text-xs text-slate-400">
            &bull; {new Date(result.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onViewTrace}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Inspect Inference Trace</span>
          </button>

          <button
            onClick={onNewAssessment}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Intake</span>
          </button>
        </div>
      </div>

      {/* Hero Result Banner */}
      <div className={`rounded-3xl overflow-hidden shadow-lg border ${riskInfo.borderClass}`}>
        <div className={`bg-gradient-to-r ${riskInfo.bgGradient} p-6 sm:p-8 text-white`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xs shrink-0 shadow-inner">
                {riskInfo.icon}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/25 text-white backdrop-blur-xs mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {riskInfo.title}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {result.headline}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-1">
                  Advisory Category: <span className="font-bold underline decoration-white/40">{result.advisoryCategory}</span>
                </p>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right sm:min-w-[190px] shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 block">
                Recommended Care Setting
              </span>
              <span className="text-base font-extrabold text-white block mt-0.5">
                {careSetting.label.split('(')[0]}
              </span>
              <span className="text-[11px] text-white/90 font-medium block mt-1">
                ⏱ {careSetting.timeframe}
              </span>
            </div>
          </div>
        </div>

        {/* Action Summary Callout */}
        <div className="bg-white p-6 border-t border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0 mt-0.5">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recommended Action Plan
              </h2>
              <p className="text-sm font-bold text-slate-900 mt-1 leading-relaxed">
                {result.actionSummary}
              </p>
              <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                <strong>Clinical Rationale:</strong> {result.primaryTriggeredRule.result.clinicalRationale}
              </div>
              {result.primaryTriggeredRule.result.guidelineReference && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                  <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                  <span>Guideline: {result.primaryTriggeredRule.result.guidelineReference}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Core Explainability Section: WHY? */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Explainability Engine: Why This Recommendation?
              </h2>
              <p className="text-xs text-slate-500">
                Transparent rule inference trace and clinical justification breakdown
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            Fired Rule: {result.primaryTriggeredRule.id}
          </span>
        </div>

        {/* User-friendly bullet list of Why */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Inference Deduction Points:
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
            {result.detailedWhy.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Structured Explanation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.explanations.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                item.type === 'red_flag'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : item.type === 'rule_fired'
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                  : item.type === 'duration'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                  {item.type.replace('_', ' ')}
                </span>
                {item.ruleId && (
                  <span className="font-mono text-[10px] font-bold bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                    {item.ruleId}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-xs">{item.title}</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Collapsible Deep Inspector */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
          >
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showTechnicalDetails ? 'Hide Formal Rule Conditions' : 'Inspect Evaluated Rule Conditions & Logic'}</span>
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 p-4 bg-slate-900 rounded-2xl text-slate-200 text-xs font-mono space-y-2 overflow-x-auto">
              <div className="text-teal-400 font-bold">
                // Rule Definition: {result.primaryTriggeredRule.id} ({result.primaryTriggeredRule.name})
              </div>
              <div className="text-slate-400">
                Priority: {result.primaryTriggeredRule.priority} | Logic: {result.primaryTriggeredRule.logic} | Risk: {result.primaryTriggeredRule.result.riskLevel}
              </div>
              <div className="text-amber-300 mt-2">
                IF {result.primaryTriggeredRule.conditions.map((c) => `${c.factKey} ${c.operator} ${JSON.stringify(c.value)}`).join(` ${result.primaryTriggeredRule.logic} `)}
              </div>
              <div className="text-emerald-400">
                THEN risk_level = "{result.primaryTriggeredRule.result.riskLevel}", care = "{result.primaryTriggeredRule.result.recommendedCare}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Self-Care & Warning Signs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Self-care Advice */}
        {result.selfCareAdvice && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-teal-700">
              <Heart className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Supportive Home Care Guidance</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              {result.selfCareAdvice.map((advice, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{advice}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warning Signs to Monitor */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900">Watch for Escalation Signs</h3>
          </div>
          <p className="text-[11px] text-slate-500">
            If you develop any of the following symptoms, seek urgent or emergency clinical re-evaluation immediately:
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            {result.warningSignsToMonitor.map((sign, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Safety Layer Disclaimer Footer */}
      <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200 text-slate-600 text-xs leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <ShieldAlert className="w-4 h-4 text-slate-600" />
          <span>Safety Layer & Advisory Tool Boundary</span>
        </div>
        <p className="text-[11px] text-slate-500">
          {result.safetyNotes[0]}
        </p>
      </div>
    </div>
  );
};
