import React from 'react';
import { AlertOctagon, PhoneCall, X, ShieldAlert, HeartPulse, Clock } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-zinc-950 rounded-2xl max-w-lg w-full shadow-2xl border border-rose-900/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 text-white p-5 flex items-start justify-between border-b border-rose-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-xl backdrop-blur-xs">
              <AlertOctagon className="w-7 h-7 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-rose-100">Immediate Medical Emergency Notice</h2>
              <p className="text-xs text-rose-300 font-medium mt-0.5">Critical Safety & Triage Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-rose-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-zinc-300">
          <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 text-xs text-rose-200 leading-relaxed flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-300">When to bypass this tool:</span> This expert system is for non-critical triage guidance. If you or someone you are assisting displays any of the symptoms below, <strong>call emergency services immediately</strong>:
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cardinal Emergency Red Flags</h3>
            <ul className="text-xs space-y-2 text-zinc-200">
              <li className="flex items-start gap-2 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <HeartPulse className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Chest Pain or Severe Pressure:</strong> Heaviness, radiating pain to arm, jaw, neck, or back.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Severe Shortness of Breath:</strong> Inability to speak in full sentences, gasping, or blue-tinted lips.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Sudden Weakness / Stroke (FAST):</strong> Face drooping, arm numbness, slurred speech.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Meningeal Warning:</strong> Stiff neck accompanied by high fever and acute confusion.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-medium">Emergency Dispatch</p>
              <p className="text-base font-bold text-white">911 (US) &bull; 112 (EU/UK) &bull; 999</p>
            </div>
            <a
              href="tel:911"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call 911 Now
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-900/90 px-6 py-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            I Understand &bull; Return to Chat
          </button>
        </div>
      </div>
    </div>
  );
};
