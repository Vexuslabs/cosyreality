import React, { useState } from 'react';
import {
  Building,
  Layers,
  Globe,
  Users,
  CalendarCheck,
  CheckCircle2,
  Receipt,
  Award,
  GitFork,
  Calculator,
  ShieldCheck,
  Banknote,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export const DashboardFlowcharts: React.FC = () => {
  const [expanded, setExpanded] = useState(true);

  const businessFlowSteps = [
    { id: 1, title: 'Project Created', desc: 'Master development profile', icon: Building, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 2, title: 'Inventory Added', desc: 'Plots & units mapped', icon: Layers, color: 'text-[#CCA02E]', bg: 'bg-amber-50' },
    { id: 3, title: 'Project Published', desc: 'Live on public portal', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 4, title: 'Customer Lead', desc: 'Inquiry captured in CRM', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 5, title: 'Site Visit', desc: 'Assisted client tour', icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 6, title: 'Property Booking', desc: 'Token & agreement logged', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 7, title: 'Eligible Collection', desc: 'Cleared bank proceeds', icon: Receipt, color: 'text-amber-700', bg: 'bg-amber-100/60' },
    { id: 8, title: 'Tx Qualification', desc: 'Commission criteria met', icon: Award, color: 'text-[#103858]', bg: 'bg-slate-100' },
    { id: 9, title: 'Level Mapping', desc: '10-Tier upline hierarchy', icon: GitFork, color: 'text-indigo-700', bg: 'bg-indigo-50' },
    { id: 10, title: 'Calculation', desc: 'Pool & upfront split', icon: Calculator, color: 'text-blue-700', bg: 'bg-blue-50' },
    { id: 11, title: 'Admin Approval', desc: 'Executive clearance', icon: ShieldCheck, color: 'text-purple-700', bg: 'bg-purple-50' },
    { id: 12, title: 'Bank Payout', desc: 'Direct bank settlement', icon: Banknote, color: 'text-[#16A34A]', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header with Collapse toggle */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#103858]" />
            <h3 className="text-base sm:text-lg font-bold text-[#103858]">
              Standard Real Estate Operating Flows & Lifecycle
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Architectural reference diagrams for development, inventory, CRM, and settlement lifecycle
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
        >
          <span>{expanded ? 'Collapse Flows' : 'Expand Flows'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* 1. Complete End-to-End Business Flow Stepper */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#103858]">
                Master Enterprise Business Flow
              </span>
              <span className="text-[11px] text-slate-400">12 Connected Lifecycle Nodes</span>
            </div>

            {/* Stepper Grid (Horizontal on desktop with subtle connectors) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {businessFlowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className={`p-1.5 rounded-lg ${step.bg} ${step.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-[#103858] mt-2 group-hover:text-black">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {step.desc}
                      </p>
                    </div>

                    {idx < businessFlowSteps.length - 1 && (
                      <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-300">
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Three Modular Sub-Flowcards: Inventory, CRM, Commission */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-slate-100">
            {/* Subflow A: Inventory Lifecycle */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#103858] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#CCA02E]" />
                  <span>Inventory State Flow</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-semibold">Live Statuses</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>1. Property Created</span>
                  <span className="text-[10px] text-slate-400">Draft / Master</span>
                </div>
                <div className="text-center text-slate-300 text-xs">↓</div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span>Booking Open</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">Available</span>
                </div>
                <div className="text-center text-slate-300 text-xs">↓</div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
                    <span>Waiting / Hold</span>
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">Under Token</span>
                </div>
                <div className="text-center text-slate-300 text-xs">↓</div>
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                    <span>Sold</span>
                  </span>
                  <span className="text-[10px] text-rose-700 font-medium">Registry Done</span>
                </div>
              </div>
            </div>

            {/* Subflow B: Lead Conversion Funnel */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#103858] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lead Conversion Flow</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-semibold">CRM Path</span>
              </div>

              <div className="space-y-1.5 text-xs font-semibold">
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-between">
                  <span>New Lead</span>
                  <span className="text-[10px] text-slate-400">Web / Referral</span>
                </div>
                <div className="text-center text-slate-300 text-[11px] leading-none">↓</div>
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-between">
                  <span>Contacted → Interested</span>
                  <span className="text-[10px] text-indigo-600">Qualification</span>
                </div>
                <div className="text-center text-slate-300 text-[11px] leading-none">↓</div>
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-between">
                  <span>Site Visit → Negotiation</span>
                  <span className="text-[10px] text-purple-600">Tour & Terms</span>
                </div>
                <div className="text-center text-slate-300 text-[11px] leading-none">↓</div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-between">
                  <span>Booking → Closed Won</span>
                  <span className="text-[10px] text-emerald-700">Deals Finalized</span>
                </div>
                <div className="p-1.5 rounded-lg bg-rose-50/70 border border-rose-200 text-[11px] text-rose-700 font-medium flex items-center justify-between mt-1">
                  <span>Side Outcome: Closed Lost</span>
                  <span className="text-[10px] text-rose-500">Archived</span>
                </div>
              </div>
            </div>

            {/* Subflow C: Commission Settlement Flow */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#103858] uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#103858]" />
                  <span>Commission Settlement</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-semibold">10-Tier Engine</span>
              </div>

              <div className="space-y-1.5 text-xs font-semibold">
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-between">
                  <span>1. Property Transaction</span>
                  <span className="text-[10px] text-slate-400">Deal Registered</span>
                </div>
                <div className="text-center text-slate-300 text-[11px] leading-none">↓</div>
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-between">
                  <span>2. Eligible Collection</span>
                  <span className="text-[10px] text-amber-700">Cleared Funds</span>
                </div>
                <div className="text-center text-slate-300 text-[11px] leading-none">↓</div>
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-between">
                  <span>3. 10-Level Calculation</span>
                  <span className="text-[10px] text-blue-700">20% Total Pool</span>
                </div>
                <div className="text-center text-slate-300 text-[11px] leading-none">↓</div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-between">
                  <span>4. Approval & Bank Payout</span>
                  <span className="text-[10px] text-emerald-700">UTR Recorded</span>
                </div>
                <div className="text-[10px] text-slate-400 italic text-center pt-0.5">
                  Illustrative operational flow; subject to policy.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
