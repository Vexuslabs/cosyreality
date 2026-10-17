import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Users,
  ArrowRight,
  Clock,
  Phone,
  Compass,
  User,
} from 'lucide-react';
import { SiteVisit, Lead } from '../../../types';
import { formatDateTime, getLeadStageBadge } from '../../../utils/formatters';

interface DashboardTablesProps {
  siteVisits?: SiteVisit[];
  leads?: Lead[];
}

export const DashboardTables: React.FC<DashboardTablesProps> = ({
  siteVisits = [],
  leads = [],
}) => {
  const safeVisits = siteVisits ?? [];
  const safeLeads = leads ?? [];

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const getVisitDayTag = (dateStr: string) => {
    if (!dateStr) return { label: 'Upcoming', color: 'bg-slate-100 text-slate-700' };
    if (dateStr === todayStr) {
      return { label: 'Today', color: 'bg-rose-100 text-rose-800 font-bold animate-pulse' };
    }
    if (dateStr === tomorrowStr) {
      return { label: 'Tomorrow', color: 'bg-amber-100 text-amber-800 font-semibold' };
    }
    if (dateStr < todayStr) {
      return { label: 'Past', color: 'bg-slate-100 text-slate-500' };
    }
    return { label: 'Upcoming', color: 'bg-blue-50 text-blue-800 font-semibold' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 1. Upcoming Site Visits */}
      <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                  Upcoming Site Visits
                </h3>
                <p className="text-xs text-slate-500">Scheduled client site inspections</p>
              </div>
            </div>

            <Link
              to="/admin/site-visits"
              className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {siteVisits.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {siteVisits.slice(0, 5).map((visit) => {
                const dayTag = getVisitDayTag(visit.preferredDate);
                return (
                  <div
                    key={visit.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#103858]">{visit.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${dayTag.color}`}>
                          {dayTag.label}
                        </span>
                      </div>
                      <p className="text-slate-500">
                        {visit.projectName || 'General Inquiry'} • {visit.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-semibold text-slate-700 block">
                          {visit.preferredDate}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {visit.preferredTime || 'Anytime'}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {visit.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <CalendarCheck className="w-8 h-8 stroke-1 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No site visits scheduled.</p>
              <Link
                to="/admin/site-visits"
                className="text-xs font-bold text-[#103858] mt-2 inline-block underline"
              >
                + Schedule Site Visit
              </Link>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Free transportation coordination</span>
          <Link
            to="/admin/site-visits"
            className="font-bold text-[#103858] hover:text-[#CCA02E]"
          >
            Visit Calendar →
          </Link>
        </div>
      </div>

      {/* 2. Recent CRM Leads */}
      <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                  Recent Inbound Leads
                </h3>
                <p className="text-xs text-slate-500">Latest prospect inquiries across marketing channels</p>
              </div>
            </div>

            <Link
              to="/admin/leads"
              className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {leads.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {leads.slice(0, 5).map((lead) => {
                const badge = getLeadStageBadge(lead.stage || lead.status || 'new');
                return (
                  <div
                    key={lead.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#103858]">{lead.name}</span>
                        {lead.source && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            {lead.source}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500">
                        {lead.phone} {lead.projectName ? `• ${lead.projectName}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDateTime(lead.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Users className="w-8 h-8 stroke-1 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No leads received yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Inquiries from web and campaigns will appear here.</p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Inbound CRM queue</span>
          <Link
            to="/admin/leads"
            className="font-bold text-[#103858] hover:text-[#CCA02E]"
          >
            Manage CRM Leads →
          </Link>
        </div>
      </div>
    </div>
  );
};
