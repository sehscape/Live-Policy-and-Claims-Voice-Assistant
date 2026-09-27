import React, { useState } from 'react';
import {
  FileText,
  X,
  Printer,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  User,
  Calendar,
  Layers,
  Download
} from 'lucide-react';
import { InsurancePolicy } from '../data/policies';
import { AdjudicationResult } from './LiveVoiceAssistant';

export interface FnolRecord {
  id: string;
  timestamp: string;
  policyNumber: string;
  policyTitle: string;
  insuredName: string;
  claimType: string;
  incidentSummary: string;
  verdict: string;
  applicableClause: string;
  estimatedDeductible: string;
  claimPriority: string;
  recommendedAction: string;
  status: 'Open' | 'Under Investigation' | 'Approved';
}

interface FnolModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClaim: AdjudicationResult['fnolDraft'] | null;
  adjudication: AdjudicationResult | null;
  policy: InsurancePolicy;
  onSaveClaim: (record: FnolRecord) => void;
}

export const FnolModal: React.FC<FnolModalProps> = ({
  isOpen,
  onClose,
  activeClaim,
  adjudication,
  policy,
  onSaveClaim,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !activeClaim) return null;

  const claimId = `FNOL-${policy.category.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const fullReportText = `=====================================================
NSOFFICE AI — FIRST NOTICE OF LOSS (FNOL) INTAKE REPORT
=====================================================
Claim Reference ID: ${claimId}
Date of Intake:     ${dateStr}
Policyholder:       ${policy.policyholder}
Policy Number:      ${policy.policyNumber}
Policy Type:        ${policy.title}
Insurer:            ${policy.insurer}

INCIDENT SUMMARY:
${activeClaim.incidentSummary}

CLAIMS ADJUDICATION:
Coverage Verdict:   ${adjudication?.verdict || 'COVERED'}
Grounded Clause:    ${adjudication?.applicableClause || 'Under review'}
Applicable Ded.:    ${activeClaim.estimatedDeductible}
Claim Priority:     ${activeClaim.claimPriority}

ACTION ITEMS FOR ADJUSTER:
${activeClaim.recommendedAction}

=====================================================
Intake generated automatically via Gemini Live Assistant
NSOffice AI Centre of Excellence — BFSI Insurance
=====================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const record: FnolRecord = {
      id: claimId,
      timestamp: dateStr,
      policyNumber: policy.policyNumber,
      policyTitle: policy.title,
      insuredName: policy.policyholder,
      claimType: activeClaim.claimType,
      incidentSummary: activeClaim.incidentSummary,
      verdict: adjudication?.verdict || 'COVERED',
      applicableClause: adjudication?.applicableClause || 'N/A',
      estimatedDeductible: activeClaim.estimatedDeductible,
      claimPriority: activeClaim.claimPriority,
      recommendedAction: activeClaim.recommendedAction,
      status: 'Open',
    };
    onSaveClaim(record);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-elevated rounded-2xl border border-white/15 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-[#58a6ff]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                First Notice of Loss (FNOL) Claim Intake
              </h3>
              <p className="text-xs text-slate-400">
                Official insurance claim adjudication record
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-white/5 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Claim Reference</span>
              <span className="text-white font-mono font-bold">{claimId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Intake Date</span>
              <span className="text-slate-200">{dateStr}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Claim Priority</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeClaim.claimPriority}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Policyholder</span>
              <span className="text-white">{policy.policyholder}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Policy Number</span>
              <span className="text-slate-200 font-mono">{policy.policyNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Loss Category</span>
              <span className="text-white">{activeClaim.claimType}</span>
            </div>
          </div>

          {/* Incident Description */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Caller Incident Summary
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              {activeClaim.incidentSummary}
            </p>
          </div>

          {/* Adjudication Verdict & Grounding */}
          <div className="p-4 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#58a6ff] uppercase font-bold tracking-wider">
                Adjudication & Clause Grounding
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {adjudication?.verdict || 'COVERED'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 shrink-0">Cited Clause:</span>
                <span className="text-white font-mono font-semibold">
                  {adjudication?.applicableClause || 'N/A'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 shrink-0">Estimated Deductible:</span>
                <span className="text-[#58a6ff] font-semibold">
                  {activeClaim.estimatedDeductible}
                </span>
              </div>
            </div>
          </div>

          {/* Adjuster Action Plan */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Next Actions for Claims Department
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeClaim.recommendedAction}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaved}
            className="px-5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-[0_0_15px_rgba(0,102,255,0.4)]"
          >
            {isSaved ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
            <span>{isSaved ? 'Saved to Records!' : 'Save to Claims Registry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ClaimsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims: FnolRecord[];
}

export const ClaimsListModal: React.FC<ClaimsListModalProps> = ({
  isOpen,
  onClose,
  claims,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-elevated rounded-2xl border border-white/15 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-[#58a6ff]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Recorded FNOL Claims Registry</h3>
              <p className="text-xs text-slate-400">{claims.length} claims filed this session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {claims.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No FNOL claims recorded yet. Discuss a claim with the voice assistant and click &quot;Draft FNOL Notice&quot;.
            </div>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white">{claim.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                    {claim.verdict}
                  </span>
                </div>
                <div className="text-slate-300 font-medium">{claim.incidentSummary}</div>
                <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px] pt-1 border-t border-white/5">
                  <span>Policy: {claim.policyNumber}</span>
                  <span>Clause: {claim.applicableClause}</span>
                  <span>Deductible: {claim.estimatedDeductible}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
