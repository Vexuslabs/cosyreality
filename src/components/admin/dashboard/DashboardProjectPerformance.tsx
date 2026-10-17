import React from 'react';
import { Link } from 'react-router-dom';
import { Project, InventoryItem, Lead } from '../../../types';
import { Trophy, Building, ArrowRight, Layers, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatINRShort } from '../../../utils/formatters';

interface DashboardProjectPerformanceProps {
  projects?: Project[];
  inventory?: InventoryItem[];
  leads?: Lead[];
}

export const DashboardProjectPerformance: React.FC<DashboardProjectPerformanceProps> = ({
  projects = [],
  inventory = [],
  leads = [],
}) => {
  const safeProjects = projects ?? [];
  const safeInventory = inventory ?? [];
  const safeLeads = leads ?? [];

  if (safeProjects.length === 0) {
    return null;
  }

  // Calculate stats for each project
  const projectStats = safeProjects.map((p) => {
    if (!p) return null;
    const pUnits = safeInventory.filter((i) => i && i.projectId === p.id);
    const totalUnits = pUnits.length;
    const booking = pUnits.filter((i) => i && i.status === 'booking').length;
    const waiting = pUnits.filter((i) => i && i.status === 'waiting').length;
    const sold = pUnits.filter((i) => i && i.status === 'sold').length;

    const pLeads = safeLeads.filter((l) => l && (l.projectId === p.id || l.projectName === p.projectName)).length;

    const soldPct = totalUnits > 0 ? Math.round((sold / totalUnits) * 100) : 0;
    const waitingPct = totalUnits > 0 ? Math.round((waiting / totalUnits) * 100) : 0;
    const bookingPct = totalUnits > 0 ? Math.round((booking / totalUnits) * 100) : 0;

    return {
      project: p,
      totalUnits,
      booking,
      waiting,
      sold,
      pLeads,
      soldPct,
      waitingPct,
      bookingPct,
      velocityScore: sold * 3 + waiting * 2 + pLeads,
    };
  }).filter(Boolean) as Array<{
    project: Project;
    totalUnits: number;
    booking: number;
    waiting: number;
    sold: number;
    pLeads: number;
    soldPct: number;
    waitingPct: number;
    bookingPct: number;
    velocityScore: number;
  }>;

  // Sort by velocity (sold + waiting + inquiries)
  const topProject = [...projectStats].sort((a, b) => b.velocityScore - a.velocityScore)[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 1. Top Performing Project Insight Card */}
      {topProject && topProject.totalUnits > 0 && (
        <div className="lg:col-span-4 bg-gradient-to-br from-[#103858] to-[#0A2540] text-white rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-[#CCA02E]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#CCA02E]/20 text-[#CCA02E]">
                  <Trophy className="w-4 h-4" />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#CCA02E]">
                  Top Velocity Project
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                {topProject.project.projectType}
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {topProject.project.projectName}
              </h3>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                <span>{topProject.project.location || topProject.project.city}</span>
                {topProject.project.startingPrice > 0 && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span>Starts {formatINRShort(topProject.project.startingPrice)}</span>
                  </>
                )}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                <span className="text-base font-black text-white">{topProject.totalUnits}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Sold</span>
                <span className="text-base font-black text-emerald-400">{topProject.sold}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#CCA02E]/10 border border-[#CCA02E]/20">
                <span className="text-[10px] uppercase font-bold text-[#CCA02E] block">Open</span>
                <span className="text-base font-black text-[#CCA02E]">{topProject.booking}</span>
              </div>
            </div>

            {/* Visual Mini Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Occupancy / Absorption</span>
                <span className="font-bold text-[#CCA02E]">{topProject.soldPct}% Sold</span>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                <div style={{ width: `${topProject.soldPct}%` }} className="bg-rose-500" title={`Sold: ${topProject.soldPct}%`} />
                <div style={{ width: `${topProject.waitingPct}%` }} className="bg-amber-400" title={`Waiting: ${topProject.waitingPct}%`} />
                <div style={{ width: `${topProject.bookingPct}%` }} className="bg-[#16A34A]" title={`Booking: ${topProject.bookingPct}%`} />
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between relative z-10">
            <span className="text-[11px] text-slate-400">
              {topProject.pLeads} Active Inquiries
            </span>
            <Link
              to={`/admin/inventory?projectId=${topProject.project.id}`}
              className="text-xs font-bold text-[#CCA02E] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 2. All Projects Sales Progress / Occupancy List */}
      <div className={`${topProject && topProject.totalUnits > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-[#103858]">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                Project Occupancy & Sales Progress
              </h3>
              <p className="text-xs text-slate-500">Live absorption rates and inventory status per development</p>
            </div>
          </div>
          <Link
            to="/admin/projects"
            className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] flex items-center gap-1"
          >
            <span>All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Projects Progress List */}
        <div className="space-y-4">
          {projectStats.slice(0, 5).map((stat) => (
            <div
              key={stat.project.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#103858]">{stat.project.projectName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                    {stat.project.projectType}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>
                    Total: <strong className="text-[#103858]">{stat.totalUnits} Units</strong>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">
                    {stat.booking} Available ({stat.bookingPct}%)
                  </span>
                </div>
              </div>

              {/* Multi-segment Progress Bar */}
              {stat.totalUnits > 0 ? (
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${stat.soldPct}%` }}
                      className="bg-[#DC2626] transition-all"
                      title={`Sold: ${stat.sold} units (${stat.soldPct}%)`}
                    />
                    <div
                      style={{ width: `${stat.waitingPct}%` }}
                      className="bg-[#EAB308] transition-all"
                      title={`Waiting: ${stat.waiting} units (${stat.waitingPct}%)`}
                    />
                    <div
                      style={{ width: `${stat.bookingPct}%` }}
                      className="bg-[#16A34A] transition-all"
                      title={`Booking: ${stat.booking} units (${stat.bookingPct}%)`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                    <span className="flex items-center gap-1 text-rose-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                      Sold: {stat.sold} ({stat.soldPct}%)
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
                      Waiting: {stat.waiting} ({stat.waitingPct}%)
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      Available: {stat.booking} ({stat.bookingPct}%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic">
                  No inventory units mapped to this project yet.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
