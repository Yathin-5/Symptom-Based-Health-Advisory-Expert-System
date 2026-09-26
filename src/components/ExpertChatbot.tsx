import React, { useState, useEffect, useRef } from 'react';
import { 
  PatientInput, 
  AssessmentResult, 
  RiskLevel,
  CareSetting 
} from '../types/expert-system';
import { NutrientProfile } from '../types/nutrition';
import { extractSymptomsWithAI, submitAssessment } from '../services/api';
import { runInference } from '../expert-system/inference-engine';
import { RULE_BASE } from '../expert-system/rule-base';
import { findNutrientProfile } from '../expert-system/nutrition-knowledge-base';
import { NutrientCard } from './NutrientCard';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Cpu, 
  X, 
  Stethoscope, 
  Activity, 
  Layers, 
  BookOpen,
  ArrowRight,
  Heart,
  Lock,
  Apple
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickOptions?: string[];
  assessmentResult?: AssessmentResult;
  nutrientProfile?: NutrientProfile;
}

interface ExpertChatbotProps {
  onOpenEmergencyModal: () => void;
}

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-init-1',
  sender: 'bot',
  text: `Hello! I am your **Health Advisory & Clinical Expert System**. 

I evaluate symptoms using a deterministic clinical rule engine and forward-chaining inference. You can also ask me about essential vitamins & minerals (e.g., **Vitamin B12**, Iron, Vitamin D) to see what they do in the body and view foods sorted by enrichment percentage.

To begin: **What symptoms are you experiencing, or would you like to explore a nutrient / other health issue?**`,
  timestamp: 'Just now',
  quickOptions: [
    'Fever & Cough',
    'Severe Headache',
    'Stomach Pain / Diarrhea',
    'Other / Something else',
    'Vitamin B12 Foods',
    'Iron Deficiency Foods',
  ],
};

const RISK_BADGES: Record<RiskLevel, { text: string; bg: string; textCol: string; border: string; glow: string }> = {
  EMERGENCY: {
    text: 'EMERGENCY TRIAGE',
    bg: 'bg-rose-950/80',
    textCol: 'text-rose-300',
    border: 'border-rose-600',
    glow: 'shadow-rose-900/50 shadow-lg',
  },
  URGENT: {
    text: 'URGENT MEDICAL ATTENTION',
    bg: 'bg-amber-950/80',
    textCol: 'text-amber-300',
    border: 'border-amber-600',
    glow: 'shadow-amber-900/40 shadow-md',
  },
  MODERATE: {
    text: 'CLINICAL EVALUATION ADVISED',
    bg: 'bg-cyan-950/80',
    textCol: 'text-cyan-300',
    border: 'border-cyan-600',
    glow: 'shadow-cyan-900/40 shadow-md',
  },
  LOW: {
    text: 'LOW RISK / HOME CARE',
    bg: 'bg-emerald-950/80',
    textCol: 'text-emerald-300',
    border: 'border-emerald-600',
    glow: 'shadow-emerald-900/40 shadow-md',
  },
};

export const ExpertChatbot: React.FC<ExpertChatbotProps> = ({ onOpenEmergencyModal }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [expandedDetailsMsgId, setExpandedDetailsMsgId] = useState<string | null>(null);

  // Active Working Memory (Patient Facts)
  const [workingFacts, setWorkingFacts] = useState<Partial<PatientInput>>({
    age: 30,
    mainSymptom: '',
    additionalSymptoms: [],
    durationDays: undefined,
    severity: undefined,
    temperatureC: undefined,
    existingConditions: [],
  });

  const [latestAssessment, setLatestAssessment] = useState<AssessmentResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Handle user sending text or clicking a quick option chip
  const handleUserSend = async (messageToSend?: string) => {
    const rawText = (messageToSend || inputText).trim();
    if (!rawText || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    // If user clicked 'Evaluate my symptoms now' or asked for evaluation explicitly
    const wantsExplicitEvaluation = 
      rawText.toLowerCase().includes('evaluate') ||
      rawText.toLowerCase().includes('diagnose') ||
      rawText.toLowerCase().includes('tell me what to do') ||
      rawText.toLowerCase().includes('run assessment');

    // Check for direct nutrient lookup (e.g. Vitamin B12, Iron, Vitamin D, etc.)
    const directNutrient = findNutrientProfile(rawText);
    if (directNutrient) {
      const botReply: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: `Here is the comprehensive nutritional guide for **${directNutrient.name} (${directNutrient.chemicalName || ''})** — detailing its physiological functions in the human body, deficiency risks, adult RDA, and dietary sources ranked in descending order by enrichment percentage:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nutrientProfile: directNutrient,
        quickOptions: [
          'Check Vitamin D Foods',
          'Check Iron Foods',
          'Check Magnesium Foods',
          'Other / Something else',
          'Return to Symptom Triage',
        ],
      };
      setMessages((prev) => [...prev, botReply]);
      setIsProcessing(false);
      return;
    }

    try {
      const historyContext = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        text: m.text,
      }));

      // 1. NLP Fact Extraction & Contextual Assistant Follow-up
      const nlpResult = await extractSymptomsWithAI(rawText, workingFacts, historyContext);

      // If a nutrient profile was identified via server extraction
      if (nlpResult.nutrientProfile) {
        const botReply: ChatMessage = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: nlpResult.assistantReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          nutrientProfile: nlpResult.nutrientProfile,
          quickOptions: nlpResult.quickOptions && nlpResult.quickOptions.length > 0
            ? nlpResult.quickOptions
            : [
                'Check Vitamin D Foods',
                'Check Iron Foods',
                'Check Magnesium Foods',
                'Other / Something else',
                'Return to Symptom Triage',
              ],
        };
        setMessages((prev) => [...prev, botReply]);
        setIsProcessing(false);
        return;
      }

      const updatedFacts: Partial<PatientInput> = { ...workingFacts, ...nlpResult.extractedFacts };
      setWorkingFacts(updatedFacts);

      // Check if we should trigger the deterministic Expert System inference
      const hasChiefComplaint = !!updatedFacts.mainSymptom;
      const hasDuration = !!updatedFacts.durationDays;
      const hasRedFlag = !!(updatedFacts.chestPain || updatedFacts.severeDyspnea || updatedFacts.stiffNeck || updatedFacts.suddenWeaknessOrNumbness);

      const readyForInference = (hasChiefComplaint && hasDuration) || hasRedFlag || wantsExplicitEvaluation;

      if (readyForInference) {
        // Run Rule Engine
        const patientInput: PatientInput = {
          age: updatedFacts.age || 30,
          mainSymptom: updatedFacts.mainSymptom || 'Fever',
          additionalSymptoms: updatedFacts.additionalSymptoms || [],
          durationDays: updatedFacts.durationDays || 2,
          severity: updatedFacts.severity || 'moderate',
          temperatureC: updatedFacts.temperatureC || 37.8,
          existingConditions: updatedFacts.existingConditions || [],
          chestPain: !!updatedFacts.chestPain,
          severeDyspnea: !!updatedFacts.severeDyspnea,
          stiffNeck: !!updatedFacts.stiffNeck,
          suddenWeaknessOrNumbness: !!updatedFacts.suddenWeaknessOrNumbness,
          alteredMentalStatus: !!updatedFacts.alteredMentalStatus,
          bloodInVomitOrStool: !!updatedFacts.bloodInVomitOrStool,
        };

        const assessment = await submitAssessment(patientInput);
        setLatestAssessment(assessment);

        const botReply: ChatMessage = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `Based on your reported symptoms (${patientInput.mainSymptom}${patientInput.additionalSymptoms?.length ? ', ' + patientInput.additionalSymptoms.join(', ') : ''}) lasting ${patientInput.durationDays} day(s), our **Expert Rule Engine** has concluded the clinical advisory below:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          assessmentResult: assessment,
          quickOptions: [
            'Why did you select this rule?',
            'What home care steps should I take?',
            'Check Vitamin B12 Foods',
            'Other / Something else',
            'Inspect Rule Engine Trace',
          ],
        };

        setMessages((prev) => [...prev, botReply]);
      } else {
        // Continue step-by-step triage conversation
        const botReply: ChatMessage = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: nlpResult.assistantReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickOptions: nlpResult.quickOptions && nlpResult.quickOptions.length > 0 
            ? nlpResult.quickOptions 
            : ['1-2 days', '3-5 days', 'More than 7 days', 'Other / Something else'],
        };

        setMessages((prev) => [...prev, botReply]);
      }
    } catch (err) {
      console.error(err);
      // Fallback response
      const fallbackMsg: ChatMessage = {
        id: `b-err-${Date.now()}`,
        sender: 'bot',
        text: "I processed your observations. Please specify how many days you have had these symptoms and their severity level.",
        timestamp: 'Just now',
        quickOptions: ['1-2 days', '3-5 days', 'Over a week', 'Evaluate my symptoms now'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
    setWorkingFacts({
      age: 30,
      mainSymptom: '',
      additionalSymptoms: [],
      durationDays: undefined,
      severity: undefined,
      temperatureC: undefined,
      existingConditions: [],
    });
    setLatestAssessment(null);
    setExpandedDetailsMsgId(null);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-2rem)] max-w-5xl mx-auto w-full bg-black text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden font-sans">
      {/* Top Bar Header */}
      <header className="px-5 py-3.5 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-black font-bold shadow-md shadow-emerald-500/20">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">HealthAdvisor</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Expert System
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-zinc-400 font-medium">
                <Lock className="w-3 h-3 text-emerald-400" />
                100% Private &bull; No Login Required
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Vitamin B12 / Nutrition discovery */}
          <button
            onClick={() => handleUserSend('Vitamin B12')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/80 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Check Vitamin B12 biological functions & foods sorted by % DV"
          >
            <Apple className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Vitamin B12 Foods</span>
          </button>

          {/* Quick Other / Custom Symptom option */}
          <button
            onClick={() => handleUserSend('Other / Something else')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
            title="Evaluate other or non-respiratory problems"
          >
            <span>Other Problem</span>
          </button>

          {/* Emergency Alert Trigger */}
          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Emergency</span>
          </button>

          {/* Toggle Live Rule Engine Drawer */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isDrawerOpen
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}
            title="Inspect Working Memory & Active Rule Base"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* New Chat Reset */}
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            title="Clear Chat & Start Fresh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-black scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Bot Avatar */}
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-md font-medium'
                  : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-xs shadow-lg'
              }`}
            >
              {/* Message text with basic markdown formatting */}
              <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                {msg.text.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    {paragraph.split('**').map((chunk, cIdx) =>
                      cIdx % 2 === 1 ? (
                        <strong key={cIdx} className="text-white font-bold">
                          {chunk}
                        </strong>
                      ) : (
                        chunk
                      )
                    )}
                  </p>
                ))}
              </div>

              {/* EMBEDDED NUTRIENT PROFILE & FOOD ENRICHMENT CARD */}
              {msg.nutrientProfile && (
                <NutrientCard
                  nutrient={msg.nutrientProfile}
                  onSelectNutrient={(name) => handleUserSend(name)}
                />
              )}

              {/* EMBEDDED EXPERT SYSTEM ADVISORY CARD */}
              {msg.assessmentResult && (
                <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-4">
                  {/* Risk Badge & Headline */}
                  <div
                    className={`rounded-2xl p-4 border ${RISK_BADGES[msg.assessmentResult.riskLevel].bg} ${RISK_BADGES[msg.assessmentResult.riskLevel].border} ${RISK_BADGES[msg.assessmentResult.riskLevel].glow}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 ${RISK_BADGES[msg.assessmentResult.riskLevel].textCol}`}
                      >
                        {RISK_BADGES[msg.assessmentResult.riskLevel].text}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        Rule: <strong>{msg.assessmentResult.primaryTriggeredRule.id}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      {msg.assessmentResult.headline}
                    </h3>

                    <p className="text-xs text-zinc-300 font-medium mt-1">
                      Advisory Category:{' '}
                      <span className="text-emerald-400 font-bold">
                        {msg.assessmentResult.advisoryCategory}
                      </span>
                    </p>
                  </div>

                  {/* Action Summary Plan */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Recommended Action</span>
                    </div>
                    <p className="text-xs font-bold text-white leading-relaxed">
                      {msg.assessmentResult.actionSummary}
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      <strong>Clinical Rationale:</strong>{' '}
                      {msg.assessmentResult.primaryTriggeredRule.result.clinicalRationale}
                    </p>
                    {msg.assessmentResult.primaryTriggeredRule.result.guidelineReference && (
                      <div className="text-[10px] text-zinc-500 font-medium pt-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-zinc-400" />
                        <span>Source: {msg.assessmentResult.primaryTriggeredRule.result.guidelineReference}</span>
                      </div>
                    )}
                  </div>

                  {/* Explainability Accordion: "Why this rule triggered" */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedDetailsMsgId(
                          expandedDetailsMsgId === msg.id ? null : msg.id
                        )
                      }
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Explainability Engine: Why was this decided?</span>
                      </span>
                      {expandedDetailsMsgId === msg.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {expandedDetailsMsgId === msg.id && (
                      <div className="p-3.5 border-t border-zinc-800 text-xs space-y-3 bg-zinc-950">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                            Matched Rule Premise:
                          </span>
                          <div className="p-2.5 rounded-lg bg-zinc-900 font-mono text-[11px] text-emerald-300">
                            RULE {msg.assessmentResult.primaryTriggeredRule.id}:{' '}
                            {msg.assessmentResult.primaryTriggeredRule.name} (Priority:{' '}
                            {msg.assessmentResult.primaryTriggeredRule.priority})
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                            Facts That Satisfied Conditions:
                          </span>
                          <ul className="space-y-1 text-[11px] text-zinc-300">
                            {msg.assessmentResult.detailedWhy.map((reason, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-2">
                                <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Self Care or Warning Signs */}
                        {msg.assessmentResult.selfCareAdvice && (
                          <div className="pt-2 border-t border-zinc-800 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                              <Heart className="w-3 h-3" /> Home Care Measures
                            </span>
                            <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-0.5">
                              {msg.assessmentResult.selfCareAdvice.map((adv, aIdx) => (
                                <li key={aIdx}>{adv}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clickable Quick Reply Chips */}
              {msg.quickOptions && msg.quickOptions.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-zinc-800 flex flex-wrap gap-1.5">
                  {msg.quickOptions.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleUserSend(option)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-950/80 hover:border-emerald-500/60 border border-zinc-700/80 text-zinc-200 hover:text-emerald-300 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <span
                className={`text-[9px] mt-2 block font-medium ${
                  msg.sender === 'user' ? 'text-emerald-200' : 'text-zinc-500'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Spinner */}
        {isProcessing && (
          <div className="flex items-center gap-2.5 text-xs text-zinc-400 bg-zinc-900/80 px-4 py-3 rounded-2xl border border-zinc-800 w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Consulting clinical rule base & evaluating premise facts...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Input Bar */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserSend();
          }}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Describe symptoms, answer bot questions, or click chips..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950 transition-all disabled:opacity-30 disabled:hover:bg-emerald-600 cursor-pointer flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 px-1">
          <span>🔒 Pure client-session triage &bull; No personal data stored</span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>

      {/* Slide-out Drawer: Working Memory & Active Rule State */}
      {isDrawerOpen && (
        <aside className="absolute inset-y-0 right-0 w-full sm:w-96 bg-zinc-950 border-l border-zinc-800 shadow-2xl z-30 flex flex-col p-5 overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Live Working Memory (Facts)
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <p className="text-[11px] text-zinc-400">
              The expert system converts user statements into structured facts and matches them against the rule base:
            </p>

            {/* Fact List */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-mono text-[11px]">mainSymptom:</span>
                <span className="font-bold text-emerald-400">
                  {workingFacts.mainSymptom || <span className="text-zinc-600">Pending</span>}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-mono text-[11px]">durationDays:</span>
                <span className="font-bold text-white">
                  {workingFacts.durationDays ? `${workingFacts.durationDays} day(s)` : <span className="text-zinc-600">Pending</span>}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-mono text-[11px]">severity:</span>
                <span className="font-bold uppercase text-amber-400">
                  {workingFacts.severity || <span className="text-zinc-600 font-normal lowercase">Pending</span>}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-mono text-[11px]">measuredTemp:</span>
                <span className="font-bold text-white">
                  {workingFacts.temperatureC ? `${workingFacts.temperatureC}°C` : <span className="text-zinc-600">Not recorded</span>}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-mono text-[11px]">chestPain:</span>
                <span className={`font-bold ${workingFacts.chestPain ? 'text-rose-400' : 'text-zinc-500'}`}>
                  {workingFacts.chestPain ? 'TRUE (RED FLAG)' : 'FALSE'}
                </span>
              </div>
            </div>

            {/* Candidate Rules */}
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                Rule Base Repository ({RULE_BASE.length} total rules)
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {RULE_BASE.slice(0, 10).map((r) => (
                  <div key={r.id} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] space-y-0.5">
                    <div className="flex justify-between font-mono font-bold text-zinc-300">
                      <span>{r.id}: {r.category}</span>
                      <span className="text-emerald-400">P:{r.priority}</span>
                    </div>
                    <p className="text-zinc-500 truncate">{r.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trigger Evaluation Button */}
            <button
              onClick={() => handleUserSend('Evaluate my symptoms now')}
              disabled={!workingFacts.mainSymptom}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs transition-all cursor-pointer disabled:opacity-40"
            >
              Force Evaluate Working Memory
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
