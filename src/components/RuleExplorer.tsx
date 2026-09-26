import React, { useState } from 'react';
import { RULE_BASE } from '../expert-system/rule-base';
import { KNOWLEDGE_BASE_FACTS, CATEGORY_DESCRIPTIONS } from '../expert-system/knowledge-base';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ShieldAlert, 
  Code, 
  Layers, 
  CheckCircle2, 
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const RuleExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'facts'>('rules');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const categories = ['ALL', 'Respiratory', 'Cardiovascular', 'Gastrointestinal', 'Neurological', 'Systemic', 'Dermatological'];
  const risks = ['ALL', 'EMERGENCY', 'URGENT', 'MODERATE', 'LOW'];

  const filteredRules = RULE_BASE.filter((rule) => {
    if (categoryFilter !== 'ALL' && rule.category !== categoryFilter) return false;
    if (riskFilter !== 'ALL' && rule.result.riskLevel !== riskFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        rule.id.toLowerCase().includes(q) ||
        rule.name.toLowerCase().includes(q) ||
        rule.result.advisoryCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredFacts = KNOWLEDGE_BASE_FACTS.filter((fact) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        fact.id.toLowerCase().includes(q) ||
        fact.name.toLowerCase().includes(q) ||
        fact.category.toLowerCase().includes(q) ||
        fact.key.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Knowledge Base & Rule Base Repository
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Domain Knowledge
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent expert system domain knowledge comprising {KNOWLEDGE_BASE_FACTS.length} clinical facts and {RULE_BASE.length} deterministic rules.
              </p>
            </div>
          </div>

          {/* Toggle between Rules and Facts */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'rules' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rule Base ({RULE_BASE.length})
            </button>
            <button
              onClick={() => setActiveTab('facts')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'facts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fact Base ({KNOWLEDGE_BASE_FACTS.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={activeTab === 'rules' ? 'Search rules by ID, keyword, condition...' : 'Search facts by ID, symptom name, category...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-hidden"
          />
        </div>

        {activeTab === 'rules' && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-teal-500 outline-hidden cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-teal-500 outline-hidden cursor-pointer"
            >
              {risks.map((r) => (
                <option key={r} value={r}>
                  Risk: {r}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Rules View */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredRules.length} of {RULE_BASE.length} rules</span>
            <span>Sorted by Clinical Priority (Highest to Lowest)</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Rule Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-slate-900 text-white">
                      {rule.id}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Category: <strong className="text-slate-700">{rule.category}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Priority: {rule.priority}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                        rule.result.riskLevel === 'EMERGENCY'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : rule.result.riskLevel === 'URGENT'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : rule.result.riskLevel === 'MODERATE'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {rule.result.riskLevel}
                    </span>
                  </div>
                </div>

                {/* IF - THEN Pseudocode Block */}
                <div className="bg-slate-900 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-2">
                  <div className="text-amber-400 font-bold">
                    IF {rule.conditions.length === 0 ? '(DEFAULT TRUE)' : ''}
                  </div>
                  {rule.conditions.map((cond, ci) => (
                    <div key={ci} className="pl-4 text-cyan-300 flex items-center gap-1.5">
                      <span className="text-slate-500">[{ci + 1}]</span>
                      <span>{cond.factKey}</span>
                      <span className="text-amber-300 font-bold">{cond.operator}</span>
                      <span className="text-white">{JSON.stringify(cond.value)}</span>
                      {cond.description && (
                        <span className="text-slate-400 text-[10px] font-sans italic ml-2">
                          // {cond.description}
                        </span>
                      )}
                      {ci < rule.conditions.length - 1 && (
                        <span className="text-rose-400 font-bold ml-2">[{rule.logic}]</span>
                      )}
                    </div>
                  ))}

                  <div className="text-emerald-400 font-bold pt-1">THEN</div>
                  <div className="pl-4 text-emerald-300 space-y-0.5">
                    <div>advisory_category = <span className="text-white">"{rule.result.advisoryCategory}"</span></div>
                    <div>risk_level = <span className="text-white">"{rule.result.riskLevel}"</span></div>
                    <div>care_setting = <span className="text-white">"{rule.result.recommendedCare}"</span></div>
                  </div>
                </div>

                {/* Rationale and Reference */}
                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <p>
                    <strong className="text-slate-900">Clinical Rationale:</strong> {rule.result.clinicalRationale}
                  </p>
                  <p className="text-slate-600">
                    <strong className="text-slate-900">Action:</strong> {rule.result.actionSummary}
                  </p>
                  {rule.result.guidelineReference && (
                    <p className="text-[11px] text-teal-700 font-medium pt-1">
                      📚 <strong>Reference:</strong> {rule.result.guidelineReference}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facts View */}
      {activeTab === 'facts' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Knowledge Base Facts Registry ({filteredFacts.length} entries)
              </h2>
              <p className="text-xs text-slate-500">
                Formal vocabulary of medical concepts used by the fact extractor and rule evaluator.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Fact ID</th>
                  <th className="py-2.5 px-3">System Key</th>
                  <th className="py-2.5 px-3">Fact Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Data Type</th>
                  <th className="py-2.5 px-3">Clinical Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredFacts.map((fact) => (
                  <tr key={fact.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {fact.id}
                    </td>
                    <td className="py-3 px-3 font-mono text-teal-700 text-[11px]">
                      {fact.key}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {fact.name}
                      {fact.isRedFlag && (
                        <span className="ml-1.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                          Red Flag
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {fact.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                      {fact.type}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-sm">
                      {fact.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
