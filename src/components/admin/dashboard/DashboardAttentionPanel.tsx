import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarCheck,
  UserCheck,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calculator,
} from 'lucide-react';
import { Lead, SiteVisit, Project, InventoryItem, CommissionRecord } from '../../../types';

interface DashboardAttentionPanelProps {
  leads?: Lead[];
  siteVisits?: SiteVisit[];
  projects?: Project[];
  inventory?: InventoryItem[];
  commissionRecords?: CommissionRecord[];
  isSuperAdmin?: boolean;
}

export const DashboardAttentionPanel: React.FC<DashboardAttentionPanelProps> = ({
  leads = [],
  siteVisits = [],
  projects = [],
  inventory = [],
  commissionRecords = [],
  isSuperAdmin = false,
}) => {
  const safeLeads = leads ?? [];
  const safeVisits = siteVisits ?? [];
  const safeProjects = projects ?? [];
  const safeInventory = inventory ?? [];
  const safeCommissions = commissionRecords ?? [];

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Follow-ups due today or overdue
  const followUpsDue = safeLeads.filter((l) => {
    if (!l?.followUpDate) return false;
    return l.followUpDate <= todayStr && l.stage !== 'closed_won' && l.stage !== 'closed_lost';
  });

  // 2. Unassigned new leads
  const unassignedNewLeads = safeLeads.filter((l) => l?.stage === 'new' && !l.assignedTo);

  // 3. Pending site visit confirmations (scheduled status)
  const pendingVisits = safeVisits.filter((v) => v?.status === 'scheduled');

  // 4. Commission records pending approval
  const pendingCommissions = safeCommissions.filter(
    (c) => c?.status === 'pending' || c?.status === 'eligible'
  );

  // 5. Projects with critically low available inventory (<= 2 units or < 15% booking open)
  const lowInventoryProjects = safeProjects.filter((p) => {
    if (!p?.id) return false;
    const projUnits = safeInventory.filter((i) => i?.projectId === p.id);
    if (projUnits.length === 0) return false;
    const bookingUnits = projUnits.filter((i) => i?.status === 'booking');
    return bookingUnits.length > 0 && bookingUnits.length <= 2;
  });

  const totalAlertsCount =
    followUpsDue.length +
    unassignedNewLeads.length +
    pendingVisits.length +
    (isSuperAdmin ? pendingCommissions.length : 0) +
    lowInventoryProjects.length;

  if (totalAlertsCount === 0) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span className="font-semibold">
            All operations normal — No urgent follow-ups, pending confirmations, or inventory bottlenecks.
          </span>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider hidden sm:inline">
          System Healthy
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/70 border border-amber-200/90 rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <h2 className="font-extrabold text-sm sm:text-base tracking-tight">
            Needs Management Attention ({totalAlertsCount})
          </h2>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
          Action Required
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* Follow Ups */}
        {followUpsDue.length > 0 && (
          <Link
            to="/admin/leads"
            className="p-3.5 bg-white rounded-2xl border border-amber-200/80 hover:border-amber-400 transition-all flex items-start justify-between gap-3 text-xs group"
          >
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#103858] font-bold block">
                  {followUpsDue.length} Follow-up{followUpsDue.length > 1 ? 's' : ''} Due
                </strong>
                <span className="text-slate-500 text-[11px]">
                  Scheduled for today or overdue
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#103858] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        )}

        {/* Unassigned Leads */}
        {unassignedNewLeads.length > 0 && (
          <Link
            to="/admin/leads?stage=new"
            className="p-3.5 bg-white rounded-2xl border border-amber-200/80 hover:border-amber-400 transition-all flex items-start justify-between gap-3 text-xs group"
          >
            <div className="flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#103858] font-bold block">
                  {unassignedNewLeads.length} Unassigned New Lead{unassignedNewLeads.length > 1 ? 's' : ''}
                </strong>
                <span className="text-slate-500 text-[11px]">
                  Awaiting staff assignment
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#103858] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        )}

        {/* Pending Visits */}
        {pendingVisits.length > 0 && (
          <Link
            to="/admin/site-visits"
            className="p-3.5 bg-white rounded-2xl border border-amber-200/80 hover:border-amber-400 transition-all flex items-start justify-between gap-3 text-xs group"
          >
            <div className="flex items-start gap-2.5">
              <CalendarCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#103858] font-bold block">
                  {pendingVisits.length} Site Visit{pendingVisits.length > 1 ? 's' : ''} to Confirm
                </strong>
                <span className="text-slate-500 text-[11px]">
                  Pending driver & time confirmation
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#103858] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        )}

        {/* Pending Commissions */}
        {isSuperAdmin && pendingCommissions.length > 0 && (
          <Link
            to="/admin/commissions"
            className="p-3.5 bg-white rounded-2xl border border-amber-200/80 hover:border-amber-400 transition-all flex items-start justify-between gap-3 text-xs group"
          >
            <div className="flex items-start gap-2.5">
              <Calculator className="w-4 h-4 text-[#CCA02E] mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#103858] font-bold block">
                  {pendingCommissions.length} Commission Approval{pendingCommissions.length > 1 ? 's' : ''}
                </strong>
                <span className="text-slate-500 text-[11px]">
                  Eligible records awaiting clearance
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#103858] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        )}

        {/* Low inventory */}
        {lowInventoryProjects.length > 0 && (
          <Link
            to="/admin/inventory"
            className="p-3.5 bg-white rounded-2xl border border-amber-200/80 hover:border-amber-400 transition-all flex items-start justify-between gap-3 text-xs group"
          >
            <div className="flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#103858] font-bold block">
                  {lowInventoryProjects.length} Project{lowInventoryProjects.length > 1 ? 's' : ''} Low on Inventory
                </strong>
                <span className="text-slate-500 text-[11px]">
                  ≤ 2 units available for booking
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#103858] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );
};
