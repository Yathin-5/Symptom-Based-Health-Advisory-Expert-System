import React, { useState } from 'react';
import { 
  GraduationCap, 
  Cpu, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Code2, 
  Check, 
  Workflow 
} from 'lucide-react';

export const LearningLab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'forward_chaining' | 'conflict_resolution' | 'rules_vs_llm' | 'safety'>('overview');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Expert System Architecture & Learning Lab
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                Academic Curriculum
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive computer science and medical informatics guide to production rules, inference engines, and white-box explainability.
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-slate-100 text-xs font-bold">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            1. Core Architecture
          </button>
          <button
            onClick={() => setActiveSection('forward_chaining')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'forward_chaining'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            2. Forward Chaining Cycle
          </button>
          <button
            onClick={() => setActiveSection('conflict_resolution')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'conflict_resolution'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            3. Conflict Resolution
          </button>
          <button
            onClick={() => setActiveSection('rules_vs_llm')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'rules_vs_llm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            4. Rule Engine vs LLMs
          </button>
          <button
            onClick={() => setActiveSection('safety')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'safety'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            5. Clinical Safety & Triage
          </button>
        </div>
      </div>

      {/* 1. Core Architecture */}
      {activeSection === 'overview' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Anatomy of a Classic Rule-Based Expert System
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Expert systems were one of the earliest successful forms of Artificial Intelligence (AI). They mimic human specialist reasoning by separating knowledge from the execution logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
              <span className="font-mono text-xs font-bold text-teal-800">1. Knowledge Base (KB)</span>
              <h3 className="text-xs font-bold text-slate-900">Domain Truths & Vocabulary</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Contains static, verified medical concepts, symptoms, duration categories, and warning thresholds (Facts F001 - F063).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
              <span className="font-mono text-xs font-bold text-purple-800">2. Working Memory (Fact Base)</span>
              <h3 className="text-xs font-bold text-slate-900">Current Patient State</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Dynamic, instance-specific facts extracted from the user's form or conversational chat: <code className="text-[10px] bg-white px-1 py-0.5 rounded">fever: true, duration: 3</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <span className="font-mono text-xs font-bold text-amber-800">3. Inference Engine</span>
              <h3 className="text-xs font-bold text-slate-900">The Logical Brain</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Carries out forward-chaining rule matching, conflict resolution, safety overrides, and deduction of final advisories.
              </p>
            </div>
          </div>

          {/* Flow Diagram Representation */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3 font-mono text-xs">
            <div className="text-teal-400 font-bold">// System Information Pipeline</div>
            <div className="text-slate-300">
              USER INPUT (Form / Chat)
              <br />&nbsp;&nbsp;│
              <br />&nbsp;&nbsp;▼
              <br />FACT EXTRACTOR (Normalizes text into Working Memory vector)
              <br />&nbsp;&nbsp;│
              <br />&nbsp;&nbsp;▼
              <br />INFERENCE ENGINE (Matches Working Memory against Rule Base IF clauses)
              <br />&nbsp;&nbsp;│
              <br />&nbsp;&nbsp;▼
              <br />CONFLICT RESOLUTION (Priority: Emergency=100 &gt; Urgent=80 &gt; Moderate=50 &gt; Low=20)
              <br />&nbsp;&nbsp;│
              <br />&nbsp;&nbsp;▼
              <br />EXPLAINABILITY ENGINE ("Why did rule Rxxx trigger? Conditions A & B were met")
              <br />&nbsp;&nbsp;│
              <br />&nbsp;&nbsp;▼
              <br />ACTIONABLE ADVISORY (Risk Level + Care Setting + Clinical Rationale)
            </div>
          </div>
        </div>
      )}

      {/* 2. Forward Chaining Cycle */}
      {activeSection === 'forward_chaining' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Forward Chaining: Data-Driven Inference
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Forward chaining starts with known facts and moves forward to reach conclusions (data-driven reasoning). In contrast, backward chaining starts with a hypothesis and works backward to find supporting facts.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Step 1: Working Memory Population</h3>
              <p>
                Patient inputs: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold">fever = true, duration = 10, severity = moderate</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Step 2: Rule Premise Evaluation (Match Phase)</h3>
              <p>
                The engine iterates through all rules in the rule base. For rule <strong>R020</strong>:
              </p>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px]">
                IF duration_persistent == true (duration &gt; 7)
                <br />THEN advisory = "Prolonged Illness", risk = "MODERATE"
              </div>
              <p>
                Since <code>duration = 10 &gt; 7</code>, this premise evaluates to <strong>TRUE</strong>. Rule R020 enters the <em>Conflict Set</em>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Step 3: Conflict Set Resolution</h3>
              <p>
                Multiple rules might match simultaneously (e.g. general viral symptoms rule and persistent duration rule). The system selects the highest priority rule to govern the final advisory.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Conflict Resolution */}
      {activeSection === 'conflict_resolution' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Conflict Resolution Strategies
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              When more than one rule fires (matches all conditions), how does the expert system decide which rule takes precedence?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <h3 className="font-bold text-rose-950">1. Priority Ranking (Clinical Severity)</h3>
              <p className="text-rose-900 text-[11px] leading-relaxed">
                Emergency rules carry Priority 90-100; Urgent rules carry Priority 70-89; Moderate rules carry 40-69; Low self-care rules carry 10-39. Higher priority always wins.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
              <h3 className="font-bold text-indigo-950">2. Specificity (Premise Complexity)</h3>
              <p className="text-indigo-900 text-[11px] leading-relaxed">
                If two rules have equal priority, the rule with more conditions (more specific clinical criteria) takes precedence over general or broader rules.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <h3 className="font-bold text-amber-950">3. Red-Flag Veto</h3>
              <p className="text-amber-900 text-[11px] leading-relaxed">
                If ANY critical red-flag is identified (e.g. chest pain, FAST stroke signs), low-risk rules are suppressed and emergency routing is enforced.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Rule Engine vs LLM */}
      {activeSection === 'rules_vs_llm' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Architectural Boundary: Deterministic Rule Engine vs Stochastic LLM
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Why not just ask an LLM directly for medical diagnosis? Understanding the critical divide:
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 border-b border-slate-200">Dimension</th>
                  <th className="py-3 px-4 border-b border-slate-200 bg-teal-50 text-teal-900">Rule-Based Expert System</th>
                  <th className="py-3 px-4 border-b border-slate-200">Stochastic LLM (e.g. GPT/Gemini)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Determinism</td>
                  <td className="py-3 px-4 bg-teal-50/40 text-teal-950 font-semibold">100% Deterministic — same inputs always yield identical triage.</td>
                  <td className="py-3 px-4 text-slate-500">Probabilistic next-token prediction; can hallucinate or vary across runs.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Explainability</td>
                  <td className="py-3 px-4 bg-teal-50/40 text-teal-950 font-semibold">White-Box Audit Trail — exact rule IDs and conditions cited.</td>
                  <td className="py-3 px-4 text-slate-500">Black-Box neural weights; explanations are post-hoc rationalizations.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Safety Verification</td>
                  <td className="py-3 px-4 bg-teal-50/40 text-teal-950 font-semibold">Formal verification via unit tests (pytest / T01-T08).</td>
                  <td className="py-3 px-4 text-slate-500">Difficult to guarantee zero safety violations or red-flag misses.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Best Role in App</td>
                  <td className="py-3 px-4 bg-teal-50/40 text-teal-950 font-semibold">Triage Decision Logic, Risk Classification, Care Recommendation.</td>
                  <td className="py-3 px-4 text-slate-500">Natural-language dialogue & entity extraction from free text.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Safety & Triage */}
      {activeSection === 'safety' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Safety Engineering in Healthcare AI
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ethical and clinical constraints necessary for public health advisory systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">1. Non-Diagnostic Boundary</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                The system must NEVER claim to provide a confirmed diagnostic decree. It calculates triage urgency (Low, Moderate, Urgent, Emergency) and steers the patient to appropriate medical care settings.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">2. Red Flag Prioritization</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Conditions like acute chest pain, stridor, unilateral neurological deficits, or petechial rashes with fever take absolute precedence over minor symptoms.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
