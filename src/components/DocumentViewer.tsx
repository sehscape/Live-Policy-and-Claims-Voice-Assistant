import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  ExternalLink,
  Upload,
  Eye,
  Monitor,
  Sparkles,
  ChevronDown,
  Layers,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { InsurancePolicy, PolicyClause } from '../data/policies';

interface DocumentViewerProps {
  policies: InsurancePolicy[];
  currentPolicy: InsurancePolicy;
  onSelectPolicy: (policy: InsurancePolicy) => void;
  activeClauseId: string | null;
  highlightedText: string | null;
  onUploadCustomPolicy: (policy: InsurancePolicy) => void;
  isScreenSharing: boolean;
  isDocumentStreaming: boolean;
  onToggleScreenShare: () => void;
  onToggleDocumentStream: () => void;
  screenStreamRef: React.RefObject<HTMLVideoElement | null>;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  policies,
  currentPolicy,
  onSelectPolicy,
  activeClauseId,
  highlightedText,
  onUploadCustomPolicy,
  isScreenSharing,
  isDocumentStreaming,
  onToggleScreenShare,
  onToggleDocumentStream,
  screenStreamRef,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'clauses' | 'fullText' | 'screenPreview'>('clauses');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const clauseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to active clause when updated
  useEffect(() => {
    if (activeClauseId && clauseRefs.current[activeClauseId]) {
      clauseRefs.current[activeClauseId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeClauseId]);

  // Filter clauses by search query
  const filteredClauses = currentPolicy.clauses.filter((clause) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      clause.clauseNumber.toLowerCase().includes(q) ||
      clause.title.toLowerCase().includes(q) ||
      clause.content.toLowerCase().includes(q) ||
      clause.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  // Handle custom policy file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Create custom policy object
      const customPolicy: InsurancePolicy = {
        id: `custom-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        code: 'CUSTOM-UPLOAD',
        category: 'Auto',
        insurer: 'Custom Policyholder Contract',
        policyholder: 'Uploaded Document',
        policyNumber: `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
        effectivePeriod: 'Current Policy Term',
        status: 'Active',
        summary: {
          deductible: 'Subject to uploaded terms',
          coverageLimit: 'As specified in schedule',
          premium: 'Standard scheduled premium',
          specialNotes: 'User uploaded document file for live grounding',
        },
        clauses: [
          {
            id: 'custom-clause-1',
            section: 'Section I: General Provisions & Coverages',
            clauseNumber: 'Clause 1.0',
            title: 'Uploaded Document Terms & Perils',
            content: content.slice(0, 2000),
            tags: ['custom', 'uploaded', 'policy'],
          },
          {
            id: 'custom-clause-2',
            section: 'Section II: Exclusions & Conditions',
            clauseNumber: 'Clause 2.0',
            title: 'Deductibles, Exclusions and Claim Notification',
            content: content.length > 2000 ? content.slice(2000, 4500) : 'Standard terms apply.',
            tags: ['deductible', 'exclusions'],
          },
        ],
        sampleScenarios: [
          {
            id: 'custom-scenario-1',
            title: 'Uploaded Document Evaluation',
            query: 'Please review the coverage terms and deductibles under my uploaded policy document.',
            expectedClause: 'Clause 1.0',
            description: 'Evaluate uploaded policy terms against caller inquiry.',
          },
        ],
        fullDocumentText: content,
      };

      onUploadCustomPolicy(customPolicy);
    };
    reader.readAsText(file);
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Top Bar: Policy Selection & Awareness Controls */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Policy Selector Dropdown */}
          <div className="relative flex-1">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Active Policy Document
            </label>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-[#0066FF]/40 text-left transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF] shadow-[0_0_10px_#0066FF]"></span>
                <span className="text-sm font-semibold text-white truncate">
                  {currentPolicy.title}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono hidden md:inline">
                  {currentPolicy.code}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            </button>

            {/* Dropdown Options */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-40 rounded-xl glass-panel-elevated border border-white/15 py-1.5 shadow-2xl">
                {policies.map((pol) => (
                  <button
                    key={pol.id}
                    onClick={() => {
                      onSelectPolicy(pol);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-sm flex items-center justify-between hover:bg-white/10 transition cursor-pointer ${
                      pol.id === currentPolicy.id ? 'bg-[#0066FF]/15 text-[#58a6ff]' : 'text-slate-200'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-medium truncate">{pol.title}</div>
                      <div className="text-xs text-slate-400">{pol.category} • {pol.policyNumber}</div>
                    </div>
                    {pol.id === currentPolicy.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#0066FF] shrink-0 ml-2" />
                    )}
                  </button>
                ))}

                <div className="border-t border-white/10 my-1"></div>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:bg-[#0066FF]/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0066FF]" />
                  <span>Upload Custom Policy Document (.txt / .json)...</span>
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,.md,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Screen / Document Awareness Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-end">
            <button
              onClick={onToggleDocumentStream}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                isDocumentStreaming
                  ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-[0_0_15px_rgba(0,102,255,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
              title="Stream the active policy document frames directly to Gemini Live at 1 FPS"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isDocumentStreaming ? 'Doc Aware (Active)' : 'Stream Document'}</span>
            </button>

            <button
              onClick={onToggleScreenShare}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                isScreenSharing
                  ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
              title="Share entire screen or tab so Gemini Live can visually inspect whatever is on your monitor"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isScreenSharing ? 'Sharing Screen' : 'Share Screen'}</span>
            </button>
          </div>
        </div>

        {/* Policy Declarations Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-white/5 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Policyholder</span>
            <span className="text-white font-medium truncate block">{currentPolicy.policyholder}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Policy Number</span>
            <span className="text-slate-200 font-mono truncate block">{currentPolicy.policyNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deductibles</span>
            <span className="text-[#58a6ff] font-medium truncate block">{currentPolicy.summary.deductible}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Policy Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentPolicy.status}
            </span>
          </div>
        </div>

        {/* View Switcher & Search Bar */}
        <div className="flex items-center justify-between gap-3 mt-3.5 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/60 border border-white/5">
            <button
              onClick={() => setViewMode('clauses')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                viewMode === 'clauses'
                  ? 'bg-[#0066FF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Clauses ({currentPolicy.clauses.length})
            </button>
            <button
              onClick={() => setViewMode('fullText')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                viewMode === 'fullText'
                  ? 'bg-[#0066FF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Contract Text
            </button>
            {isScreenSharing && (
              <button
                onClick={() => setViewMode('screenPreview')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'screenPreview'
                    ? 'bg-[#0066FF] text-white shadow-sm'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                Screen Stream Live
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#0066FF]"
            />
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
        {/* Live Screen Preview Tab */}
        {viewMode === 'screenPreview' && isScreenSharing && (
          <div className="rounded-xl overflow-hidden border border-amber-500/40 bg-black/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Gemini Live Screen Feed (1 FPS Broadcast)</span>
              </div>
              <span className="text-[11px] text-slate-400">Gemini is viewing this screen</span>
            </div>
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10">
              <video
                ref={screenStreamRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-emerald-400 font-mono border border-emerald-500/30">
                LIVE CAPTURE ACTIVE
              </div>
            </div>
          </div>
        )}

        {/* Structured Clauses View */}
        {viewMode === 'clauses' && (
          <div className="space-y-3.5">
            {filteredClauses.map((clause) => {
              const isCited = activeClauseId === clause.id || activeClauseId === clause.clauseNumber;
              return (
                <div
                  key={clause.id}
                  ref={(el) => { clauseRefs.current[clause.id] = el; clauseRefs.current[clause.clauseNumber] = el; }}
                  className={`p-4 rounded-xl transition-all duration-300 border ${
                    isCited
                      ? 'active-clause-highlight border-[#0066FF] bg-[#0066FF]/15 text-white'
                      : 'bg-slate-900/50 hover:bg-slate-900/80 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#0066FF]/20 text-[#58a6ff] font-mono text-xs font-semibold border border-[#0066FF]/30">
                          {clause.clauseNumber}
                        </span>
                        <h4 className="text-sm font-semibold text-white">
                          {clause.title}
                        </h4>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {clause.section}
                      </div>
                    </div>

                    {isCited && (
                      <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0066FF] text-white text-[11px] font-medium shadow-[0_0_12px_rgba(0,102,255,0.6)]">
                        <Sparkles className="w-3 h-3" />
                        <span>Cited in Spoken Answer</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300 font-normal">
                    {clause.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-white/5">
                    {clause.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredClauses.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No policy clauses match &quot;{searchQuery}&quot;. Try searching for &quot;deductible&quot;, &quot;animal&quot;, or &quot;water&quot;.
              </div>
            )}
          </div>
        )}

        {/* Full Contract Text View */}
        {viewMode === 'fullText' && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-[#0066FF] selection:text-white">
            {currentPolicy.fullDocumentText}
          </div>
        )}
      </div>

      {/* Visualizer Footer Bar */}
      <div className="px-4 py-2.5 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Policy Document Ready & Grounded</span>
        </div>
        <div className="text-slate-400">
          Showing {currentPolicy.category} Policy • {currentPolicy.code}
        </div>
      </div>
    </div>
  );
};
