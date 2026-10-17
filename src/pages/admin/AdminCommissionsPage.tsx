import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  IndianRupee,
  Building,
  User,
  ShieldCheck,
  Award,
  Search,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign,
  Send,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  QualifyingTransaction,
  CommissionRecord,
  Associate,
  Project,
  CommissionPlanConfig,
  DirectReferralRecord,
  MatchingRecord,
} from '../../types';
import {
  getQualifyingTransactions,
  createQualifyingTransaction,
  updateQualifyingTransaction,
  getCommissionRecords,
  updateCommissionRecordStatus,
  recordCommissionPayout,
  generate10LevelCommissionsForTransaction,
  getCommissionPlanConfig,
  seedSampleCommissionModuleData,
  getDirectReferralRecords,
  updateDirectReferralRecordStatus,
  getMatchingRecords,
  updateMatchingRecordStatus,
  createMatchingCalculationForAssociate,
  calculateMatchingEngine,
  BUSINESS_PLAN_DISCLOSURE,
} from '../../services/commissionService';
import { getAssociates } from '../../services/associatesService';
import { getProjects } from '../../services/projectsService';
import { formatINR, formatDateTime } from '../../utils/formatters';
import { useDocumentTitle } from '../../utils/seo';

export const AdminCommissionsPage: React.FC = () => {
  useDocumentTitle('Commission Management & Operations — Admin');
  const { isSuperAdmin, isSalesAdmin, userProfile } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'records' | 'direct_referral' | 'matching_bonus'>('transactions');
  const [transactions, setTransactions] = useState<QualifyingTransaction[]>([]);
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>([]);
  const [directReferralRecords, setDirectReferralRecords] = useState<DirectReferralRecord[]>([]);
  const [matchingRecords, setMatchingRecords] = useState<MatchingRecord[]>([]);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [planConfig, setPlanConfig] = useState<CommissionPlanConfig | null>(null);

  // Modal: Calculate 1:1 Matching Bonus
  const [showMatchingCalcModal, setShowMatchingCalcModal] = useState(false);
  const [matchingCalcAssocId, setMatchingCalcAssocId] = useState('');
  const [matchingCalcSideA, setMatchingCalcSideA] = useState<number>(1500000);
  const [matchingCalcSideB, setMatchingCalcSideB] = useState<number>(1000000);
  const [matchingCalcCycleId, setMatchingCalcCycleId] = useState('CYCLE-2026-Q4');
  const [matchingCalcSubmitting, setMatchingCalcSubmitting] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal: Add Qualifying Transaction
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [newTx, setNewTx] = useState({
    projectId: '',
    projectName: '',
    unitOrPlotNumber: '',
    propertyValue: 1000000,
    eligibleCollection: 1000000,
    customerReference: '',
    directAssociateId: '',
    qualificationDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Modal: Record Payout
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedRecordForPayout, setSelectedRecordForPayout] = useState<CommissionRecord | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutRef, setPayoutRef] = useState<string>('');
  const [payoutType, setPayoutType] = useState<'upfront' | 'installment' | 'manual'>('upfront');
  const [payoutNotes, setPayoutNotes] = useState<string>('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  // Modal: Hold Reason
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [selectedRecordForHold, setSelectedRecordForHold] = useState<CommissionRecord | null>(null);
  const [holdReason, setHoldReason] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [txList, recList, assocList, projList, config, dirList, matchList] = await Promise.all([
        getQualifyingTransactions(),
        getCommissionRecords(),
        getAssociates(),
        getProjects(),
        getCommissionPlanConfig(),
        getDirectReferralRecords(),
        getMatchingRecords(),
      ]);

      setTransactions(txList);
      setCommissionRecords(recList);
      setAssociates(assocList);
      setProjects(projList);
      setPlanConfig(config);
      setDirectReferralRecords(dirList);
      setMatchingRecords(matchList);

      if (txList.length === 0 && assocList.length === 0) {
        await seedSampleCommissionModuleData();
        const [seededTx, seededRec, seededAssoc, seededDir, seededMatch] = await Promise.all([
          getQualifyingTransactions(),
          getCommissionRecords(),
          getAssociates(),
          getDirectReferralRecords(),
          getMatchingRecords(),
        ]);
        setTransactions(seededTx);
        setCommissionRecords(seededRec);
        setAssociates(seededAssoc);
        setDirectReferralRecords(seededDir);
        setMatchingRecords(seededMatch);
      }
    } catch (err: any) {
      console.error('Failed to load commissions data:', err);
      addToast('error', 'Data Error', 'Unable to retrieve commission operations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveDirectReferral = async (record: DirectReferralRecord) => {
    try {
      await updateDirectReferralRecordStatus(
        record.id,
        'approved',
        { approvedBy: userProfile?.name || 'Admin' },
        userProfile?.uid,
        userProfile?.name
      );
      addToast('success', 'Direct Referral Approved', `Direct Referral commission of ₹${formatINR(record.eligibleCommission)} approved.`);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Failed to approve direct referral.');
    }
  };

  const handleApproveMatching = async (record: MatchingRecord) => {
    try {
      await updateMatchingRecordStatus(
        record.id,
        'approved',
        {
          approvedBy: userProfile?.name || 'Admin',
          approvedBonus: record.calculatedBonus,
        },
        userProfile?.uid,
        userProfile?.name
      );
      addToast('success', 'Matching Bonus Approved', `1:1 Matching Bonus of ₹${formatINR(record.calculatedBonus)} marked as approved.`);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Failed to approve matching record.');
    }
  };

  const handleRunMatchingCalculation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchingCalcAssocId) {
      addToast('error', 'Missing Associate', 'Please select an associate to calculate matching bonus.');
      return;
    }

    const assoc = associates.find((a) => a.id === matchingCalcAssocId);
    if (!assoc || !planConfig) return;

    try {
      setMatchingCalcSubmitting(true);
      const newRecord = await createMatchingCalculationForAssociate(
        assoc,
        Number(matchingCalcSideA),
        Number(matchingCalcSideB),
        matchingCalcCycleId || `CYCLE-${new Date().getFullYear()}-M${new Date().getMonth() + 1}`,
        planConfig,
        userProfile?.uid,
        userProfile?.name
      );

      if (newRecord.matchingBasis === 'unconfigured') {
        addToast(
          'info',
          'Calculation Recorded (Pending Basis)',
          'Matching volume recorded with status "pending". Matching qualification basis is pending configuration in Admin.'
        );
      } else {
        addToast(
          'success',
          '1:1 Matching Calculated',
          `Matched Volume: ₹${formatINR(newRecord.matchedValue)} | Calculated Bonus: ₹${formatINR(newRecord.calculatedBonus)}`
        );
      }

      setShowMatchingCalcModal(false);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Calculation Error', err?.message || 'Failed to execute matching calculation.');
    } finally {
      setMatchingCalcSubmitting(false);
    }
  };

  // Summary computations
  const totalQualifyingVolume = transactions.reduce((s, t) => s + (t.propertyValue || 0), 0);
  const totalCommissionPool = commissionRecords.reduce((s, r) => s + (r.totalEligibleCommission || 0), 0);
  const totalDisbursed = commissionRecords.reduce((s, r) => s + (r.paidAmount || 0), 0);
  const totalPending = commissionRecords.reduce((s, r) => s + (r.pendingAmount || 0), 0);

  // Handlers
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.directAssociateId || !newTx.propertyValue) {
      addToast('error', 'Missing Data', 'Please select a Direct Associate and enter a valid property value.');
      return;
    }

    try {
      setTxSubmitting(true);
      const directAssoc = associates.find((a) => a.id === newTx.directAssociateId);
      const proj = projects.find((p) => p.id === newTx.projectId);

      const created = await createQualifyingTransaction(
        {
          transactionId: `TX-CR-${Math.floor(1000 + Math.random() * 9000)}`,
          projectId: newTx.projectId,
          projectName: proj?.projectName || newTx.projectName || 'Cosy Reality Project',
          unitOrPlotNumber: newTx.unitOrPlotNumber || 'Plot Unit',
          propertyValue: Number(newTx.propertyValue),
          eligibleCollection: Number(newTx.eligibleCollection) || Number(newTx.propertyValue),
          customerReference: newTx.customerReference || `Client #CR-${Math.floor(1000 + Math.random() * 9000)}`,
          directAssociateId: newTx.directAssociateId,
          directAssociateName: directAssoc?.name || 'Direct Associate',
          transactionStatus: 'completed',
          commissionEligible: true,
          qualificationDate: newTx.qualificationDate,
          notes: newTx.notes,
        },
        userProfile?.uid,
        userProfile?.name
      );

      // Auto-generate 10-level commission records
      if (planConfig) {
        await generate10LevelCommissionsForTransaction(
          created,
          associates,
          planConfig,
          userProfile?.uid,
          userProfile?.name
        );
      }

      addToast(
        'success',
        'Transaction Recorded',
        `Deal ${created.transactionId} created and 10-level commission distribution records generated.`
      );

      setShowAddTxModal(false);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Creation Failed', err?.message || 'Unable to record transaction.');
    } finally {
      setTxSubmitting(false);
    }
  };

  const handleApproveRecord = async (record: CommissionRecord) => {
    try {
      await updateCommissionRecordStatus(
        record.id,
        'approved',
        { approvedBy: userProfile?.name || 'Admin' },
        userProfile?.uid,
        userProfile?.name
      );
      addToast('success', 'Commission Approved', `Level ${record.level} commission marked as approved.`);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Failed to approve record.');
    }
  };

  const handleOpenHoldModal = (record: CommissionRecord) => {
    setSelectedRecordForHold(record);
    setHoldReason(record.holdReason || '');
    setShowHoldModal(true);
  };

  const handleConfirmHold = async () => {
    if (!selectedRecordForHold) return;
    try {
      await updateCommissionRecordStatus(
        selectedRecordForHold.id,
        'held',
        { holdReason: holdReason || 'Administrative verification in progress' },
        userProfile?.uid,
        userProfile?.name
      );
      addToast('info', 'Commission Held', 'Record placed on administrative hold.');
      setShowHoldModal(false);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Failed to hold record.');
    }
  };

  const handleOpenPayoutModal = (record: CommissionRecord) => {
    setSelectedRecordForPayout(record);
    setPayoutAmount(record.upfrontAmount || record.pendingAmount || 1000);
    setPayoutRef(`UTR-CR-${Math.floor(100000 + Math.random() * 900000)}`);
    setPayoutType('upfront');
    setShowPayoutModal(true);
  };

  const handleConfirmPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForPayout || payoutAmount <= 0) return;

    try {
      setPayoutSubmitting(true);
      await recordCommissionPayout(
        selectedRecordForPayout.id,
        {
          amount: Number(payoutAmount),
          date: Date.now(),
          type: payoutType,
          referenceNumber: payoutRef,
          notes: payoutNotes,
        },
        userProfile?.uid,
        userProfile?.name
      );

      addToast(
        'success',
        'Payout Recorded',
        `Disbursed ${formatINR(payoutAmount)} against ${selectedRecordForPayout.transactionId}.`
      );

      setShowPayoutModal(false);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Payout Error', err?.message || 'Failed to record payout.');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  // Filtered Commission Records
  const filteredRecords = commissionRecords.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.transactionId.toLowerCase().includes(q) ||
        r.associateName?.toLowerCase().includes(q) ||
        r.associateId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#103858] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Operations & Finance
            </span>
            <span className="text-xs font-semibold text-[#CCA02E]">
              10-Level Commission Management
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#103858]">
            Qualifying Deals & Commissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer sales collections, review 10-tier commission calculations, approve disbursements, and log bank payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="gold"
            size="md"
            onClick={() => setShowAddTxModal(true)}
            leftIcon={<Plus className="w-4 h-4 text-[#103858]" />}
            className="font-bold shadow-xs"
          >
            Record Qualifying Deal
          </Button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Qualifying Deal Volume
          </span>
          <span className="text-2xl font-black text-[#103858] block">
            {formatINR(totalQualifyingVolume)}
          </span>
          <span className="text-[11px] text-slate-500">{transactions.length} Verified transactions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total 20% Pool Generated
          </span>
          <span className="text-2xl font-black text-[#103858] block">
            {formatINR(totalCommissionPool)}
          </span>
          <span className="text-[11px] text-slate-500">{commissionRecords.length} Level records</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Disbursed Payouts
          </span>
          <span className="text-2xl font-black text-[#16A34A] block">
            {formatINR(totalDisbursed)}
          </span>
          <span className="text-[11px] text-slate-500">Bank settlements completed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending / In-Process Pool
          </span>
          <span className="text-2xl font-black text-[#CCA02E] block">
            {formatINR(totalPending)}
          </span>
          <span className="text-[11px] text-slate-500">Scheduled tenures & approvals</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-3">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'transactions'
                ? 'border-[#103858] text-[#103858]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Qualifying Deals ({transactions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('direct_referral')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'direct_referral'
                ? 'border-[#CCA02E] text-[#103858]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Direct Referral (10%)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-extrabold">
              {directReferralRecords.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matching_bonus')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matching_bonus'
                ? 'border-blue-600 text-[#103858]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>1:1 Matching Bonus</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-900 font-extrabold">
              {matchingRecords.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'records'
                ? 'border-[#103858] text-[#103858]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            10-Level Matrix ({commissionRecords.length})
          </button>
        </div>

        {activeTab === 'matching_bonus' && (
          <div className="pb-2 sm:pb-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMatchingCalcModal(true)}
              className="text-xs font-bold text-[#103858] border-blue-300 hover:bg-blue-50"
            >
              + Calculate 1:1 Match Cycle
            </Button>
          </div>
        )}
      </div>

      {/* TAB 1: QUALIFYING TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-[#103858]">Verified Property Deal Register</h3>
              <p className="text-xs text-slate-500">
                Every qualifying property transaction generates a complete 10-level commission distribution matrix.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-[#103858] text-[10px] font-bold uppercase">
                  <th className="py-3 px-4 rounded-l-xl">Deal ID</th>
                  <th className="py-3 px-4">Project & Unit</th>
                  <th className="py-3 px-4">Direct Associate</th>
                  <th className="py-3 px-4 text-right">Property Value</th>
                  <th className="py-3 px-4 text-right">Eligible Collection</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No qualifying deals recorded. Click "Record Qualifying Deal" to begin.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-[#103858]">
                        <span>{tx.transactionId}</span>
                        <span className="text-[10px] text-slate-400 block">{tx.qualificationDate}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#103858] block">{tx.projectName}</span>
                        <span className="text-[10px] text-slate-400">{tx.unitOrPlotNumber}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{tx.directAssociateName}</span>
                        <span className="text-[10px] text-slate-400">{tx.directAssociateId}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-[#103858]">
                        {formatINR(tx.propertyValue)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {formatINR(tx.eligibleCollection)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            tx.transactionStatus === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {tx.transactionStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery(tx.transactionId);
                            setActiveTab('records');
                          }}
                          className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] hover:underline cursor-pointer"
                        >
                          View 10 Levels →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: DIRECT REFERRAL RECORDS                             */}
      {/* ======================================================== */}
      {activeTab === 'direct_referral' && (
        <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#CCA02E] text-[#103858] font-black text-xs flex items-center justify-center">
                  10%
                </span>
                <h3 className="font-extrabold text-base text-[#103858]">
                  Direct Referral Ledger ({directReferralRecords.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Eligible 10% direct commission calculated on qualifying plot value. Mapped cleanly with Level 1 to prevent double payout.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">
                Total Direct Volume: ₹
                {formatINR(directReferralRecords.reduce((s, r) => s + (r.qualifyingPlotValue || 0), 0))}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-amber-50/70 text-[#103858] font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-3 rounded-l-lg">Deal / Transaction</th>
                  <th className="py-2.5 px-3">Direct Associate</th>
                  <th className="py-2.5 px-3">Project & Unit</th>
                  <th className="py-2.5 px-3 text-right">Plot Value (₹)</th>
                  <th className="py-2.5 px-3 text-center">Rate</th>
                  <th className="py-2.5 px-3 text-right">Direct Commission</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {directReferralRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No direct referral transactions recorded yet. Deals recorded above will generate entries automatically.
                    </td>
                  </tr>
                ) : (
                  directReferralRecords.map((r) => {
                    const isPending = r.status === 'pending' || r.status === 'eligible';
                    const isApproved = r.status === 'approved';
                    const isPaid = r.status === 'paid' || r.status === 'partially_paid';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-[#103858] block">
                            {r.transactionId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(r.createdAt)}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-[#103858] block">
                            {r.associateName || 'Direct Associate'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ID: {r.associateId}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-700 block">
                            {r.projectName || 'Cosy Reality Project'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {r.unitOrPlotNumber || 'Plot'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-[#103858]">
                          {formatINR(r.qualifyingPlotValue)}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                            {r.directReferralRate || 10}%
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-black text-emerald-800 text-sm">
                          ₹{formatINR(r.eligibleCommission)}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : isApproved
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          {isPending && isSalesAdmin && (
                            <button
                              type="button"
                              onClick={() => handleApproveDirectReferral(r)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {isApproved && (
                            <span className="text-[10px] font-semibold text-emerald-700 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          )}
                          {isPaid && (
                            <span className="text-[10px] font-semibold text-blue-700">
                              Disbursed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: 1:1 MATCHING BONUS RECORDS                          */}
      {/* ======================================================== */}
      {activeTab === 'matching_bonus' && (
        <div className="bg-white p-6 rounded-3xl border border-blue-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#103858] text-[#CCA02E] font-black text-xs flex items-center justify-center">
                  1:1
                </span>
                <h3 className="font-extrabold text-base text-[#103858]">
                  1:1 Matching Bonus Records ({matchingRecords.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Network volume matching between Side A and Side B. Unmatched volume is carried forward to future cycles.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={() => setShowMatchingCalcModal(true)}
                className="text-xs font-bold"
              >
                + Calculate Matching
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-blue-50/70 text-[#103858] font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-3 rounded-l-lg">Cycle / Date</th>
                  <th className="py-2.5 px-3">Associate</th>
                  <th className="py-2.5 px-3 text-right">Side A (Left)</th>
                  <th className="py-2.5 px-3 text-right">Side B (Right)</th>
                  <th className="py-2.5 px-3 text-right">1:1 Matched</th>
                  <th className="py-2.5 px-3 text-right">Carry Forward</th>
                  <th className="py-2.5 px-3 text-center">Basis / Rate</th>
                  <th className="py-2.5 px-3 text-right">Calculated Bonus</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matchingRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No matching records calculated yet. Click "+ Calculate Matching" to run a cycle.
                    </td>
                  </tr>
                ) : (
                  matchingRecords.map((m) => {
                    const isPending = m.status === 'pending' || m.status === 'calculated';
                    const isApproved = m.status === 'approved';
                    const isPaid = m.status === 'paid';

                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-[#103858] block">
                            {m.cycleId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(m.createdAt)}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-[#103858] block">
                            {m.associateName || 'Associate'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ID: {m.associateId}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-medium text-blue-900">
                          ₹{formatINR(m.sideAEligibleValue)}
                        </td>

                        <td className="py-3 px-3 text-right font-medium text-blue-900">
                          ₹{formatINR(m.sideBEligibleValue)}
                        </td>

                        <td className="py-3 px-3 text-right font-black text-[#103858]">
                          ₹{formatINR(m.matchedValue)}
                        </td>

                        <td className="py-3 px-3 text-right font-medium text-slate-500">
                          {m.carryForwardA > 0 ? (
                            <span className="text-blue-700 font-bold block text-[11px]">
                              A: ₹{formatINR(m.carryForwardA)}
                            </span>
                          ) : null}
                          {m.carryForwardB > 0 ? (
                            <span className="text-purple-700 font-bold block text-[11px]">
                              B: ₹{formatINR(m.carryForwardB)}
                            </span>
                          ) : null}
                          {m.carryForwardA === 0 && m.carryForwardB === 0 ? (
                            <span className="text-slate-400 text-[10px]">None (Balanced)</span>
                          ) : null}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold block bg-slate-100 text-slate-700">
                            {m.matchingBasis === 'matched_business_volume'
                              ? 'Volume Base'
                              : m.matchingBasis === 'matched_commission'
                              ? 'Commission Base'
                              : m.matchingBasis === 'company_approved'
                              ? 'Custom Basis'
                              : 'Pending Basis'}
                          </span>
                          <span className="text-[10px] font-extrabold text-[#CCA02E]">
                            {m.matchingRate}% ({m.matchingRatio})
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-black text-emerald-800 text-sm">
                          {m.calculatedBonus > 0 ? `₹${formatINR(m.calculatedBonus)}` : '₹0'}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : isApproved
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          {isPending && isSalesAdmin && m.calculatedBonus > 0 && (
                            <button
                              type="button"
                              onClick={() => handleApproveMatching(m)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {isApproved && (
                            <span className="text-[10px] font-semibold text-emerald-700 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          )}
                          {isPaid && (
                            <span className="text-[10px] font-semibold text-blue-700">
                              Disbursed
                            </span>
                          )}
                          {m.status === 'pending' && m.calculatedBonus === 0 && (
                            <span className="text-[10px] text-amber-600 font-medium">
                              Pending Basis
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COMMISSION RECORDS (10-LEVEL) */}
      {activeTab === 'records' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search deal ID, associate name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#103858] focus:ring-2 focus:ring-[#103858]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#103858]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="eligible">Eligible</option>
                <option value="approved">Approved</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid / Settled</option>
                <option value="held">Held</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-[#103858] text-[10px] font-bold uppercase">
                  <th className="py-3 px-4 rounded-l-xl">Deal ID</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Associate</th>
                  <th className="py-3 px-4 text-center">Rate</th>
                  <th className="py-3 px-4 text-right">Commission</th>
                  <th className="py-3 px-4 text-right">Upfront</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Pending</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                      No matching commission records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#103858]">{r.transactionId}</td>

                      <td className="py-3 px-4">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-black ${
                            r.level === 1 ? 'bg-[#CCA02E] text-[#103858]' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          L{r.level}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-[#103858] block">{r.associateName}</span>
                        <span className="text-[10px] text-slate-400">{r.associateId}</span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-700">{r.rate}%</td>

                      <td className="py-3 px-4 text-right font-black text-[#103858]">
                        {formatINR(r.totalEligibleCommission)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {formatINR(r.upfrontAmount)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatINR(r.paidAmount)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-amber-700">
                        {formatINR(r.pendingAmount)}
                      </td>

                      <td className="py-3 px-4 text-center">
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

                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {r.status !== 'approved' && r.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => handleApproveRecord(r)}
                            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold cursor-pointer"
                            title="Approve Commission"
                          >
                            Approve
                          </button>
                        )}

                        {r.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayoutModal(r)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold cursor-pointer"
                            title="Disburse / Record Bank Payout"
                          >
                            Payout
                          </button>
                        )}

                        {r.status !== 'held' && (
                          <button
                            type="button"
                            onClick={() => handleOpenHoldModal(r)}
                            className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700 rounded text-[11px] font-semibold cursor-pointer"
                            title="Place on Hold"
                          >
                            Hold
                          </button>
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

      {/* MODAL: ADD QUALIFYING TRANSACTION */}
      <Modal
        isOpen={showAddTxModal}
        onClose={() => setShowAddTxModal(false)}
        title="Record Qualifying Property Deal"
        size="lg"
      >
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#103858] block">
                Select Project
              </label>
              <select
                value={newTx.projectId}
                onChange={(e) => {
                  const proj = projects.find((p) => p.id === e.target.value);
                  setNewTx({
                    ...newTx,
                    projectId: e.target.value,
                    projectName: proj?.projectName || '',
                  });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#103858] focus:ring-2 focus:ring-[#103858]"
                required
              >
                <option value="">-- Choose Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.city})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Unit / Plot Reference"
              placeholder="e.g. Plot B-14 (120 Sq.Yd)"
              value={newTx.unitOrPlotNumber}
              onChange={(e) => setNewTx({ ...newTx, unitOrPlotNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Qualifying Property Transaction Value (₹)"
              type="number"
              value={newTx.propertyValue}
              onChange={(e) => setNewTx({ ...newTx, propertyValue: Number(e.target.value) })}
              helperText="Benchmark default: ₹10,00,000 (20% Pool: ₹2,00,000)"
              required
            />

            <Input
              label="Eligible Collection Received (₹)"
              type="number"
              value={newTx.eligibleCollection}
              onChange={(e) => setNewTx({ ...newTx, eligibleCollection: Number(e.target.value) })}
              helperText="Verified booking / token clearance amount"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#103858] block">
                Direct Originating Associate
              </label>
              <select
                value={newTx.directAssociateId}
                onChange={(e) => setNewTx({ ...newTx, directAssociateId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#103858] focus:ring-2 focus:ring-[#103858]"
                required
              >
                <option value="">-- Select Direct Partner --</option>
                {associates.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.associateId || a.phone})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Customer Reference (Masked)"
              placeholder="e.g. Client #CR-8821"
              value={newTx.customerReference}
              onChange={(e) => setNewTx({ ...newTx, customerReference: e.target.value })}
              helperText="Sensitive customer details remain protected"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowAddTxModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="md"
              loading={txSubmitting}
              className="font-bold"
            >
              Generate 10-Level Commissions
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RECORD PAYOUT */}
      <Modal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        title="Record Payout / Bank Settlement"
        size="md"
      >
        <form onSubmit={handleConfirmPayout} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Deal ID:</span>
              <span className="font-bold text-[#103858]">{selectedRecordForPayout?.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Associate:</span>
              <span className="font-bold text-[#103858]">
                {selectedRecordForPayout?.associateName} (L{selectedRecordForPayout?.level})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Total Eligible:</span>
              <span className="font-black text-[#103858]">
                {formatINR(selectedRecordForPayout?.totalEligibleCommission || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Remaining Pending:</span>
              <span className="font-bold text-amber-700">
                {formatINR(selectedRecordForPayout?.pendingAmount || 0)}
              </span>
            </div>
          </div>

          <Input
            label="Disbursement Amount (₹)"
            type="number"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(Number(e.target.value))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#103858] block">
                Disbursement Type
              </label>
              <select
                value={payoutType}
                onChange={(e) => setPayoutType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#103858]"
              >
                <option value="upfront">25% Upfront Token</option>
                <option value="installment">Scheduled Installment</option>
                <option value="manual">Manual Adjustment</option>
              </select>
            </div>

            <Input
              label="Bank Reference / UTR"
              placeholder="e.g. UTR-HDFC-99210"
              value={payoutRef}
              onChange={(e) => setPayoutRef(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowPayoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="md"
              loading={payoutSubmitting}
              className="font-bold"
            >
              Confirm Settlement
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: HOLD REASON */}
      <Modal
        isOpen={showHoldModal}
        onClose={() => setShowHoldModal(false)}
        title="Place Commission on Administrative Hold"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Provide a clear reason for placing this commission record on hold (e.g., pending document verification, client token dispute, or KYC update).
          </p>

          <Input
            label="Reason for Hold"
            placeholder="e.g. Client KYC verification pending with registrar"
            value={holdReason}
            onChange={(e) => setHoldReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowHoldModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={handleConfirmHold}
              className="font-bold"
            >
              Confirm Hold
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: CALCULATE 1:1 MATCHING BONUS */}
      <Modal
        isOpen={showMatchingCalcModal}
        onClose={() => setShowMatchingCalcModal(false)}
        title="Execute 1:1 Matching Bonus Calculation"
        size="lg"
      >
        <form onSubmit={handleRunMatchingCalculation} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Align qualifying business volume between <strong>Side A</strong> and <strong>Side B</strong> for the selected associate. The engine will match at a 1:1 ratio, calculate the bonus according to the configured matching basis, and preserve unmatched volume as carry-forward.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#103858] block">
              Network Associate
            </label>
            <select
              value={matchingCalcAssocId}
              onChange={(e) => setMatchingCalcAssocId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#103858] focus:ring-2 focus:ring-[#103858]"
              required
            >
              <option value="">-- Select Associate for Matching Cycle --</option>
              {associates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.associateId || a.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Side A (Left) Eligible Volume (₹)"
              type="number"
              step="50000"
              value={matchingCalcSideA}
              onChange={(e) => setMatchingCalcSideA(Number(e.target.value))}
              helperText="Verified qualifying plot volume on Side A"
              required
            />

            <Input
              label="Side B (Right) Eligible Volume (₹)"
              type="number"
              step="50000"
              value={matchingCalcSideB}
              onChange={(e) => setMatchingCalcSideB(Number(e.target.value))}
              helperText="Verified qualifying plot volume on Side B"
              required
            />
          </div>

          <Input
            label="Reconciliation Cycle ID"
            placeholder="e.g. CYCLE-2026-Q4 or CYCLE-OCT-2026"
            value={matchingCalcCycleId}
            onChange={(e) => setMatchingCalcCycleId(e.target.value)}
            helperText="Cycle tracking identifier for audit and reconciliation"
            required
          />

          {/* Live Matching Engine Preview */}
          {(() => {
            const preview = calculateMatchingEngine(
              matchingCalcSideA,
              matchingCalcSideB,
              planConfig?.matchingBonus
            );
            return (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#103858]">
                  <span>Engine Calculation Preview (1:1 Ratio)</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      preview.isBasisConfigured
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {preview.isBasisConfigured ? 'Basis Active' : 'Pending Basis'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Matched Volume</span>
                    <span className="font-black text-[#103858]">
                      ₹{formatINR(preview.matchedValue)}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Carry Forward A</span>
                    <span className="font-bold text-blue-700">
                      ₹{formatINR(preview.carryForwardA)}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Carry Forward B</span>
                    <span className="font-bold text-purple-700">
                      ₹{formatINR(preview.carryForwardB)}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-200">
                  <span className="text-slate-600 font-medium text-[11px]">
                    Illustrative Matching Bonus ({preview.matchingRate}%):
                  </span>
                  <span className="font-black text-emerald-800 text-sm">
                    {preview.isBasisConfigured ? `₹${formatINR(preview.calculatedBonus)}` : '₹0 (Pending Basis)'}
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 italic">
                  {preview.statusNote}
                </p>
              </div>
            );
          })()}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowMatchingCalcModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="md"
              loading={matchingCalcSubmitting}
              className="font-bold"
            >
              Execute 1:1 Matching
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AdminCommissionsPage;
