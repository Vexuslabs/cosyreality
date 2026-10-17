import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, LeadStage } from '../../../types';
import {
  Users,
  PhoneCall,
  Sparkles,
  CalendarCheck,
  Handshake,
  CheckCircle2,
  Trophy,
  XCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface DashboardLeadPipelineProps {
  leads?: Lead[];
}

interface PipelineStageDef {
  key: LeadStage;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const PIPELINE_STAGES: PipelineStageDef[] = [
  {
    key: 'new',
    label: 'New Leads',
    shortLabel: 'New',
    icon: Users,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50/70 hover:bg-blue-100/70',
    borderColor: 'border-blue-200',
  },
  {
    key: 'contacted',
    label: 'Contacted',
    shortLabel: 'Contacted',
    icon: PhoneCall,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50/70 hover:bg-indigo-100/70',
    borderColor: 'border-indigo-200',
  },
  {
    key: 'interested',
    label: 'Interested',
    shortLabel: 'Interested',
    icon: Sparkles,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50/70 hover:bg-amber-100/70',
    borderColor: 'border-amber-200',
  },
  {
    key: 'site_visit',
    label: 'Site Visit',
    shortLabel: 'Site Visit',
    icon: CalendarCheck,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50/70 hover:bg-purple-100/70',
    borderColor: 'border-purple-200',
  },
  {
    key: 'negotiation',
    label: 'Negotiation',
    shortLabel: 'Negotiate',
    icon: Handshake,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50/70 hover:bg-cyan-100/70',
    borderColor: 'border-cyan-200',
  },
  {
    key: 'booking',
    label: 'Booking Initiated',
    shortLabel: 'Booking',
    icon: CheckCircle2,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50/70 hover:bg-emerald-100/70',
    borderColor: 'border-emerald-200',
  },
  {
    key: 'closed_won',
    label: 'Closed Won',
    shortLabel: 'Won',
    icon: Trophy,
    color: 'text-[#16A34A]',
    bgColor: 'bg-emerald-100/80 hover:bg-emerald-200/80',
    borderColor: 'border-emerald-300',
  },
];

export const DashboardLeadPipeline: React.FC<DashboardLeadPipelineProps> = ({ leads = [] }) => {
  const navigate = useNavigate();
  const safeLeads = leads ?? [];

  // Count leads per stage
  const countsByStage: Record<string, number> = {};
  safeLeads.forEach((l) => {
    if (!l) return;
    const st = l.stage || (l as any).status || 'new';
    countsByStage[st] = (countsByStage[st] || 0) + 1;
  });

  const totalLeads = safeLeads.length;
  const closedLostCount = (countsByStage['closed_lost'] || 0);
  const closedWonCount = (countsByStage['closed_won'] || 0);

  const activePipelineLeads = totalLeads - closedLostCount;
  const conversionRate =
    totalLeads > 0 ? ((closedWonCount / totalLeads) * 100).toFixed(1) : '0.0';

  const handleStageClick = (stageKey: string) => {
    navigate(`/admin/leads?stage=${stageKey}`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#103858]" />
            <h3 className="text-base sm:text-lg font-bold text-[#103858]">
              Lead Conversion Funnel & CRM Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage-wise conversion metrics from initial inquiry to closed deals ({totalLeads} Total Inquiries)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Win Conversion
            </span>
            <span className="text-sm font-black text-[#16A34A]">
              {conversionRate}% Won
            </span>
          </div>
          <button
            onClick={() => navigate('/admin/leads')}
            className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] flex items-center gap-1 transition-colors ml-2"
          >
            <span>Open CRM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Pipeline Flow */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {PIPELINE_STAGES.map((stage, idx) => {
          const count = countsByStage[stage.key] || 0;
          const percentage =
            totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
          const Icon = stage.icon;

          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => handleStageClick(stage.key)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative group flex flex-col justify-between ${stage.bgColor} ${stage.borderColor} cursor-pointer`}
              title={`View all leads in ${stage.label}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    0{idx + 1}
                  </span>
                  <Icon className={`w-4 h-4 ${stage.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="text-xs font-bold text-[#103858] mt-2 group-hover:text-black">
                  {stage.label}
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xl font-black text-[#103858]">
                  {count}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {percentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Side Outcomes & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-500">
          <span className="font-semibold text-slate-700">
            Active in Pipeline: <strong className="text-[#103858]">{activePipelineLeads} Leads</strong>
          </span>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => handleStageClick('closed_lost')}
            className="flex items-center gap-1.5 text-rose-700 hover:underline font-semibold"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Closed Lost / Dropped ({closedLostCount})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          Click any funnel stage to filter the live CRM leads list.
        </div>
      </div>
    </div>
  );
};
