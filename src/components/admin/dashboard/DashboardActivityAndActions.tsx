import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  PlusCircle,
  Building,
  Layers,
  Users,
  CalendarCheck,
  UserCheck,
  Calculator,
  Settings,
  ArrowRight,
  Clock,
  Shield,
  FileText,
} from 'lucide-react';
import { AuditLog, StatusHistory } from '../../../types';
import { formatDateTime } from '../../../utils/formatters';

interface DashboardActivityAndActionsProps {
  auditLogs?: AuditLog[];
  statusHistory?: StatusHistory[];
  isSuperAdmin?: boolean;
}

export const DashboardActivityAndActions: React.FC<DashboardActivityAndActionsProps> = ({
  auditLogs = [],
  statusHistory = [],
  isSuperAdmin = false,
}) => {
  const safeLogs = auditLogs ?? [];
  const safeHistory = statusHistory ?? [];

  // Combine status history and audit logs into unified chronological feed
  const combinedActivities: Array<{
    id: string;
    action: string;
    description: string;
    user: string;
    timestamp: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [];

  // Add status changes
  safeHistory.forEach((h) => {
    if (!h) return;
    combinedActivities.push({
      id: h.id,
      action: 'Inventory Status Changed',
      description: `Unit ${h.unitNumber || 'Plot'} changed to ${(h.newStatus || 'AVAILABLE').toUpperCase()}${h.reason ? ` (${h.reason})` : ''}`,
      user: h.changedByName || h.changedBy || 'Staff',
      timestamp: typeof h.timestamp === 'number' ? h.timestamp : (h.createdAt ? new Date(h.createdAt).getTime() : Date.now()),
      icon: Layers,
      color: 'text-amber-600 bg-amber-50',
    });
  });

  // Add audit logs
  safeLogs.forEach((log) => {
    if (!log) return;
    let icon = Activity;
    let color = 'text-blue-600 bg-blue-50';

    if (log.action?.includes('project')) {
      icon = Building;
      color = 'text-blue-600 bg-blue-50';
    } else if (log.action?.includes('inventory')) {
      icon = Layers;
      color = 'text-emerald-600 bg-emerald-50';
    } else if (log.action?.includes('lead')) {
      icon = Users;
      color = 'text-indigo-600 bg-indigo-50';
    } else if (log.action?.includes('site_visit')) {
      icon = CalendarCheck;
      color = 'text-purple-600 bg-purple-50';
    } else if (log.action?.includes('commission') || log.action?.includes('transaction')) {
      icon = Calculator;
      color = 'text-[#CCA02E] bg-[#CCA02E]/10';
    } else if (log.action?.includes('associate')) {
      icon = UserCheck;
      color = 'text-cyan-600 bg-cyan-50';
    }

    const actionText = (log.action || 'System Action')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    combinedActivities.push({
      id: log.id,
      action: actionText,
      description: log.collection ? `Entity in ${log.collection}` : 'System operation',
      user: log.performedByName || log.userEmail || 'Administrator',
      timestamp: typeof log.timestamp === 'number' ? log.timestamp : (log.createdAt ? new Date(log.createdAt).getTime() : Date.now()),
      icon,
      color,
    });
  });

  // Sort latest first
  combinedActivities.sort((a, b) => b.timestamp - a.timestamp);
  const recentActivities = combinedActivities.slice(0, 8);

  const quickActions = [
    { label: 'Add Project', path: '/admin/projects', icon: Building, color: 'hover:border-blue-500 hover:text-blue-600' },
    { label: 'Add Inventory Unit', path: '/admin/inventory', icon: Layers, color: 'hover:border-emerald-500 hover:text-emerald-600' },
    { label: 'View Inbound Leads', path: '/admin/leads', icon: Users, color: 'hover:border-indigo-500 hover:text-indigo-600' },
    { label: 'Site Visit Tours', path: '/admin/site-visits', icon: CalendarCheck, color: 'hover:border-purple-500 hover:text-purple-600' },
    { label: 'Channel Associates', path: '/admin/associates', icon: UserCheck, color: 'hover:border-cyan-500 hover:text-cyan-600' },
    ...(isSuperAdmin
      ? [{ label: '10-Level Rates', path: '/admin/commission-plan', icon: Calculator, color: 'hover:border-[#CCA02E] hover:text-[#CCA02E]' }]
      : []),
    { label: 'Website Settings', path: '/admin/settings', icon: Settings, color: 'hover:border-slate-500 hover:text-slate-800' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 1. Recent Activity Timeline */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-[#103858]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                  Recent Activity Timeline
                </h3>
                <p className="text-xs text-slate-500">Live operational events, audit records, and inventory changes</p>
              </div>
            </div>

            {isSuperAdmin && (
              <Link
                to="/admin/audit-logs"
                className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] flex items-center gap-1 transition-colors"
              >
                <span>Full Audit Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#103858] text-xs sm:text-sm">
                          {act.action}
                        </h4>
                        <p className="text-slate-600 text-xs mt-0.5">{act.description}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          By: <strong className="text-slate-600">{act.user}</strong>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(act.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Activity className="w-8 h-8 stroke-1 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No recent activity recorded.</p>
              <p className="text-[11px] text-slate-400 mt-1">Operations and modifications will stream live here.</p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Real-time database triggers</span>
          <span className="text-[11px] font-semibold text-emerald-700">Audit Active</span>
        </div>
      </div>

      {/* 2. Quick Actions Panel */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-[#103858]">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                  Quick Management Actions
                </h3>
                <p className="text-xs text-slate-500">Direct shortcuts to frequent admin operations</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  to={action.path}
                  className={`p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs font-bold text-[#103858] flex items-center justify-between transition-all group ${action.color}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#103858] group-hover:scale-110 transition-transform" />
                    <span>{action.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-[#FAF8F3] rounded-2xl border border-[#CCA02E]/30 text-[11px] text-slate-600 flex items-center justify-between mt-4">
          <span>Need help with platform settings?</span>
          <Link
            to="/admin/settings"
            className="font-bold text-[#103858] hover:text-[#CCA02E] underline ml-2"
          >
            System Settings →
          </Link>
        </div>
      </div>
    </div>
  );
};
