import React from 'react';
import { Shield, Sparkles, Activity, FileText, Info } from 'lucide-react';

interface HeaderProps {
  isCallActive: boolean;
  isScreenSharing: boolean;
  onOpenInfo: () => void;
  onOpenFnolList: () => void;
  fnolCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isCallActive,
  isScreenSharing,
  onOpenInfo,
  onOpenFnolList,
  fnolCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#003da5] flex items-center justify-center shadow-[0_0_20px_rgba(0,102,255,0.4)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                NS<span className="text-[#0066FF]">OFFICE</span>.AI
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#0066FF]/15 text-[#58a6ff] border border-[#0066FF]/30 font-medium">
                BFSI Insurance
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal hidden sm:block">
              AI Centre of Excellence • Live Policy & Claims Voice Assistant
            </p>
          </div>
        </div>

        {/* Live Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Call Status Indicator */}
          {isCallActive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Live Call Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-white/10 text-slate-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span>Live Assistant Ready</span>
            </div>
          )}

          {/* Screen Sharing Status */}
          {isScreenSharing && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0066FF]/15 border border-[#0066FF]/40 text-[#58a6ff] text-xs font-medium">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Screen Aware</span>
            </div>
          )}

          {/* Model Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#0066FF]" />
            <span>Gemini Live API</span>
          </div>

          {/* FNOL Claims Button */}
          <button
            onClick={onOpenFnolList}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition cursor-pointer"
            title="View Recorded FNOL Claims"
          >
            <FileText className="w-4 h-4 text-[#58a6ff]" />
            <span className="hidden sm:inline">Claims</span>
            {fnolCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0066FF] text-white text-[10px] flex items-center justify-center font-bold">
                {fnolCount}
              </span>
            )}
          </button>

          {/* Architecture & Info */}
          <button
            onClick={onOpenInfo}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition cursor-pointer"
            title="Assignment Details & System Architecture"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
