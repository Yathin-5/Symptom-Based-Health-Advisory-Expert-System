import React, { useState } from 'react';
import { AssessmentResult, RiskLevel } from '../types/expert-system';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart2, 
  PieChart as PieIcon, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Search, 
  Eye, 
  FileText 
} from 'lucide-react';

interface DashboardAnalyticsProps {
  assessments: AssessmentResult[];
  onSelectAssessment: (result: AssessmentResult) => void;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  EMERGENCY: '#e11d48', // rose-600
  URGENT: '#d97706',    // amber-600
  MODERATE: '#3b82f6',  // blue-500
  LOW: '#10b981',       // emerald-500
};

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  assessments,
  onSelectAssessment,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Risk Level Distribution Data
  const riskCounts: Record<RiskLevel, number> = {
    LOW: 0,
    MODERATE: 0,
    URGENT: 0,
    EMERGENCY: 0,
  };
  assessments.forEach((a) => {
    if (riskCounts[a.riskLevel] !== undefined) {
      riskCounts[a.riskLevel]++;
    }
  });

  const riskData = Object.entries(riskCounts).map(([key, count]) => ({
    name: key,
    count,
    color: RISK_COLORS[key as RiskLevel],
  }));

  // 2. Symptom Frequency
  const symptomCounts: Record<string, number> = {};
  assessments.forEach((a) => {
    const main = a.patientInput.mainSymptom;
    if (main) {
      const cap = main.charAt(0).toUpperCase() + main.slice(1).toLowerCase();
      symptomCounts[cap] = (symptomCounts[cap] || 0) + 1;
    }
    (a.patientInput.additionalSymptoms || []).forEach((s) => {
      const cap = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      symptomCounts[cap] = (symptomCounts[cap] || 0) + 1;
    });
  });

  const symptomData = Object.entries(symptomCounts)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 3. Rule Hit Frequency
  const ruleCounts: Record<string, number> = {};
  assessments.forEach((a) => {
    const rId = a.primaryTriggeredRule.id;
    ruleCounts[rId] = (ruleCounts[rId] || 0) + 1;
  });

  const ruleData = Object.entries(ruleCounts)
    .map(([ruleId, count]) => ({ ruleId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 4. Filtered Assessment History
  const filtered = assessments.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.id.toLowerCase().includes(term) ||
      a.advisoryCategory.toLowerCase().includes(term) ||
      a.patientInput.mainSymptom.toLowerCase().includes(term) ||
      a.riskLevel.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Assessment Analytics & Clinical History Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Population-level triage metrics, risk distributions, and audit log of clinical encounters.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Intakes</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{assessments.length}</p>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 block">Active Sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency & Urgent</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {riskCounts.EMERGENCY + riskCounts.URGENT}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {assessments.length > 0
              ? `${Math.round(((riskCounts.EMERGENCY + riskCounts.URGENT) / assessments.length) * 100)}% of intake pool`
              : '0%'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Low / Self-Care</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{riskCounts.LOW}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {assessments.length > 0 ? `${Math.round((riskCounts.LOW / assessments.length) * 100)}% self-limiting` : '0%'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Complaint</span>
          <p className="text-xl font-bold text-slate-900 mt-1 truncate">
            {symptomData[0]?.symptom || 'Fever'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {symptomData[0]?.count || 0} occurrences
          </span>
        </div>
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Risk Classification Distribution
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">Triage Levels</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} assessments`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Frequent Symptoms Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Symptom Frequency Analysis
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">Top Reported</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptomData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="symptom" angle={-25} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(val: any) => [`${val} patients`, 'Frequency']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Encounter Audit History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Encounter Audit History ({filtered.length})
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail of evaluated inputs, triggered rules, and actionable outcomes.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date / ID</th>
                <th className="py-2.5 px-3">Patient Profile</th>
                <th className="py-2.5 px-3">Chief Symptom</th>
                <th className="py-2.5 px-3">Duration & Severity</th>
                <th className="py-2.5 px-3">Triggered Rule</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-900 font-bold block">{item.id}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-700">
                    <span>{item.patientInput.age}y &bull; {item.patientInput.gender || 'Not specified'}</span>
                    {item.patientInput.existingConditions && item.patientInput.existingConditions.length > 0 && (
                      <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                        {item.patientInput.existingConditions.join(', ')}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-900">
                    {item.patientInput.mainSymptom}
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-teal-700 font-semibold">{item.patientInput.durationDays}d</span>
                    <span className="text-slate-400 mx-1">&bull;</span>
                    <span className="capitalize">{item.patientInput.severity}</span>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-800">
                    {item.primaryTriggeredRule.id}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        item.riskLevel === 'EMERGENCY'
                          ? 'bg-rose-100 text-rose-800'
                          : item.riskLevel === 'URGENT'
                          ? 'bg-amber-100 text-amber-800'
                          : item.riskLevel === 'MODERATE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.riskLevel}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectAssessment(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
