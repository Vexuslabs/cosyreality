import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  CalendarCheck,
  PhoneCall,
} from 'lucide-react';
import { Project, InventoryItem, Lead, SiteVisit, QualifyingTransaction, CommissionRecord } from '../../../types';
import { Skeleton } from '../../ui/Skeleton';

interface DashboardKpiGridProps {
  projects?: Project[];
  inventory?: InventoryItem[];
  leads?: Lead[];
  siteVisits?: SiteVisit[];
  transactions?: QualifyingTransaction[];
  commissionRecords?: CommissionRecord[];
  isSuperAdmin?: boolean;
  loading?: boolean;
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = ({
  projects = [],
  inventory = [],
  leads = [],
  siteVisits = [],
  loading = false,
}) => {
  const safeProjects = projects ?? [];
  const safeInventory = inventory ?? [];
  const safeLeads = leads ?? [];
  const safeVisits = siteVisits ?? [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // 1. Projects
  const totalProjects = safeProjects.length;
  const activeProjects = safeProjects.filter(
    (p) => p && p.active !== false && p.projectStatus !== 'Completed'
  ).length;

  // 2. Inventory breakdown
  const totalProperties = safeInventory.length;
  const bookingOpen = safeInventory.filter((i) => i && i.status === 'booking').length;
  const waitingHold = safeInventory.filter((i) => i && i.status === 'waiting').length;
  const sold = safeInventory.filter((i) => i && i.status === 'sold').length;

  // 3. Leads
  const newLeads = safeLeads.filter((l) => l && l.stage === 'new').length;

  // 4. Site visits
  const activeSiteVisits = safeVisits.filter(
    (v) => v && (v.status === 'scheduled' || v.status === 'confirmed')
  ).length;

  // 5. Follow-ups
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingFollowUps = safeLeads.filter((l) => {
    if (!l?.followUpDate) return false;
    return l.followUpDate <= todayStr && l.stage !== 'closed_won' && l.stage !== 'closed_lost';
  }).length;

  return (
    <div className="space-y-4">
      {/* Row 1: Primary Inventory & Projects */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Projects */}
        <Link to="/admin/projects" className="group">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-[#103858] transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Total Projects</span>
              <Building className="w-5 h-5 text-[#103858] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-[#103858]">
                {totalProjects}
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {activeProjects} Active & Ongoing
              </p>
            </div>
          </div>
        </Link>

        {/* Total Properties */}
        <Link to="/admin/inventory" className="group">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-[#103858] transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Total Properties</span>
              <Layers className="w-5 h-5 text-[#CCA02E] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-[#103858]">
                {totalProperties}
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Across all developments
              </p>
            </div>
          </div>
        </Link>

        {/* Booking Open (Green) */}
        <Link to="/admin/inventory?status=booking" className="group">
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs hover:border-emerald-500 transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
              <span>Booking Open</span>
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-[#16A34A]">
                {bookingOpen}
              </span>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Available for booking
              </p>
            </div>
          </div>
        </Link>

        {/* Waiting / Hold (Amber) */}
        <Link to="/admin/inventory?status=waiting" className="group">
          <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs hover:border-amber-500 transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
              <span>Waiting / Hold</span>
              <Clock className="w-5 h-5 text-[#EAB308] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-[#EAB308]">
                {waitingHold}
              </span>
              <p className="text-[11px] text-amber-700 font-medium mt-1">
                Temporarily on hold
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Row 2: Sales & CRM Velocity */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Sold (Rose) */}
        <Link to="/admin/inventory?status=sold" className="group">
          <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs hover:border-rose-500 transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
              <span>Sold Units</span>
              <XCircle className="w-5 h-5 text-[#DC2626] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-[#DC2626]">
                {sold}
              </span>
              <p className="text-[11px] text-rose-700 font-medium mt-1">
                No longer available
              </p>
            </div>
          </div>
        </Link>

        {/* New Leads */}
        <Link to="/admin/leads?stage=new" className="group">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-[#103858] transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>New Leads</span>
              <Users className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-[#103858]">
                {newLeads}
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Inbound inquiries
              </p>
            </div>
          </div>
        </Link>

        {/* Site Visits */}
        <Link to="/admin/site-visits" className="group">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-[#103858] transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Site Visits</span>
              <CalendarCheck className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-[#103858]">
                {activeSiteVisits}
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {siteVisits.length > 0 ? `${siteVisits.length} Total Visits` : 'No site visits yet'}
              </p>
            </div>
          </div>
        </Link>

        {/* Pending Follow-Ups */}
        <Link to="/admin/leads" className="group">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-[#103858] transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Pending Follow-Ups</span>
              <PhoneCall className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-[#103858]">
                {pendingFollowUps}
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Requires agent outreach
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
