import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Award,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Receipt,
  Banknote,
  Sliders,
  Info,
} from 'lucide-react';
import {
  CommissionRecord,
  QualifyingTransaction,
  Associate,
} from '../../../types';
import { formatINR, formatINRShort } from '../../../utils/formatters';
import { COMPLIANCE_DISCLAIMER, DEFAULT_COMMISSION_LEVELS } from '../../../services/commissionService';

interface DashboardCommissionSummaryProps {
  commissionRecords?: CommissionRecord[];
  transactions?: QualifyingTransaction[];
  associates?: Associate[];
  isSuperAdmin?: boolean;
}

export const DashboardCommissionSummary: React.FC<DashboardCommissionSummaryProps> = ({
  commissionRecords = [],
  transactions = [],
  associates = [],
  isSuperAdmin = false,
}) => {
  const [calcPropertyValue, setCalcPropertyValue] = useState<number>(1000000); // ₹10,00,000 default

  const safeCommissions = commissionRecords ?? [];
  const safeTransactions = transactions ?? [];
  const safeAssociates = associates ?? [];

  // Metrics from real records
  const totalTransactionsCount = safeTransactions.length;
  const activeAssociatesCount = safeAssociates.filter((a) => a && a.active !== false && a.status === 'approved').length;

  const totalEligibleCommission = safeCommissions.reduce(
    (sum, r) => sum + (r?.totalEligibleCommission || 0),
    0
  );

  const pendingApprovalRecords = safeCommissions.filter(
    (r) => r && (r.status === 'pending' || r.status === 'eligible')
  );
  const pendingApprovalAmount = pendingApprovalRecords.reduce(
    (sum, r) => sum + (r?.totalEligibleCommission || 0),
    0
  );

  const approvedRecords = safeCommissions.filter(
    (r) => r && (r.status === 'approved' || r.status === 'partially_paid' || r.status === 'paid')
  );
  const approvedAmount = approvedRecords.reduce(
    (sum, r) => sum + (r?.totalEligibleCommission || 0),
    0
  );

  const paidAmount = safeCommissions.reduce((sum, r) => sum + (r?.paidAmount || 0), 0);
  const pendingPayoutAmount = Math.max(0, approvedAmount - paidAmount);

  // Top Associate from actual records
  const associateEarningsMap: Record<string, { name: string; phone: string; count: number; total: number }> = {};
  safeCommissions.forEach((r) => {
    if (r && r.associateId && r.associateId !== 'unassigned') {
      if (!associateEarningsMap[r.associateId]) {
        associateEarningsMap[r.associateId] = {
          name: r.associateName || 'Associate',
          phone: r.associatePhone || '',
          count: 0,
          total: 0,
        };
      }
      associateEarningsMap[r.associateId].count += 1;
      associateEarningsMap[r.associateId].total += r.totalEligibleCommission || 0;
    }
  });

  const topAssociateEntry = Object.values(associateEarningsMap).sort((a, b) => b.total - a.total)[0];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#CCA02E]/20 text-[#103858]">
              <Calculator className="w-4 h-4 text-[#CCA02E]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                10-Level Commission & Associate Network Operations
              </h3>
              <p className="text-xs text-slate-500">
                Multi-tier channel partner settlements and transaction qualifications
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/commissions"
            className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <span>Manage Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {isSuperAdmin && (
            <Link
              to="/admin/commission-plan"
              className="text-xs font-bold text-white bg-[#103858] hover:bg-[#0c2a44] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-[#CCA02E]" />
              <span>Configure Plan</span>
            </Link>
          )}
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Qualifying Transactions */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Qualifying Deals
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#103858] block mt-1">
            {totalTransactionsCount}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Logged in system</span>
        </div>

        {/* Total Eligible Commission */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Total Eligible
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#103858] block mt-1">
            {formatINRShort(totalEligibleCommission)}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">10-level pool</span>
        </div>

        {/* Pending Approval */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">
            Pending Approval
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-900 block mt-1">
            {formatINRShort(pendingApprovalAmount)}
          </span>
          <span className="text-[10px] text-amber-700 font-medium">
            {pendingApprovalRecords.length} records
          </span>
        </div>

        {/* Approved Commission */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
          <span className="text-[10px] uppercase font-bold text-blue-800 block">
            Approved
          </span>
          <span className="text-xl sm:text-2xl font-black text-blue-900 block mt-1">
            {formatINRShort(approvedAmount)}
          </span>
          <span className="text-[10px] text-blue-700 font-medium">
            {approvedRecords.length} cleared
          </span>
        </div>

        {/* Paid Amount */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            Settled (Paid)
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#16A34A] block mt-1">
            {formatINRShort(paidAmount)}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">Bank UTR verified</span>
        </div>

        {/* Active Associates */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Active Associates
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#103858] block mt-1">
            {activeAssociatesCount}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {associates.length} registered
          </span>
        </div>
      </div>

      {/* Interactive 10-Tier Rate Visualizer & Simulator */}
      <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#CCA02E]/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-black text-[#103858] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#CCA02E]" />
              <span>Standard 10-Level Rate Hierarchy (20.00% Pool)</span>
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Level 1 Direct 10% • Early Network 5.25% (L2–L4) • Mid Network 2.25% (L5–L8) • Deep Network 2.50% (L9–L10)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-semibold">Simulate Deal Value:</span>
            <select
              value={calcPropertyValue}
              onChange={(e) => setCalcPropertyValue(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-[#103858] focus:ring-1 focus:ring-[#103858]"
            >
              <option value={500000}>₹5,00,000 (₹5 Lakh)</option>
              <option value={1000000}>₹10,00,000 (₹10 Lakh - Reference)</option>
              <option value={2000000}>₹20,00,000 (₹20 Lakh)</option>
              <option value={5000000}>₹50,00,000 (₹50 Lakh)</option>
              <option value={10000000}>₹1,00,00,000 (₹1 Crore)</option>
            </select>
          </div>
        </div>

        {/* 10-Level Horizontal Matrix Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {DEFAULT_COMMISSION_LEVELS.map((lvl) => {
            const commAmount = (calcPropertyValue * lvl.rate) / 100;
            const upfront = commAmount * 0.25;

            return (
              <div
                key={lvl.level}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-2xs"
              >
                <div className="text-[10px] font-extrabold text-[#103858] uppercase">
                  L{lvl.level}
                </div>
                <div className="text-sm font-black text-[#CCA02E]">
                  {lvl.rate}%
                </div>
                <div className="text-[11px] font-bold text-slate-800 pt-1 border-t border-slate-100">
                  {formatINR(commAmount)}
                </div>
                <div className="text-[9px] text-slate-400">
                  25% Upfront: {formatINR(upfront)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Associate (if real data exists) & Compliance Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-200/80 gap-3 text-xs">
          {topAssociateEntry ? (
            <div className="flex items-center gap-2 text-slate-700">
              <Award className="w-4 h-4 text-[#CCA02E] shrink-0" />
              <span>
                Top Direct Earner: <strong className="text-[#103858]">{topAssociateEntry.name}</strong> ({formatINR(topAssociateEntry.total)} across {topAssociateEntry.count} deals)
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 italic">
              {commissionRecords.length === 0 ? 'No commission records yet. Commission settlements will appear as deals qualify.' : `${commissionRecords.length} records processed.`}
            </span>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 italic">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{COMPLIANCE_DISCLAIMER}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
