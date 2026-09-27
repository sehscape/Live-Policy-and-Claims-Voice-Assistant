import React from 'react';
import { Shield, Sparkles, X, Activity, CheckCircle, Radio, Terminal } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-elevated rounded-2xl border border-white/15 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white shadow-[0_0_12px_#0066FF]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Project Idea 2: Live Policy & Claims Voice Assistant
              </h3>
              <p className="text-xs text-slate-400">
                NSOffice.AI AI Centre of Excellence Internship Assignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Objective Statement */}
          <div className="p-4 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30">
            <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0066FF]" />
              <span>Project Brief & Solution Overview</span>
            </h4>
            <p className="text-slate-200">
              A caller describes a claim or asks about an insurance policy in plain speech. The assistant listens in real time over a WebSocket connection, observes the policy document or shared screen at 1 FPS to ground its reasoning in actual legal clauses, and speaks back a concise, plain-language explanation instead of a confusing wall of text.
            </p>
          </div>

          {/* Key Capabilities */}
          <div className="space-y-2">
            <h5 className="font-semibold text-white uppercase text-[11px] tracking-wider">
              Technical Architecture & Highlights
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#0066FF]" />
                  <span>Real-Time Live API</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Uses WebSocket audio-to-audio model (<code className="text-[#58a6ff]">gemini-3.1-flash-live-preview</code>) with 16kHz PCM streaming and 24kHz gapless playback.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mid-Response Barge-In</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Real-time interruption handling: When the caller speaks while the assistant is speaking, audio playback halts instantly and clears queued chunks.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#0066FF]" />
                  <span>Visual Screen Awareness</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Streams 1 FPS JPEG frames of the active policy document or the user&apos;s shared screen, allowing Gemini to visually inspect the exact clause on screen.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Clause-Grounded Adjudication</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Eliminates walls of text: Identifies the exact clause, highlights it on screen in Electric Blue, calculates the exact deductible, and generates a formal FNOL report.
                </p>
              </div>
            </div>
          </div>

          {/* Design System Compliance */}
          <div className="p-3.5 rounded-xl bg-slate-800/30 border border-white/5">
            <h5 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-1.5">
              NSOffice Glass UI System
            </h5>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• <strong>Accent Color:</strong> Electric Blue (<code className="text-[#58a6ff]">#0066FF</code>) with subtle liquid glows</li>
              <li>• <strong>Typography:</strong> DM Sans typeface with clear hierarchy and generous letter spacing</li>
              <li>• <strong>Hierarchy:</strong> Apple-style spacing and one primary action per view</li>
              <li>• <strong>Surfaces:</strong> Translucent frosted glass panels with multi-layer backdrop blurs</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold transition cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
