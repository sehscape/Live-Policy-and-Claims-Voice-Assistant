import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  FileCheck,
  Send,
  Zap,
  Radio,
  FileText
} from 'lucide-react';
import { InsurancePolicy, SampleScenario } from '../data/policies';

export interface AdjudicationResult {
  verdict: 'COVERED' | 'PARTIALLY_COVERED' | 'EXCLUDED' | 'DOCUMENTATION_REQUIRED' | string;
  verdictHeadline: string;
  applicableClause: string;
  clauseQuote: string;
  deductibleSummary: string;
  coverageLimit?: string;
  spokenExplanation: string;
  plainSpeechBreakdown: string;
  callerNextSteps: string[];
  fnolDraft: {
    claimType: string;
    incidentSummary: string;
    estimatedDeductible: string;
    claimPriority: string;
    recommendedAction: string;
  };
}

interface LiveVoiceAssistantProps {
  currentPolicy: InsurancePolicy;
  isCallActive: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  isMicMuted: boolean;
  onToggleMicMute: () => void;
  visualizerLevels: number[];
  latestSpokenResponse: string | null;
  adjudication: AdjudicationResult | null;
  onSelectClause: (clauseCitation: string) => void;
  onOpenFnolModal: (claim: AdjudicationResult['fnolDraft']) => void;
  onSendTextMessage: (text: string) => void;
  isProcessing: boolean;
  onReplayAudio: (text: string) => void;
  isPlayingAudio: boolean;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
}

export const LiveVoiceAssistant: React.FC<LiveVoiceAssistantProps> = ({
  currentPolicy,
  isCallActive,
  onStartCall,
  onEndCall,
  isMicMuted,
  onToggleMicMute,
  visualizerLevels,
  latestSpokenResponse,
  adjudication,
  onSelectClause,
  onOpenFnolModal,
  onSendTextMessage,
  isProcessing,
  onReplayAudio,
  isPlayingAudio,
  selectedVoice,
  onSelectVoice,
}) => {
  const [typedMessage, setTypedMessage] = useState('');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const handleScenarioClick = (scenario: SampleScenario) => {
    setActiveScenarioId(scenario.id);
    onSendTextMessage(scenario.query);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || isProcessing) return;
    onSendTextMessage(typedMessage);
    setTypedMessage('');
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Top Section: Assistant Identity & Call Controller */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0066FF] shadow-[0_0_8px_#0066FF]"></span>
              <h3 className="font-semibold text-white text-base">
                BFSI Policy & Claims Concierge
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live speech adjudication with clause-grounded explanations
            </p>
          </div>

          {/* Voice Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/60 border border-white/10 text-xs">
            <span className="text-[11px] text-slate-400 px-1 hidden sm:inline">Voice:</span>
            <button
              onClick={() => onSelectVoice('Zephyr')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedVoice === 'Zephyr'
                  ? 'bg-[#0066FF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Zephyr (Calm)
            </button>
            <button
              onClick={() => onSelectVoice('Kore')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedVoice === 'Kore'
                  ? 'bg-[#0066FF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kore (Warm)
            </button>
          </div>
        </div>

        {/* Primary Action Button (Apple-style spacing & prominence) */}
        <div className="mt-5 flex flex-col items-center justify-center">
          {!isCallActive ? (
            <button
              onClick={onStartCall}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_25px_rgba(0,102,255,0.4)] hover:shadow-[0_0_35px_rgba(0,102,255,0.6)] cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PhoneCall className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Start Live Voice Call</span>
            </button>
          ) : (
            <div className="w-full flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
              {/* Call active visualizer status */}
              <div className="flex items-center gap-3 pl-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span>Live Call in Progress</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-normal">
                      Barge-in Enabled
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isMicMuted ? 'Microphone Muted' : 'Listening in real time... Speak freely'}
                  </div>
                </div>
              </div>

              {/* In-Call Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleMicMute}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isMicMuted
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-200'
                  }`}
                  title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={onEndCall}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>End Call</span>
                </button>
              </div>
            </div>
          )}

          {/* Real-time Fluid Audio Waveform Visualizer */}
          <div className="w-full mt-4 h-12 flex items-center justify-center gap-1 sm:gap-1.5 px-4 bg-slate-950/60 rounded-xl border border-white/5 overflow-hidden">
            {visualizerLevels.map((lvl, index) => {
              const heightPercent = isCallActive
                ? Math.max(12, Math.min(100, Math.round(lvl * 100)))
                : isProcessing
                ? Math.sin((index + Date.now() / 200) * 0.5) * 35 + 45
                : 8;

              return (
                <div
                  key={index}
                  className={`w-1.5 sm:w-2 rounded-full transition-all duration-75 ${
                    isCallActive
                      ? 'bg-gradient-to-t from-[#0066FF] to-[#60a5fa] shadow-[0_0_6px_#0066FF]'
                      : isProcessing
                      ? 'bg-[#0066FF]/60 animate-pulse'
                      : 'bg-slate-700/40'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Body: Real-Time Spoken Grounding & Adjudication Card */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-3.5 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30 flex items-center gap-3 text-xs text-[#58a6ff]">
            <Sparkles className="w-4 h-4 animate-spin text-[#0066FF]" />
            <span>Adjudicating claim against {currentPolicy.title} clauses...</span>
          </div>
        )}

        {/* Adjudication Result Card */}
        {adjudication ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Verdict Headline Banner */}
            <div
              className={`p-4 rounded-xl border ${
                adjudication.verdict === 'COVERED'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : adjudication.verdict === 'PARTIALLY_COVERED'
                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1 ${
                      adjudication.verdict === 'COVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    Adjudication Status: {adjudication.verdict.replace('_', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                    {adjudication.verdictHeadline}
                  </h4>
                </div>

                {/* Spoken Audio Replay */}
                <button
                  onClick={() => onReplayAudio(adjudication.spokenExplanation)}
                  className="shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex items-center gap-1.5 text-xs"
                  title="Listen to Spoken Explanation"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-[#0066FF] animate-pulse' : 'text-slate-300'}`} />
                  <span className="hidden sm:inline">Listen</span>
                </button>
              </div>

              {/* Spoken Plain Speech Explanation (Minimalism, no wall of text!) */}
              <div className="mt-3 p-3 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-[#0066FF]" />
                  <span>Spoken Voice Response (To Caller)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed italic">
                  &ldquo;{adjudication.spokenExplanation}&rdquo;
                </p>
              </div>

              {/* Deductible & Limit Info */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Applicable Deductible</span>
                  <span className="text-white font-semibold">{adjudication.deductibleSummary}</span>
                </div>
                {adjudication.coverageLimit && (
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Coverage Limit</span>
                    <span className="text-white font-semibold">{adjudication.coverageLimit}</span>
                  </div>
                )}
              </div>

              {/* Policy Grounding: Clickable Clause Pill */}
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Grounded in:</span>
                  <button
                    onClick={() => onSelectClause(adjudication.applicableClause)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0066FF]/20 hover:bg-[#0066FF]/35 text-[#58a6ff] hover:text-white border border-[#0066FF]/40 text-xs font-semibold font-mono transition cursor-pointer"
                  >
                    <span>{adjudication.applicableClause}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => onOpenFnolModal(adjudication.fnolDraft)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#58a6ff]" />
                  <span>Draft FNOL Notice</span>
                </button>
              </div>
            </div>

            {/* Quoted Clause Detail */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Policy Document Excerpt
              </div>
              <p className="text-slate-300 font-mono text-[11px] leading-relaxed border-l-2 border-[#0066FF] pl-2.5 my-1">
                &ldquo;{adjudication.clauseQuote}&rdquo;
              </p>
            </div>

            {/* Caller Immediate Action Items Checklist */}
            {adjudication.callerNextSteps?.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                <h5 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recommended Caller Actions</span>
                </h5>
                <ul className="space-y-1.5">
                  {adjudication.callerNextSteps.map((step, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-white/10 text-slate-300 text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Waiting state */
          <div className="py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <PhoneCall className="w-6 h-6 text-[#0066FF]" />
            </div>
            <h4 className="text-sm font-semibold text-white">
              Ready for Caller Inquiry or Claim Notice
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Start a live voice call, speak out loud, or click any sample scenario below to test real-time policy grounding.
            </p>
          </div>
        )}

        {/* Quick Test Scenarios for Evaluators / Callers */}
        <div className="pt-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Sample Caller Inquiries ({currentPolicy.category} Policy)
          </label>
          <div className="space-y-2">
            {currentPolicy.sampleScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleScenarioClick(scenario)}
                className={`w-full p-3 rounded-xl text-left border transition cursor-pointer ${
                  activeScenarioId === scenario.id
                    ? 'bg-[#0066FF]/15 border-[#0066FF]/50 text-white shadow-sm'
                    : 'bg-slate-900/50 hover:bg-slate-900/80 border-white/5 text-slate-300 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">
                    {scenario.title}
                  </span>
                  <span className="text-[10px] text-[#58a6ff] font-mono">
                    {scenario.expectedClause}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  &ldquo;{scenario.query}&rdquo;
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Text Input Alternative */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-900/60">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type claim description or question (or speak out loud)..."
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            disabled={isProcessing}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#0066FF]"
          />
          <button
            type="submit"
            disabled={!typedMessage.trim() || isProcessing}
            className="p-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] disabled:bg-slate-800 disabled:text-slate-500 text-white transition cursor-pointer"
            title="Send Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
