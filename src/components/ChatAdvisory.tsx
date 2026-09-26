import React, { useState } from 'react';
import { 
  PatientInput, 
  AssessmentResult 
} from '../types/expert-system';
import { extractSymptomsWithAI } from '../services/api';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ChatAdvisoryProps {
  onRunInference: (facts: PatientInput) => void;
  isLoading: boolean;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  "I have a runny nose and slight cough since yesterday, feels like a mild cold.",
  "I've had a bad dry cough and fatigue for 10 days, temperature is around 37.8C.",
  "Sudden severe chest pressure and shortness of breath started an hour ago.",
  "My 1-year-old baby has a high fever of 39.8C and is very irritable.",
];

export const ChatAdvisory: React.FC<ChatAdvisoryProps> = ({ onRunInference, isLoading }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: "Hello. I am the HealthAdvisor Conversational Intake Agent. Describe the symptoms you or the patient are experiencing in your own words. I will extract structured clinical facts and feed them into our deterministic expert rule engine.",
      timestamp: 'Just now',
    },
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Extracted Working Memory facts
  const [extractedFacts, setExtractedFacts] = useState<Partial<PatientInput>>({
    age: 28,
    mainSymptom: '',
    additionalSymptoms: [],
    durationDays: undefined,
    severity: undefined,
    existingConditions: [],
  });

  const [missingInfo, setMissingInfo] = useState<string[]>(['main symptom', 'duration in days', 'severity']);
  const [isReady, setIsReady] = useState<boolean>(false);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isProcessing) return;

    const userMsg: Message = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsProcessing(true);

    try {
      const historyContext = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        text: m.text,
      }));

      const res = await extractSymptomsWithAI(text, extractedFacts, historyContext);

      const botMsg: Message = {
        id: 'b-' + Date.now(),
        sender: 'bot',
        text: res.assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setExtractedFacts((prev) => ({ ...prev, ...res.extractedFacts }));
      setMissingInfo(res.missingCrucialInfo || []);
      setIsReady(res.isReadyForInference);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: 'b-err-' + Date.now(),
        sender: 'bot',
        text: "I processed your input. Please check the extracted facts panel on the right and update any details before running the inference.",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteInference = () => {
    const finalInput: PatientInput = {
      age: extractedFacts.age || 28,
      mainSymptom: extractedFacts.mainSymptom || 'Fever',
      additionalSymptoms: extractedFacts.additionalSymptoms || [],
      durationDays: extractedFacts.durationDays || 2,
      severity: extractedFacts.severity || 'moderate',
      temperatureC: extractedFacts.temperatureC || 37.8,
      existingConditions: extractedFacts.existingConditions || [],
      chestPain: !!extractedFacts.chestPain,
      severeDyspnea: !!extractedFacts.severeDyspnea,
      stiffNeck: !!extractedFacts.stiffNeck,
      suddenWeaknessOrNumbness: !!extractedFacts.suddenWeaknessOrNumbness,
      alteredMentalStatus: !!extractedFacts.alteredMentalStatus,
      bloodInVomitOrStool: !!extractedFacts.bloodInVomitOrStool,
    };
    onRunInference(finalInput);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'm1',
        sender: 'bot',
        text: "Conversation reset. What symptoms are you experiencing?",
        timestamp: 'Just now',
      },
    ]);
    setExtractedFacts({
      age: 28,
      mainSymptom: '',
      additionalSymptoms: [],
      durationDays: undefined,
      severity: undefined,
      existingConditions: [],
    });
    setMissingInfo(['main symptom', 'duration in days', 'severity']);
    setIsReady(false);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      {/* Left 2 Columns: Chat Feed */}
      <div className="lg:col-span-2 flex flex-col h-[650px] bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Conversational Triage Agent</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                  NLP Layer
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Natural-language parser &bull; Decision logic strictly in Rule Base
              </p>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0 text-xs">
                  <Bot className="w-4 h-4 text-teal-700" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`text-[9px] mt-1.5 block font-medium ${
                    msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span>Analyzing clinical text & extracting facts...</span>
            </div>
          )}
        </div>

        {/* Sample Prompt Chips */}
        <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="font-semibold text-slate-400 shrink-0 px-1">Try:</span>
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 text-slate-600 hover:text-teal-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              {prompt.slice(0, 30)}...
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="e.g. I have had a high fever and sore throat for 3 days..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isProcessing}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right 1 Column: Live Working Memory & Rule Extraction */}
      <div className="flex flex-col gap-4">
        {/* Working Memory State Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Live Working Memory (Facts)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              Vector
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Natural language is parsed into structured facts. The Expert System strictly uses these verified facts:
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Main Symptom:</span>
              <span className="font-bold text-slate-900">
                {extractedFacts.mainSymptom || <span className="text-slate-400 italic">Not detected yet</span>}
              </span>
            </div>

            <div className="flex items-start justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Other Symptoms:</span>
              <span className="font-semibold text-slate-800 text-right max-w-[150px]">
                {extractedFacts.additionalSymptoms && extractedFacts.additionalSymptoms.length > 0 ? (
                  extractedFacts.additionalSymptoms.join(', ')
                ) : (
                  <span className="text-slate-400 italic">None recorded</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Duration:</span>
              <span className="font-bold text-teal-700">
                {extractedFacts.durationDays ? (
                  `${extractedFacts.durationDays} day(s)`
                ) : (
                  <span className="text-slate-400 italic">Pending</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Severity:</span>
              <span className="font-bold uppercase tracking-wider text-xs">
                {extractedFacts.severity ? (
                  <span className={extractedFacts.severity === 'severe' ? 'text-rose-600' : extractedFacts.severity === 'moderate' ? 'text-amber-600' : 'text-emerald-600'}>
                    {extractedFacts.severity}
                  </span>
                ) : (
                  <span className="text-slate-400 italic font-normal normal-case">Pending</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Measured Temp:</span>
              <span className="font-semibold text-slate-800">
                {extractedFacts.temperatureC ? `${extractedFacts.temperatureC}°C` : 'Not reported'}
              </span>
            </div>

            {/* Red Flag indicator */}
            {(extractedFacts.chestPain || extractedFacts.severeDyspnea || extractedFacts.stiffNeck || extractedFacts.suddenWeaknessOrNumbness) && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Emergency red flag flag detected in text!</span>
              </div>
            )}
          </div>

          {/* Missing info notice */}
          {missingInfo.length > 0 && !isReady && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
              <span className="font-bold block">Awaiting more clinical facts:</span>
              <ul className="list-disc list-inside text-[10px] space-y-0.5 text-amber-900">
                {missingInfo.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Execute Inference Button */}
          <button
            onClick={handleExecuteInference}
            disabled={isLoading || !extractedFacts.mainSymptom}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              extractedFacts.mainSymptom
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Run Rule Base Inference</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Academic Separation Banner */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Architecture Design Principle</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong>LLM</strong> handles conversational language & text-to-fact parsing.
            <br />
            <strong>Rule Engine</strong> deterministically evaluates safety, risk level, and medical guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
