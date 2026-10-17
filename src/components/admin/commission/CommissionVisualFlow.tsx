import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Building2,
  UserCheck,
  Calculator,
  Percent,
  Split,
  IndianRupee,
  Layers,
  Banknote,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { BUSINESS_PLAN_DISCLOSURE } from '../../../services/commissionService';
import { formatINR } from '../../../utils/formatters';

interface CommissionVisualFlowProps {
  directRate?: number;
  matchingRate?: number;
  matchingRatio?: string;
  matchingBasis?: string;
  className?: string;
}

export const CommissionVisualFlow: React.FC<CommissionVisualFlowProps> = ({
  directRate = 10,
  matchingRate = 10,
  matchingRatio = '1:1',
  matchingBasis = 'unconfigured',
  className = '',
}) => {
  const [activeWorkflow, setActiveWorkflow] = useState<'both' | 'direct' | 'matching'>('both');

  const getBasisLabel = (basis: string) => {
    switch (basis) {
      case 'matched_business_volume':
        return 'Matched Business Volume';
      case 'matched_commission':
        return 'Matched Commission Basis';
      case 'company_approved':
        return 'Company-Approved Framework';
      default:
        return 'Pending Configuration';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Workflow Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#103858]/5 text-[#103858] text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5 text-[#CCA02E]" />
            <span>Operational Architecture</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#103858]">
            Commission Qualification & Execution Flows
          </h3>
          <p className="text-xs text-slate-500">
            End-to-end verification and calculation pipeline for Direct Referral and 1:1 Matching Bonus.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveWorkflow('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeWorkflow === 'both'
                ? 'bg-[#103858] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#103858]'
            }`}
          >
            All Workflows
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkflow('direct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeWorkflow === 'direct'
                ? 'bg-[#CCA02E] text-[#103858] shadow-xs'
                : 'text-slate-600 hover:text-[#103858]'
            }`}
          >
            Direct Referral ({directRate}%)
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkflow('matching')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeWorkflow === 'matching'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-[#103858]'
            }`}
          >
            1:1 Matching Bonus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ======================================================== */}
        {/* WORKFLOW 1: DIRECT REFERRAL FLOW                         */}
        {/* ======================================================== */}
        {(activeWorkflow === 'both' || activeWorkflow === 'direct') && (
          <div className="bg-gradient-to-b from-amber-50/40 via-white to-white rounded-3xl border border-amber-200/70 p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-amber-100 pb-3.5 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#CCA02E] text-[#103858] font-black flex items-center justify-center text-sm shadow-xs">
                    10%
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#103858] text-base">Direct Referral Pipeline</h4>
                    <p className="text-[11px] text-slate-500">
                      Standard {directRate}% rate on verified property value
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#CCA02E]/20 text-[#103858] uppercase tracking-wide">
                  Direct Channel
                </span>
              </div>

              {/* Vertical Steps */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#CCA02E] before:to-emerald-500">
                {/* Step 1 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#103858] text-[#CCA02E] flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                    1
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#CCA02E] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#103858] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#CCA02E]" />
                        Customer / Property Transaction
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Mandatory
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Sale registered on verified inventory. Leads alone NEVER qualify.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#103858] text-[#CCA02E] flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                    2
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#CCA02E] transition-all">
                    <span className="text-xs font-bold text-[#103858] flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      Direct Associate Identified
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Direct channel partner verified with signed agreement and active KYC.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#103858] text-[#CCA02E] flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                    3
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#CCA02E] transition-all">
                    <span className="text-xs font-bold text-[#103858] flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                      Qualifying Plot Value
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Base benchmark property value registered (e.g. ₹10,00,000 standard reference).
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#103858] text-[#CCA02E] flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                    4
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#CCA02E] transition-all">
                    <span className="text-xs font-bold text-[#103858] flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                      Eligibility & Collection Check
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Verification of client payment clearance and compliance documentation.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#103858] text-[#CCA02E] flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                    5
                  </div>
                  <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#CCA02E]/40 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#103858] flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-[#CCA02E]" />
                        {directRate}% Direct Referral Calculation
                      </span>
                      <span className="text-[10px] font-black text-[#103858] bg-[#CCA02E]/20 px-2 py-0.5 rounded">
                        Rate: {directRate}%
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] bg-white p-2 rounded-lg border border-slate-100 text-slate-700 font-mono">
                      ₹10,00,000 Plot Value × {directRate}% = ₹{formatINR((1000000 * directRate) / 100)} Commission
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1.5 font-medium">
                      ✓ Mapped cleanly with Level 1 to prevent double-payout.
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#103858] text-[#CCA02E] flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                    6
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#CCA02E] transition-all">
                    <span className="text-xs font-bold text-[#103858] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#103858]" />
                      Admin Approval
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Super Admin or Sales Admin verification before ledger confirmation.
                    </p>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                    ✓
                  </div>
                  <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      Disbursement / Payout
                    </span>
                    <p className="text-[11px] text-emerald-800 mt-1">
                      Released per scheduled milestone (Upfront 25% + 36m or 60m tenure balance).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Summary Pill */}
            <div className="pt-2">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-[11px] text-slate-700 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-[#CCA02E] shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Double Payout Protection:</strong> Level 1 is synchronized directly with the Direct Referral benefit. Double commission on the same transaction is blocked unless explicitly enabled.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* WORKFLOW 2: 1:1 MATCHING BONUS FLOW                      */}
        {/* ======================================================== */}
        {(activeWorkflow === 'both' || activeWorkflow === 'matching') && (
          <div className="bg-gradient-to-b from-blue-50/30 via-white to-white rounded-3xl border border-blue-200/70 p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-blue-100 pb-3.5 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#103858] text-[#CCA02E] font-black flex items-center justify-center text-sm shadow-xs">
                    1:1
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#103858] text-base">Matching Bonus Pipeline</h4>
                    <p className="text-[11px] text-slate-500">
                      Two-sided network volume alignment with carry-forward engine
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-[#103858] uppercase tracking-wide">
                  Dual-Side Matrix
                </span>
              </div>

              {/* Converging 1:1 Matching Diagram */}
              <div className="space-y-4">
                {/* 2-Column Converging Node */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                    Network Business Generation
                  </div>
                  <div className="grid grid-cols-2 gap-3 relative">
                    {/* Side A */}
                    <div className="p-3 rounded-xl bg-white border border-blue-200 text-center shadow-xs">
                      <span className="text-[10px] font-extrabold text-blue-700 uppercase block">
                        Side A / Left
                      </span>
                      <span className="text-xs font-black text-[#103858] block mt-0.5">
                        Eligible Business
                      </span>
                      <span className="text-[10px] text-slate-400">e.g. ₹15,00,000</span>
                    </div>

                    {/* Side B */}
                    <div className="p-3 rounded-xl bg-white border border-blue-200 text-center shadow-xs">
                      <span className="text-[10px] font-extrabold text-blue-700 uppercase block">
                        Side B / Right
                      </span>
                      <span className="text-xs font-black text-[#103858] block mt-0.5">
                        Eligible Business
                      </span>
                      <span className="text-[10px] text-slate-400">e.g. ₹10,00,000</span>
                    </div>
                  </div>

                  {/* Converging Match Badge */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="px-3.5 py-1 rounded-full bg-[#103858] text-[#CCA02E] text-xs font-black shadow-md flex items-center gap-1.5 border border-white">
                      <Split className="w-3.5 h-3.5" />
                      <span>1:1 MATCH = ₹10,00,000</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-500 mt-3">
                    Unmatched <strong className="text-blue-700">₹5,00,000 on Side A</strong> carried forward to next cycle.
                  </div>
                </div>

                {/* Vertical Pipeline Continuation */}
                <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-600 before:to-emerald-600">
                  {/* Step A */}
                  <div className="relative group">
                    <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#103858] text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                      A
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-[#103858] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Qualification Check
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Verifies active associate standing, minimum active legs, and compliant sales.
                      </p>
                    </div>
                  </div>

                  {/* Step B */}
                  <div className="relative group">
                    <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#103858] text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                      B
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#103858] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-purple-600" />
                          Matching Basis Check
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            matchingBasis === 'unconfigured'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {getBasisLabel(matchingBasis)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Calculation base required (Matched Business Volume or Matched Commission).
                      </p>
                    </div>
                  </div>

                  {/* Step C */}
                  <div className="relative group">
                    <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#103858] text-[#CCA02E] flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                      C
                    </div>
                    <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#CCA02E]/40 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#103858] flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-[#CCA02E]" />
                          {matchingRate}% Matching Bonus Calculation
                        </span>
                        <span className="text-[10px] font-black text-[#103858] bg-[#CCA02E]/20 px-2 py-0.5 rounded">
                          Ratio: {matchingRatio}
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] bg-white p-2 rounded-lg border border-slate-100 text-slate-700 font-mono">
                        {matchingBasis === 'matched_business_volume'
                          ? `₹10,00,000 Matched Volume × ${matchingRate}% = ₹${formatINR((1000000 * matchingRate) / 100)} Bonus`
                          : 'Calculation basis pending Admin configuration.'}
                      </div>
                    </div>
                  </div>

                  {/* Step D */}
                  <div className="relative group">
                    <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#103858] text-[#CCA02E] flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                      D
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-[#103858] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#103858]" />
                        Admin Approval
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Manual executive approval required before bonus credits are released.
                      </p>
                    </div>
                  </div>

                  {/* Step E */}
                  <div className="relative group">
                    <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                      ✓
                    </div>
                    <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
                      <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        Bonus Payout
                      </span>
                      <p className="text-[11px] text-emerald-800 mt-1">
                        Credited to associate ledger following flush cycle clearance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matching Basis Status Banner */}
            <div className="pt-2">
              <div
                className={`p-3 rounded-2xl text-[11px] leading-relaxed flex items-start gap-2 border ${
                  matchingBasis === 'unconfigured'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <AlertCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    matchingBasis === 'unconfigured' ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                />
                <span>
                  {matchingBasis === 'unconfigured'
                    ? 'Matching qualification rules are pending configuration. Matching Bonus is never automatically calculated or credited until Admin explicitly selects a calculation basis.'
                    : `Active Calculation Basis: ${getBasisLabel(matchingBasis)}. Carry forward enabled.`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Legal Disclosure Banner */}
      <div className="p-4 rounded-2xl bg-[#103858]/5 border border-[#103858]/10 text-slate-600 text-xs leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[#CCA02E] shrink-0 mt-0.5" />
        <p className="text-[11px] sm:text-xs text-slate-600">
          <strong>Official Disclosure:</strong> {BUSINESS_PLAN_DISCLOSURE}
        </p>
      </div>
    </div>
  );
};
