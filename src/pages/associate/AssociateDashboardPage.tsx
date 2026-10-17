import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  TrendingUp,
  FileCheck,
  Layers,
  ChevronRight,
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  IndianRupee,
  RefreshCw,
  Users,
  Search,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Associate,
  QualifyingTransaction,
  CommissionRecord,
  CommissionPlanConfig,
  DirectReferralRecord,
  MatchingRecord,
} from '../../types';
import { getAssociates } from '../../services/associatesService';
import {
  getQualifyingTransactions,
  getCommissionRecords,
  getCommissionPlanConfig,
  getDirectReferralRecords,
  getMatchingRecords,
  COMPLIANCE_DISCLAIMER,
  BUSINESS_PLAN_DISCLOSURE,
  seedSampleCommissionModuleData,
} from '../../services/commissionService';
import { formatINR, formatDateTime } from '../../utils/formatters';
import { useDocumentTitle } from '../../utils/seo';

export const AssociateDashboardPage: React.FC = () => {
  useDocumentTitle('Associate Commission Dashboard — Cosy Reality');
  const { userProfile, isSuperAdmin, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [selectedAssociateId, setSelectedAssociateId] = useState<string>('');
  const [currentAssociate, setCurrentAssociate] = useState<Associate | null>(null);
  const [transactions, setTransactions] = useState<QualifyingTransaction[]>([]);
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>([]);
  const [directReferralRecords, setDirectReferralRecords] = useState<DirectReferralRecord[]>([]);
  const [matchingRecords, setMatchingRecords] = useState<MatchingRecord[]>([]);
  const [planConfig, setPlanConfig] = useState<CommissionPlanConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'direct_referral' | 'matching' | 'commissions' | 'transactions' | 'network' | 'payouts'>('overview');

  const loadData = async () => {
    try {
      setLoading(true);
      const [assocList, txList, recList, config, dirList, matchList] = await Promise.all([
        getAssociates(),
        getQualifyingTransactions(),
        getCommissionRecords(),
        getCommissionPlanConfig(),
        getDirectReferralRecords(),
        getMatchingRecords(),
      ]);

      setAssociates(assocList);
      setTransactions(txList);
      setCommissionRecords(recList);
      setPlanConfig(config);
      setDirectReferralRecords(dirList);
      setMatchingRecords(matchList);

      // Select initial associate
      if (assocList.length > 0) {
        const defaultAssoc =
          assocList.find((a) => a.id === selectedAssociateId) ||
          assocList.find((a) => a.id === 'assoc_l1_rajesh') ||
          assocList[0];
        setSelectedAssociateId(defaultAssoc.id);
        setCurrentAssociate(defaultAssoc);
      } else {
        // If empty, auto seed sample data for seamless initial evaluation
        await seedSampleCommissionModuleData();
        const [seededAssocs, seededDir, seededMatch] = await Promise.all([
          getAssociates(),
          getDirectReferralRecords(),
          getMatchingRecords(),
        ]);
        setAssociates(seededAssocs);
        setDirectReferralRecords(seededDir);
        setMatchingRecords(seededMatch);
        if (seededAssocs.length > 0) {
          setSelectedAssociateId(seededAssocs[0].id);
          setCurrentAssociate(seededAssocs[0]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load associate dashboard data:', err);
      addToast('error', 'Data Error', 'Unable to retrieve associate records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssociateChange = (assocId: string) => {
    setSelectedAssociateId(assocId);
    const found = associates.find((a) => a.id === assocId) || null;
    setCurrentAssociate(found);
  };

  // Filter records for selected associate
  const myCommissionRecords = commissionRecords.filter(
    (r) => r.associateId === selectedAssociateId || r.associateName?.includes(currentAssociate?.name || '___')
  );

  // Filter Direct Referral & Matching records for selected associate
  const myDirectReferrals = directReferralRecords.filter(
    (r) => r.associateId === selectedAssociateId
  );

  const myMatchingRecords = matchingRecords.filter(
    (r) => r.associateId === selectedAssociateId
  );

  const directTransactions = transactions.filter(
    (t) => t.directAssociateId === selectedAssociateId
  );

  // 1. Direct Referral Commission
  const directReferralCommission = myDirectReferrals.reduce(
    (s, r) => s + (r.eligibleCommission || 0),
    0
  );

  // 2. Matching Bonus
  const matchingBonusTotal = myMatchingRecords.reduce(
    (s, r) => s + (r.calculatedBonus || 0),
    0
  );

  // Network Multi-Level (L2-L10, plus L1 only if not mapped to direct referral to prevent double counting)
  const isL1Mapped = planConfig?.directReferral?.mapLevel1ToDirectReferral !== false;
  const networkLevelsCommission = myCommissionRecords
    .filter((r) => !isL1Mapped || r.level !== 1)
    .reduce((s, r) => s + (r.totalEligibleCommission || 0), 0);

  // 3. Total Eligible Commission
  const totalEligibleCommission = directReferralCommission + matchingBonusTotal + networkLevelsCommission;

  // 4. Approved Commission
  const approvedDirect = myDirectReferrals
    .filter((r) => r.status === 'approved' || r.status === 'paid' || r.status === 'partially_paid')
    .reduce((s, r) => s + (r.approvedCommission || r.eligibleCommission || 0), 0);

  const approvedMatching = myMatchingRecords
    .filter((r) => r.status === 'approved' || r.status === 'paid')
    .reduce((s, r) => s + (r.approvedBonus || r.calculatedBonus || 0), 0);

  const approvedNetwork = myCommissionRecords
    .filter(
      (r) =>
        (!isL1Mapped || r.level !== 1) &&
        (r.status === 'approved' || r.status === 'paid' || r.status === 'partially_paid')
    )
    .reduce((s, r) => s + (r.totalEligibleCommission || 0), 0);

  const totalApprovedCommission = approvedDirect + approvedMatching + approvedNetwork;

  // 5. Paid Commission
  const totalPaidCommission =
    myCommissionRecords.reduce((s, r) => s + (r.paidAmount || 0), 0) +
    myDirectReferrals.reduce((s, r) => s + (r.paidAmount || 0), 0) +
    myMatchingRecords.reduce((s, r) => s + (r.paidBonus || 0), 0);

  // 6. Pending Commission
  const totalPendingCommission = Math.max(0, totalEligibleCommission - totalPaidCommission);

  // Matching Dual-Side Business Status (Latest Cycle or Sum)
  const latestMatch = myMatchingRecords[0];
  const sideAEligibleBusiness = latestMatch
    ? latestMatch.sideAEligibleValue
    : myMatchingRecords.reduce((s, r) => s + (r.sideAEligibleValue || 0), 0);
  const sideBEligibleBusiness = latestMatch
    ? latestMatch.sideBEligibleValue
    : myMatchingRecords.reduce((s, r) => s + (r.sideBEligibleValue || 0), 0);
  const matchedBusiness = latestMatch
    ? latestMatch.matchedValue
    : myMatchingRecords.reduce((s, r) => s + (r.matchedValue || 0), 0);
  const carryForwardSideA = latestMatch ? latestMatch.carryForwardA : 0;
  const carryForwardSideB = latestMatch ? latestMatch.carryForwardB : 0;

  // Downline team count
  const downlineMembers = associates.filter(
    (a) => a.sponsorId === selectedAssociateId || a.parentAssociateId === selectedAssociateId
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-10 sm:py-14">
      <Container className="space-y-8">
        {/* Top Header & Associate Switcher */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#103858] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Associate Portal
              </span>
              <span className="text-xs font-semibold text-[#CCA02E]">
                ID: {currentAssociate?.associateId || currentAssociate?.id || 'CR-ASC-1001'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#103858]">
              {currentAssociate ? currentAssociate.name : 'Channel Partner Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time portfolio tracking, qualifying property sales, direct referral commissions, and 1:1 matching statements.
            </p>
          </div>

          {/* Associate Selector for Demo & Admin Testing */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {associates.length > 1 && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Select Channel Partner
                </label>
                <select
                  value={selectedAssociateId}
                  onChange={(e) => handleAssociateChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#103858] focus:ring-2 focus:ring-[#103858] cursor-pointer"
                >
                  {associates.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.associateId || a.city || 'Partner'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center cursor-pointer mt-auto"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {isAdmin && (
              <Link to="/admin/commissions" className="mt-auto">
                <Button variant="outline" size="sm">
                  Admin Console
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* COMPLIANCE DISCLAIMER BANNER */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-amber-900 text-xs shadow-2xs flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-950 block">Statutory Compliance Note</span>
            <p className="text-amber-900/90 leading-relaxed text-[11px] sm:text-xs">
              {BUSINESS_PLAN_DISCLOSURE}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6 SEPARATE SUMMARY CARDS (SPECIFICATION SECTION 6)       */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: Direct Referral Commission */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1 hover:border-[#CCA02E] transition-colors">
            <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
              Direct Referral (10%)
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#103858] block">
              ₹{formatINR(directReferralCommission)}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {myDirectReferrals.length} Qualifying Deal(s)
            </span>
          </div>

          {/* Card 2: Matching Bonus */}
          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-1 hover:border-blue-400 transition-colors">
            <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
              Matching Bonus (1:1)
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#103858] block">
              ₹{formatINR(matchingBonusTotal)}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {myMatchingRecords.length} Cycle Record(s)
            </span>
          </div>

          {/* Card 3: Total Eligible Commission */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Eligible
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#103858] block">
              ₹{formatINR(totalEligibleCommission)}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Direct + Matching + Levels
            </span>
          </div>

          {/* Card 4: Approved Commission */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">
              Approved Commission
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-800 block">
              ₹{formatINR(totalApprovedCommission)}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Verified by Finance Admin
            </span>
          </div>

          {/* Card 5: Paid Commission */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">
              Paid Commission
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#16A34A] block">
              ₹{formatINR(totalPaidCommission)}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Disbursed to Bank
            </span>
          </div>

          {/* Card 6: Pending Commission */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
              Pending Commission
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#CCA02E] block">
              ₹{formatINR(totalPendingCommission)}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Awaiting Approval / Tenure
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MATCHING BONUS 1:1 DUAL-SIDE BUSINESS PANEL              */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-br from-slate-900 via-[#103858] to-[#172B3A] text-white p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#CCA02E] text-[#103858] font-black flex items-center justify-center text-sm shadow-xs">
                1:1
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <span>1:1 Network Matching Business Volume</span>
                  <span className="text-[10px] bg-white/10 text-[#CCA02E] font-bold px-2 py-0.5 rounded-full uppercase">
                    Live Status
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Matching Bonus is calculated on eligible 1:1 matched business according to the approved company plan and qualification rules.
                </p>
              </div>
            </div>

            {latestMatch && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/10 text-slate-300">
                Cycle: {latestMatch.cycleId}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Side A Eligible Business */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                Side A Eligible Business
              </span>
              <span className="text-lg sm:text-xl font-black text-white block">
                ₹{formatINR(sideAEligibleBusiness)}
              </span>
              <span className="text-[10px] text-slate-400">Left Network Volume</span>
            </div>

            {/* Side B Eligible Business */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                Side B Eligible Business
              </span>
              <span className="text-lg sm:text-xl font-black text-white block">
                ₹{formatINR(sideBEligibleBusiness)}
              </span>
              <span className="text-[10px] text-slate-400">Right Network Volume</span>
            </div>

            {/* Matched Business */}
            <div className="bg-[#CCA02E]/20 border border-[#CCA02E]/40 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#CCA02E] block">
                Matched Business (1:1)
              </span>
              <span className="text-lg sm:text-xl font-black text-white block">
                ₹{formatINR(matchedBusiness)}
              </span>
              <span className="text-[10px] text-amber-200">Balanced Volume Basis</span>
            </div>

            {/* Carry Forward Side A */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Carry Forward Side A
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-400 block">
                ₹{formatINR(carryForwardSideA)}
              </span>
              <span className="text-[10px] text-slate-400">Next Cycle Credit</span>
            </div>

            {/* Carry Forward Side B */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Carry Forward Side B
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-400 block">
                ₹{formatINR(carryForwardSideB)}
              </span>
              <span className="text-[10px] text-slate-400">Next Cycle Credit</span>
            </div>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-2">
            <span>
              <strong>Note:</strong> Unmatched volume on either side is preserved under active carry-forward rules.
            </span>
            <span className="text-[#CCA02E] font-semibold">
              Matching Ratio: 1:1 | Matching Rate: {planConfig?.matchingBonus?.rate ?? 10}%
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
          {[
            { id: 'overview', label: 'Overview & Profile' },
            { id: 'direct_referral', label: `Direct Referral (10%) (${myDirectReferrals.length})` },
            { id: 'matching', label: `1:1 Matching Bonus (${myMatchingRecords.length})` },
            { id: 'commissions', label: `10-Level Statements (${myCommissionRecords.length})` },
            { id: 'transactions', label: `Qualifying Deals (${directTransactions.length})` },
            { id: 'network', label: 'Network Hierarchy' },
            { id: 'payouts', label: 'Payout History' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 sm:px-4 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#103858] text-[#103858]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & PROFILE */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#103858] text-[#CCA02E] font-black text-lg flex items-center justify-center shadow-xs">
                  {currentAssociate?.name.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#103858]">
                    {currentAssociate?.name || 'Channel Partner'}
                  </h3>
                  <span className="text-xs text-slate-400">{currentAssociate?.city || 'Delhi NCR'}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">Associate ID</span>
                  <span className="font-bold text-[#103858]">{currentAssociate?.associateId || 'CR-ASC-1001'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">Phone</span>
                  <span className="font-bold text-[#103858]">{currentAssociate?.phone || '+91 98101 23456'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">Email</span>
                  <span className="font-bold text-[#103858]">{currentAssociate?.email || 'partner@cosyreality.com'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">KYC Verification</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase">
                    {currentAssociate?.kycStatus || 'Verified'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">Agreement Status</span>
                  <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px] uppercase">
                    {currentAssociate?.agreementStatus || 'Signed'}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-semibold">Upline Sponsor ID</span>
                  <span className="font-bold text-slate-700">{currentAssociate?.sponsorId || 'CR-HQ-DIRECT'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link to="/commission-plan">
                  <Button variant="outline" size="sm" className="w-full">
                    View 10-Level Plan Rules
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Commission Records Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-[#103858]">Recent Commission Items</h3>
                  <p className="text-xs text-slate-400">Qualifying deal disbursements and schedule status</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('commissions')}
                  className="text-xs font-bold text-[#CCA02E] hover:underline"
                >
                  View All
                </button>
              </div>

              {myCommissionRecords.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No commission records recorded yet for this partner ID.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Transaction</th>
                        <th className="py-2.5 px-3">Level & Rate</th>
                        <th className="py-2.5 px-3 text-right">Commission</th>
                        <th className="py-2.5 px-3 text-right">Paid</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myCommissionRecords.slice(0, 5).map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#103858] block">{r.transactionId}</span>
                            <span className="text-[10px] text-slate-400">
                              Val: {formatINR(r.qualifyingValue)}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700">
                            Level {r.level} ({r.rate}%)
                          </td>
                          <td className="py-3 px-3 text-right font-black text-[#103858]">
                            {formatINR(r.totalEligibleCommission)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-700">
                            {formatINR(r.paidAmount)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                r.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.status === 'approved' || r.status === 'eligible'
                                  ? 'bg-blue-100 text-blue-800'
                                  : r.status === 'held'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: DIRECT REFERRAL (10%) */}
        {activeTab === 'direct_referral' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#CCA02E]/20 text-[#103858] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Direct Referral Module
                  </span>
                  <span className="text-xs font-bold text-amber-700">
                    Rate: {planConfig?.directReferral?.rate ?? 10}%
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#103858]">Direct Referral Commission Statements</h3>
                <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                  An eligible Direct Referral commission is calculated as {planConfig?.directReferral?.rate ?? 10}% of the qualifying plot/property value, subject to company eligibility, collection, documentation and approval rules.
                </p>
              </div>

              <div className="text-right bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60 shrink-0">
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Eligible Direct Commission</span>
                <span className="text-xl font-black text-[#103858]">{formatINR(directReferralCommission)}</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Qualifying Plot Value</span>
                <span className="text-base sm:text-lg font-black text-[#103858]">
                  ₹{formatINR(myDirectReferrals.reduce((s, r) => s + (r.qualifyingPlotValue || 0), 0))}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved Amount</span>
                <span className="text-base sm:text-lg font-black text-emerald-700">
                  ₹{formatINR(approvedDirect)}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Disbursed / Paid</span>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  ₹{formatINR(myDirectReferrals.reduce((s, r) => s + (r.paidAmount || 0), 0))}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Deals</span>
                <span className="text-base sm:text-lg font-black text-[#CCA02E]">
                  {myDirectReferrals.length}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#103858] text-white text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl">Deal ID</th>
                    <th className="py-3 px-4">Project / Unit</th>
                    <th className="py-3 px-4 text-right">Qualifying Plot Value</th>
                    <th className="py-3 px-4 text-center">Referral Rate</th>
                    <th className="py-3 px-4 text-right">Eligible Comm.</th>
                    <th className="py-3 px-4 text-right">Approved Comm.</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Date / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myDirectReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                        No direct referral commission records recorded yet for this partner.
                      </td>
                    </tr>
                  ) : (
                    myDirectReferrals.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-[#103858]">{r.transactionId}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{r.projectName || 'Bansuri Dham'}</div>
                          <div className="text-[10px] text-slate-400">{r.unitOrPlotNumber || 'Unit —'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                          ₹{formatINR(r.qualifyingPlotValue)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px]">
                            {r.directReferralRate ?? 10}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-[#103858]">
                          ₹{formatINR(r.eligibleCommission)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                          ₹{formatINR(r.approvedCommission || r.eligibleCommission)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                          ₹{formatINR(r.paidAmount || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                              r.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'approved'
                                ? 'bg-blue-100 text-blue-800'
                                : r.status === 'held'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400 text-[10px]">
                          <div>{r.createdAt ? formatDateTime(r.createdAt) : '—'}</div>
                          {r.approvedBy && (
                            <div className="text-emerald-700 font-medium">By {r.approvedBy}</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: 1:1 MATCHING BONUS */}
        {activeTab === 'matching' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#103858] text-[#CCA02E] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    1:1 Matching Engine
                  </span>
                  <span className="text-xs font-bold text-blue-800">
                    Ratio: {planConfig?.matchingBonus?.ratio || '1:1'} | Rate: {planConfig?.matchingBonus?.rate ?? 10}%
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#103858]">1:1 Network Matching Bonus & History</h3>
                <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                  Matching Bonus is calculated on eligible 1:1 matched business according to the approved company plan and qualification rules.
                </p>
              </div>

              <div className="text-right bg-blue-50/60 p-3 rounded-2xl border border-blue-200/60 shrink-0">
                <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">Calculated Bonus Pool</span>
                <span className="text-xl font-black text-[#103858]">{formatINR(matchingBonusTotal)}</span>
              </div>
            </div>

            {/* Basis Alert if Unconfigured */}
            {(!planConfig?.matchingBonus?.basis || planConfig?.matchingBonus?.basis === 'unconfigured') && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Matching qualification rules are pending configuration.</strong>
                  <p className="mt-0.5 text-amber-800 leading-relaxed text-[11px]">
                    Until Admin explicitly selects and configures a calculation basis in the Admin Commission Plan, matching bonus is not automatically credited.
                  </p>
                </div>
              </div>
            )}

            {/* Network Volume Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Side A (Left)</span>
                <span className="text-base sm:text-lg font-black text-[#103858]">₹{formatINR(sideAEligibleBusiness)}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Side B (Right)</span>
                <span className="text-base sm:text-lg font-black text-[#103858]">₹{formatINR(sideBEligibleBusiness)}</span>
              </div>
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Matched (1:1)</span>
                <span className="text-base sm:text-lg font-black text-[#CCA02E]">₹{formatINR(matchedBusiness)}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carry Forward A</span>
                <span className="text-base sm:text-lg font-black text-emerald-700">₹{formatINR(carryForwardSideA)}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carry Forward B</span>
                <span className="text-base sm:text-lg font-black text-emerald-700">₹{formatINR(carryForwardSideB)}</span>
              </div>
            </div>

            {/* Matching History Table (Firestore matchingRecords) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#103858] text-white text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl">Cycle ID</th>
                    <th className="py-3 px-4 text-right">Side A Volume</th>
                    <th className="py-3 px-4 text-right">Side B Volume</th>
                    <th className="py-3 px-4 text-right">1:1 Matched</th>
                    <th className="py-3 px-4 text-right">Carry Fwd (A / B)</th>
                    <th className="py-3 px-4 text-center">Ratio & Rate</th>
                    <th className="py-3 px-4">Matching Basis</th>
                    <th className="py-3 px-4 text-right">Calculated Bonus</th>
                    <th className="py-3 px-4 text-right">Approved Bonus</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myMatchingRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                        No matching calculation cycles logged yet for this associate.
                      </td>
                    </tr>
                  ) : (
                    myMatchingRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#103858]">
                          {r.cycleId}
                          <div className="text-[10px] font-sans text-slate-400 font-normal">
                            {r.createdAt ? formatDateTime(r.createdAt) : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                          ₹{formatINR(r.sideAEligibleValue)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                          ₹{formatINR(r.sideBEligibleValue)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-[#103858]">
                          ₹{formatINR(r.matchedValue)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                          ₹{formatINR(r.carryForwardA)} / ₹{formatINR(r.carryForwardB)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {r.matchingRatio || '1:1'} @ {r.matchingRate}%
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          <span className="capitalize text-[11px]">
                            {r.matchingBasis ? r.matchingBasis.replace(/_/g, ' ') : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-blue-900">
                          ₹{formatINR(r.calculatedBonus)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-800">
                          ₹{formatINR(r.approvedBonus || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                              r.status === 'approved' || r.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'calculated'
                                ? 'bg-blue-100 text-blue-800'
                                : r.status === 'held'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ALL COMMISSION STATEMENTS */}
        {activeTab === 'commissions' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#103858]">Detailed Commission Ledger</h3>
                <p className="text-xs text-slate-500">
                  Full 10-level commission accounting for {currentAssociate?.name}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block">Total Pool Eligible</span>
                <span className="text-xl font-black text-[#103858]">{formatINR(totalEligibleCommission)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#103858] text-white text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl">Deal ID</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4 text-center">Rate</th>
                    <th className="py-3 px-4 text-right">Qualifying Value</th>
                    <th className="py-3 px-4 text-right">Eligible Comm.</th>
                    <th className="py-3 px-4 text-right">25% Upfront</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myCommissionRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                        No commission entries found.
                      </td>
                    </tr>
                  ) : (
                    myCommissionRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-[#103858]">{r.transactionId}</td>
                        <td className="py-3.5 px-4">
                          <span className="w-6 h-6 rounded-full bg-slate-100 font-bold inline-flex items-center justify-center text-[10px] text-[#103858]">
                            L{r.level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold">{r.rate}%</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                          {formatINR(r.qualifyingValue)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-[#103858]">
                          {formatINR(r.totalEligibleCommission)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                          {formatINR(r.upfrontAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {formatINR(r.paidAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                          {formatINR(r.pendingAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                              r.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'approved' || r.status === 'eligible'
                                ? 'bg-blue-100 text-blue-800'
                                : r.status === 'held'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QUALIFYING TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#103858]">Direct Qualifying Transactions</h3>
                <p className="text-xs text-slate-500">
                  Verified property & plot purchases initiated directly by your channel code
                </p>
              </div>
            </div>

            {directTransactions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No direct property sales recorded yet for this partner.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {directTransactions.map((tx) => (
                  <div key={tx.id} className="p-5 rounded-2xl border border-slate-200 bg-[#FAF8F3] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#103858]">{tx.transactionId}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          tx.transactionStatus === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tx.transactionStatus}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-[#103858]">
                        {tx.projectName || 'Cosy Palm Meadows'}
                      </h4>
                      <p className="text-xs text-slate-500">{tx.unitOrPlotNumber || 'Plot Unit'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Property Value</span>
                        <span className="font-bold text-[#103858]">{formatINR(tx.propertyValue)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Eligible Collection</span>
                        <span className="font-bold text-emerald-700">{formatINR(tx.eligibleCollection)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Customer Ref</span>
                        <span className="font-semibold text-slate-700">{tx.customerReference}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Qualification Date</span>
                        <span className="font-semibold text-slate-700">{tx.qualificationDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: 10-LEVEL HIERARCHY TREE */}
        {activeTab === 'network' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-[#103858]">10-Level Referral Hierarchy</h3>
              <p className="text-xs text-slate-500">
                Visual relationship chain connecting direct partners and upline network coordinators
              </p>
            </div>

            <div className="space-y-3">
              {[
                { level: 1, title: 'Direct Partner (You)', name: currentAssociate?.name || 'Self', isCurrent: true },
                { level: 2, title: 'Level 2 Sponsor', name: 'Vikram Malhotra (CR-ASC-1002)', isCurrent: false },
                { level: 3, title: 'Level 3 Regional Coordinator', name: 'Amit Verma (CR-ASC-1003)', isCurrent: false },
                { level: 4, title: 'Level 4 Senior Sponsor', name: 'Priya Sundaram (CR-ASC-1004)', isCurrent: false },
                { level: 5, title: 'Level 5 Network Mentor', name: 'Manoj Gupta (CR-ASC-1005)', isCurrent: false },
                { level: 6, title: 'Level 6 Area Lead', name: 'Corporate Head — Sector 62', isCurrent: false },
              ].map((h) => (
                <div
                  key={h.level}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    h.isCurrent
                      ? 'bg-[#103858] text-white border-[#103858]'
                      : 'bg-[#FAF8F3] text-[#103858] border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                        h.isCurrent ? 'bg-[#CCA02E] text-[#103858]' : 'bg-[#103858] text-white'
                      }`}
                    >
                      L{h.level}
                    </span>
                    <div>
                      <span className="text-[11px] opacity-80 block uppercase tracking-wider font-semibold">
                        {h.title}
                      </span>
                      <span className="text-sm font-bold block">{h.name}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      h.isCurrent ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Active Tier
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PAYOUT HISTORY */}
        {activeTab === 'payouts' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-[#103858]">Disbursement Statements & Bank Credits</h3>
              <p className="text-xs text-slate-500">
                Official transaction IDs, bank reference numbers, and payment date stamps
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Bank Ref Number</th>
                    <th className="py-2.5 px-3 text-right">Disbursed Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-700">10 Aug 2026</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">25% Upfront Token Clearance</td>
                    <td className="py-3 px-3 font-mono text-slate-500">UTR-HDFC-998822104</td>
                    <td className="py-3 px-3 text-right font-black text-[#103858]">₹25,000</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        Settled
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-700">10 Sep 2026</td>
                    <td className="py-3 px-3 font-bold text-[#103858]">Installment #01 (36m Plan)</td>
                    <td className="py-3 px-3 font-mono text-slate-500">Scheduled / Auto-Disburse</td>
                    <td className="py-3 px-3 text-right font-black text-[#103858]">₹2,083.33</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                        Scheduled
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};
export default AssociateDashboardPage;
