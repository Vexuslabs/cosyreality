import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Lead, SiteVisit, QualifyingTransaction, StatusHistory } from '../../../types';
import { TrendingUp, Compass, CalendarCheck, HelpCircle, Info, Calendar } from 'lucide-react';
import { parseDateSafe } from '../../../utils/formatters';

interface DashboardTrendsSectionProps {
  leads?: Lead[];
  siteVisits?: SiteVisit[];
  transactions?: QualifyingTransaction[];
  statusHistory?: StatusHistory[];
}

export const DashboardTrendsSection: React.FC<DashboardTrendsSectionProps> = ({
  leads = [],
  siteVisits = [],
  transactions = [],
  statusHistory = [],
}) => {
  const navigate = useNavigate();
  const safeLeads = leads ?? [];
  const safeVisits = siteVisits ?? [];
  const safeTransactions = transactions ?? [];

  // 1. Calculate Monthly Leads Trend (Last 6 Months)
  const monthMap: Record<string, { month: string; leads: number; timestamp: number }> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'short' });
    monthMap[key] = { month: label, leads: 0, timestamp: d.getTime() };
  }

  safeLeads.forEach((l) => {
    if (l?.createdAt) {
      const d = parseDateSafe(l.createdAt);
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthMap[key]) {
          monthMap[key].leads += 1;
        }
      }
    }
  });

  const monthlyLeadsData = Object.values(monthMap);
  const totalTrendLeads = monthlyLeadsData.reduce((acc, curr) => acc + curr.leads, 0);

  // 2. Calculate Lead Source Breakdown
  const sourceCounts: Record<string, number> = {};
  safeLeads.forEach((l) => {
    if (!l) return;
    const src = l.source ? l.source.trim() : 'Website';
    const normalized =
      src.toLowerCase().includes('what') ? 'WhatsApp' :
      src.toLowerCase().includes('insta') ? 'Instagram' :
      src.toLowerCase().includes('face') ? 'Facebook' :
      src.toLowerCase().includes('goog') ? 'Google' :
      src.toLowerCase().includes('walk') ? 'Walk-In' :
      src.toLowerCase().includes('ref') ? 'Referral' :
      src.toLowerCase().includes('assoc') ? 'Associate' :
      src.toLowerCase().includes('web') ? 'Website' : 'Direct / Other';

    sourceCounts[normalized] = (sourceCounts[normalized] || 0) + 1;
  });

  const sourceData = Object.entries(sourceCounts)
    .map(([source, count]) => ({
      source,
      count,
      percent: safeLeads.length > 0 ? Math.round((count / safeLeads.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const SOURCE_COLORS = ['#103858', '#CCA02E', '#2563EB', '#16A34A', '#8B5CF6', '#F59E0B'];

  // 3. Calculate Site Visit Status Breakdown
  const visitStatusMap: Record<string, number> = {
    scheduled: 0,
    confirmed: 0,
    visited: 0,
    completed: 0,
    cancelled: 0,
    follow_up: 0,
  };

  safeVisits.forEach((v) => {
    if (!v) return;
    const st = v.status || 'scheduled';
    visitStatusMap[st] = (visitStatusMap[st] || 0) + 1;
  });

  const visitDonutData = [
    { name: 'Scheduled / Requested', key: 'scheduled', value: visitStatusMap.scheduled, color: '#3B82F6' },
    { name: 'Confirmed', key: 'confirmed', value: visitStatusMap.confirmed, color: '#10B981' },
    { name: 'Visited / Done', key: 'visited', value: (visitStatusMap.visited || 0) + (visitStatusMap.completed || 0), color: '#8B5CF6' },
    { name: 'Follow-Up', key: 'follow_up', value: visitStatusMap.follow_up, color: '#F59E0B' },
    { name: 'Cancelled', key: 'cancelled', value: visitStatusMap.cancelled, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  // 4. Monthly Bookings / Sales Trend
  const hasSalesHistory = safeTransactions.length > 0;
  const salesMonthMap: Record<string, { month: string; sales: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'short' });
    salesMonthMap[key] = { month: label, sales: 0 };
  }

  safeTransactions.forEach((tx) => {
    if (tx?.createdAt) {
      const d = parseDateSafe(tx.createdAt);
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (salesMonthMap[key]) {
          salesMonthMap[key].sales += 1;
        }
      }
    }
  });
  const salesTrendData = Object.values(salesMonthMap);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 1. Monthly Leads Generation Trend (Line Chart) */}
      <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-[#103858]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                  Monthly Leads Trend
                </h3>
                <p className="text-xs text-slate-500">Inbound inquiry velocity over the last 6 months</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#103858] bg-slate-100 px-2.5 py-1 rounded-xl">
              {leads.length} Total
            </span>
          </div>

          {leads.length > 0 ? (
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyLeadsData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#103858] text-white text-xs px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-700">
                            <div className="font-bold text-sm">{label}</div>
                            <div className="text-slate-300 mt-1">
                              New Leads: <strong className="text-[#CCA02E]">{payload[0].value}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    name="Leads"
                    stroke="#103858"
                    strokeWidth={3}
                    dot={{ fill: '#CCA02E', r: 4, strokeWidth: 2, stroke: '#103858' }}
                    activeDot={{ r: 6, fill: '#CCA02E' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <TrendingUp className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No lead history yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Lead trends will appear after enquiries are received.</p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Derived from live enquiry timestamps</span>
          <button
            onClick={() => navigate('/admin/leads')}
            className="font-bold text-[#103858] hover:text-[#CCA02E]"
          >
            Manage Inquiries →
          </button>
        </div>
      </div>

      {/* 2. Lead Source Acquisition Channels */}
      <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-[#103858]">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                  Lead Acquisition Sources
                </h3>
                <p className="text-xs text-slate-500">Where are prospective clients finding Cosy Reality?</p>
              </div>
            </div>
          </div>

          {sourceData.length > 0 ? (
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sourceData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="source"
                    tick={{ fontSize: 11, fill: '#103858', fontWeight: 600 }}
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#103858] text-white text-xs px-3 py-2 rounded-xl shadow-lg">
                            <div className="font-bold">{d.source}</div>
                            <div className="text-slate-300">
                              {d.count} Leads ({d.percent}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#103858" radius={[0, 6, 6, 0]}>
                    {sourceData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Compass className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No lead source data available yet.</p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Marketing channels log</span>
          <span className="text-[11px] font-semibold text-[#103858]">Live CRM Data</span>
        </div>
      </div>

      {/* 3. Site Visit Status Breakdown */}
      <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-[#103858]">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                  Site Visit Status Matrix
                </h3>
                <p className="text-xs text-slate-500">Client site tour scheduling and status</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/site-visits')}
              className="text-xs font-bold text-[#103858] hover:text-[#CCA02E]"
            >
              Schedule →
            </button>
          </div>

          {siteVisits.length > 0 && visitDonutData.length > 0 ? (
            <div className="relative h-64 mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={() => navigate('/admin/site-visits')}
                    cursor="pointer"
                  >
                    {visitDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#103858] text-white text-xs px-3 py-2 rounded-xl shadow-lg">
                            <div className="font-bold">{d.name}</div>
                            <div className="text-slate-300">
                              {d.value} Visits ({Math.round((d.value / siteVisits.length) * 100)}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-black text-[#103858]">{siteVisits.length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Visits</span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <CalendarCheck className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No site visit data yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Visits scheduled through the website or admin will appear here.</p>
              <button
                onClick={() => navigate('/admin/site-visits')}
                className="text-xs font-bold text-[#103858] mt-3 underline cursor-pointer"
              >
                + Schedule Site Visit
              </button>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Site visits status log</span>
          <span className="text-[11px] font-semibold text-[#103858]">Verified Log</span>
        </div>
      </div>

      {/* 4. Monthly Bookings & Deals (Compliant & Real) */}
      <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-[#103858]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                  Monthly Property Bookings & Sales
                </h3>
                <p className="text-xs text-slate-500">Executed property transactions by date</p>
              </div>
            </div>
          </div>

          {hasSalesHistory ? (
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrendData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#103858] text-white text-xs px-3 py-2 rounded-xl shadow-lg">
                            <div className="font-bold">{label}</div>
                            <div className="text-slate-300">
                              Bookings: <strong className="text-[#16A34A]">{payload[0].value}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sales" name="Bookings" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100 mt-4 text-slate-500">
              <Info className="w-8 h-8 text-[#103858]/40 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Sales trend will appear once transaction dates are recorded.
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                To maintain regulatory compliance, historical sales charts are never fabricated.
              </p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Actual qualifying transaction log</span>
          <span className="text-[11px] font-semibold text-slate-600">Audit-Compliant</span>
        </div>
      </div>
    </div>
  );
};
