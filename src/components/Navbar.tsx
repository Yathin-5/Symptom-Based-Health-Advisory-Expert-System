import React from 'react';
import { 
  ShieldAlert, 
  Stethoscope, 
  MessageSquare, 
  FileText, 
  Cpu, 
  BookOpen, 
  BarChart2, 
  CheckCircle2, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

export type ActiveTab = 
  | 'form' 
  | 'chat' 
  | 'result' 
  | 'inspector' 
  | 'rules' 
  | 'learning' 
  | 'tests' 
  | 'dashboard';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasResult: boolean;
  onOpenEmergencyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasResult,
  onOpenEmergencyModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top emergency strip notice */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-slate-200">Clinical Expert System Engine v2.4</span>
          <span className="text-slate-400 hidden sm:inline">| Deterministic Forward-Chaining Inference + Explainability</span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={onOpenEmergencyModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" />
              Emergency Red Flags
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div 
            onClick={() => setActiveTab('form')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">HealthAdvisor</span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-teal-50 text-teal-700 border border-teal-200">
                  Expert System
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Symptom-Based Health Advisory & Explainable Triage
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'form'
                  ? 'bg-teal-50 text-teal-700 shadow-xs border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Clinical Form</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'bg-teal-50 text-teal-700 shadow-xs border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-cyan-600" />
              <span>AI Chat Triage</span>
            </button>

            {hasResult && (
              <button
                onClick={() => setActiveTab('result')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'result'
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Advisory Result</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'inspector'
                  ? 'bg-purple-50 text-purple-700 shadow-xs border border-purple-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Inference Visualizer</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-amber-50 text-amber-700 shadow-xs border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Rule Base</span>
            </button>

            <button
              onClick={() => setActiveTab('learning')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'learning'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Learning Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tests'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Test Suite</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-800 shadow-xs border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-slate-700" />
              <span>Dashboard</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
