import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import {
  CommissionPlanConfig,
  CommissionLevelConfig,
  QualifyingTransaction,
  CommissionRecord,
  CommissionPayoutEvent,
  Associate,
  DirectReferralConfig,
  MatchingBonusConfig,
  MatchingBonusBasis,
  DirectReferralRecord,
  DirectReferralRecordStatus,
  MatchingRecord,
  MatchingRecordStatus,
} from '../types';
import { logAudit } from './auditService';

export type {
  CommissionPlanConfig,
  CommissionLevelConfig,
  QualifyingTransaction,
  CommissionRecord,
  CommissionPayoutEvent,
  DirectReferralConfig,
  MatchingBonusConfig,
  MatchingBonusBasis,
  DirectReferralRecord,
  DirectReferralRecordStatus,
  MatchingRecord,
  MatchingRecordStatus,
};

export const COMPLIANCE_DISCLAIMER =
  'This business plan is illustrative and does not guarantee income or return. Commission eligibility depends on qualifying property transactions, eligible collections, applicable level qualification, documentation, approved company policy, cancellations, refunds, taxes and regulatory requirements. Final signed company agreements and policies shall prevail.';

export const BUSINESS_PLAN_DISCLOSURE =
  'Direct Referral and Matching Bonus illustrations are subject to qualifying property transactions, eligible collections, applicable qualification rules, documentation, cancellations, refunds, taxes and final approved company policy. They do not represent guaranteed income or returns.';

export const DEFAULT_COMMISSION_LEVELS: CommissionLevelConfig[] = [
  { level: 1, name: 'Level 1 — Direct Channel Associate', rate: 10.0, band: 1, bandName: 'Direct Level 1' },
  { level: 2, name: 'Level 2 Associate', rate: 2.0, band: 2, bandName: 'Early Network (Levels 2–4)' },
  { level: 3, name: 'Level 3 Associate', rate: 1.75, band: 2, bandName: 'Early Network (Levels 2–4)' },
  { level: 4, name: 'Level 4 Associate', rate: 1.5, band: 2, bandName: 'Early Network (Levels 2–4)' },
  { level: 5, name: 'Level 5 Associate', rate: 0.75, band: 3, bandName: 'Mid / Deep Network (Levels 5–8)' },
  { level: 6, name: 'Level 6 Associate', rate: 0.6, band: 3, bandName: 'Mid / Deep Network (Levels 5–8)' },
  { level: 7, name: 'Level 7 Associate', rate: 0.5, band: 3, bandName: 'Mid / Deep Network (Levels 5–8)' },
  { level: 8, name: 'Level 8 Associate', rate: 0.4, band: 3, bandName: 'Mid / Deep Network (Levels 5–8)' },
  { level: 9, name: 'Level 9 Associate', rate: 1.0, band: 4, bandName: 'Deep Network (Levels 9–10)' },
  { level: 10, name: 'Level 10 Associate', rate: 1.5, band: 4, bandName: 'Deep Network (Levels 9–10)' },
];

export const DEFAULT_DIRECT_REFERRAL_CONFIG: DirectReferralConfig = {
  rate: 10.0, // Default 10%
  approvalRequired: true,
  mapLevel1ToDirectReferral: true, // Prevent accidental double payment with Level 1
  allowSeparateLevel1Payment: false,
};

export const DEFAULT_MATCHING_BONUS_CONFIG: MatchingBonusConfig = {
  enabled: true,
  rate: 10.0, // Default 10%
  ratio: '1:1', // 1:1 Matching Ratio
  basis: 'unconfigured', // Until Admin explicitly selects/configures a calculation basis, do not automatically calculate or credit
  carryForwardEnabled: true,
  maxCarryForward: 0, // 0 = unlimited
  flushCycle: 'monthly',
  qualificationRequired: true,
  minEligibleBusiness: 0,
  approvalRequired: true,
  qualificationDescription: 'Matching qualification rules are pending configuration.',
};

export const DEFAULT_COMMISSION_PLAN_CONFIG: CommissionPlanConfig = {
  id: 'default',
  referencePropertyValue: 1000000, // ₹10,00,000
  totalPoolRate: 20.0, // 20.00%
  levels: DEFAULT_COMMISSION_LEVELS,
  upfrontPercentage: 25.0, // 25.0%
  tenureMonths1: 36, // 36 months
  tenureMonths2: 60, // 60 months
  enabled: false, // Default false: controlled by Super Admin
  disclaimer: COMPLIANCE_DISCLAIMER,
  directReferral: DEFAULT_DIRECT_REFERRAL_CONFIG,
  matchingBonus: DEFAULT_MATCHING_BONUS_CONFIG,
  updatedAt: Date.now(),
};

const LOCAL_STORAGE_CONFIG_KEY = 'cosy_reality_commission_plan_config';
const LOCAL_STORAGE_TRANSACTIONS_KEY = 'cosy_reality_qualifying_transactions';
const LOCAL_STORAGE_RECORDS_KEY = 'cosy_reality_commission_records';
const LOCAL_STORAGE_DIRECT_REFERRAL_KEY = 'cosy_reality_direct_referral_records';
const LOCAL_STORAGE_MATCHING_RECORDS_KEY = 'cosy_reality_matching_records';

// ----------------------------------------------------
// CALCULATION LOGIC
// ----------------------------------------------------

export interface LevelCalculationResult extends CommissionLevelConfig {
  commissionAmount: number;
  upfrontAmount: number;
  remainingAmount: number;
  monthly36: number;
  monthly60: number;
  shareOfPool: number; // percentage of total 20% commission pool
}

export interface BandCalculationResult {
  band: number;
  bandName: string;
  levelRange: string;
  combinedRate: number;
  combinedAmount: number;
  shareOfPool: number;
  description: string;
}

export interface CommissionCalculationSummary {
  propertyValue: number;
  totalPoolRate: number;
  totalCommissionAmount: number;
  upfrontPercentage: number;
  totalUpfrontAmount: number;
  totalRemainingAmount: number;
  tenureMonths1: number;
  tenureMonths2: number;
  totalMonthly36: number;
  totalMonthly60: number;
  levels: LevelCalculationResult[];
  bands: BandCalculationResult[];
  isStandardTotal: boolean;
  actualTotalRate: number;
}

export function calculateCommissionPlan(
  propertyValue: number,
  config: CommissionPlanConfig = DEFAULT_COMMISSION_PLAN_CONFIG
): CommissionCalculationSummary {
  const actualTotalRate = config.levels.reduce((sum, lvl) => sum + (Number(lvl.rate) || 0), 0);
  const totalCommissionAmount = (propertyValue * actualTotalRate) / 100;
  const upfrontPercentage = config.upfrontPercentage || 25.0;
  const totalUpfrontAmount = (totalCommissionAmount * upfrontPercentage) / 100;
  const totalRemainingAmount = totalCommissionAmount - totalUpfrontAmount;

  const tenureMonths1 = config.tenureMonths1 || 36;
  const tenureMonths2 = config.tenureMonths2 || 60;

  const totalMonthly36 = tenureMonths1 > 0 ? totalRemainingAmount / tenureMonths1 : 0;
  const totalMonthly60 = tenureMonths2 > 0 ? totalRemainingAmount / tenureMonths2 : 0;

  const levels: LevelCalculationResult[] = config.levels.map((lvl) => {
    const rate = Number(lvl.rate) || 0;
    const commissionAmount = (propertyValue * rate) / 100;
    const upfrontAmount = (commissionAmount * upfrontPercentage) / 100;
    const remainingAmount = commissionAmount - upfrontAmount;
    const monthly36 = tenureMonths1 > 0 ? remainingAmount / tenureMonths1 : 0;
    const monthly60 = tenureMonths2 > 0 ? remainingAmount / tenureMonths2 : 0;
    const shareOfPool = actualTotalRate > 0 ? (rate / actualTotalRate) * 100 : 0;

    return {
      ...lvl,
      rate,
      commissionAmount,
      upfrontAmount,
      remainingAmount,
      monthly36,
      monthly60,
      shareOfPool,
    };
  });

  // Calculate the 4 requested Bands
  // Band 1: Level 1 (Direct)
  const band1Levels = levels.filter((l) => l.band === 1 || l.level === 1);
  const band1Rate = band1Levels.reduce((s, l) => s + l.rate, 0);
  const band1Amount = band1Levels.reduce((s, l) => s + l.commissionAmount, 0);

  // Band 2: Levels 2 to 4 (Early Network)
  const band2Levels = levels.filter((l) => l.band === 2 || (l.level >= 2 && l.level <= 4));
  const band2Rate = band2Levels.reduce((s, l) => s + l.rate, 0);
  const band2Amount = band2Levels.reduce((s, l) => s + l.commissionAmount, 0);

  // Band 3: Levels 5 to 8 (Mid / Deep Network)
  const band3Levels = levels.filter((l) => l.band === 3 || (l.level >= 5 && l.level <= 8));
  const band3Rate = band3Levels.reduce((s, l) => s + l.rate, 0);
  const band3Amount = band3Levels.reduce((s, l) => s + l.commissionAmount, 0);

  // Band 4: Levels 9 to 10 (Deep Network Expansion)
  const band4Levels = levels.filter((l) => l.band === 4 || (l.level >= 9 && l.level <= 10));
  const band4Rate = band4Levels.reduce((s, l) => s + l.rate, 0);
  const band4Amount = band4Levels.reduce((s, l) => s + l.commissionAmount, 0);

  const bands: BandCalculationResult[] = [
    {
      band: 1,
      bandName: 'DIRECT LEVEL 1',
      levelRange: 'Level 1',
      combinedRate: band1Rate,
      combinedAmount: band1Amount,
      shareOfPool: actualTotalRate > 0 ? (band1Rate / actualTotalRate) * 100 : 50,
      description: 'Primary direct originator and customer relationship holder.',
    },
    {
      band: 2,
      bandName: 'EARLY NETWORK',
      levelRange: 'Levels 2 to 4',
      combinedRate: band2Rate,
      combinedAmount: band2Amount,
      shareOfPool: actualTotalRate > 0 ? (band2Rate / actualTotalRate) * 100 : 26.25,
      description: 'Active referral mentors and immediate regional sponsors.',
    },
    {
      band: 3,
      bandName: 'MID / DEEP NETWORK',
      levelRange: 'Levels 5 to 8',
      combinedRate: band3Rate,
      combinedAmount: band3Amount,
      shareOfPool: actualTotalRate > 0 ? (band3Rate / actualTotalRate) * 100 : 11.25,
      description: 'Senior tier business enablers and network coordinators.',
    },
    {
      band: 4,
      bandName: 'DEEP EXPANSION',
      levelRange: 'Levels 9 to 10',
      combinedRate: band4Rate,
      combinedAmount: band4Amount,
      shareOfPool: actualTotalRate > 0 ? (band4Rate / actualTotalRate) * 100 : 12.5,
      description: 'Broad ecosystem builders and strategic channel growth leaders.',
    },
  ];

  return {
    propertyValue,
    totalPoolRate: config.totalPoolRate || 20.0,
    totalCommissionAmount,
    upfrontPercentage,
    totalUpfrontAmount,
    totalRemainingAmount,
    tenureMonths1,
    tenureMonths2,
    totalMonthly36,
    totalMonthly60,
    levels,
    bands,
    isStandardTotal: Math.abs(actualTotalRate - 20.0) < 0.001,
    actualTotalRate,
  };
}

// ----------------------------------------------------
// CONFIGURATION PERSISTENCE
// ----------------------------------------------------

export interface MatchingCalculationResult {
  sideAEligibleValue: number;
  sideBEligibleValue: number;
  matchedValue: number;
  carryForwardA: number;
  carryForwardB: number;
  matchingRate: number;
  matchingRatio: string;
  matchingBasis: MatchingBonusBasis;
  calculatedBonus: number;
  isBasisConfigured: boolean;
  status: MatchingRecordStatus;
  statusNote: string;
}

export function calculateMatchingEngine(
  sideAEligibleValue: number,
  sideBEligibleValue: number,
  config?: MatchingBonusConfig
): MatchingCalculationResult {
  const cfg = config || DEFAULT_MATCHING_BONUS_CONFIG;
  const rate = Number(cfg.rate) || 10.0;
  const ratio = cfg.ratio || '1:1';
  const basis = cfg.basis || 'unconfigured';
  const carryEnabled = cfg.carryForwardEnabled !== false;
  const maxCarry = Number(cfg.maxCarryForward) || 0;

  // 1:1 Matching against QUALIFYING business values
  const matchedValue = Math.min(sideAEligibleValue, sideBEligibleValue);
  let carryForwardA = carryEnabled ? Math.max(0, sideAEligibleValue - matchedValue) : 0;
  let carryForwardB = carryEnabled ? Math.max(0, sideBEligibleValue - matchedValue) : 0;

  if (maxCarry > 0) {
    carryForwardA = Math.min(carryForwardA, maxCarry);
    carryForwardB = Math.min(carryForwardB, maxCarry);
  }

  let calculatedBonus = 0;
  let isBasisConfigured = false;
  let status: MatchingRecordStatus = 'pending';
  let statusNote = 'Matching qualification rules are pending configuration.';

  // IMPORTANT: Do NOT automatically calculate/credit unless Admin explicitly configured calculation basis
  if (basis === 'matched_business_volume') {
    isBasisConfigured = true;
    calculatedBonus = (matchedValue * rate) / 100;
    status = 'calculated';
    statusNote = `Calculated at ${rate}% on ₹${matchedValue.toLocaleString('en-IN')} 1:1 Matched Business Volume.`;
  } else if (basis === 'matched_commission') {
    isBasisConfigured = true;
    const baseCommission = matchedValue * 0.10; // 10% benchmark commission pool basis
    calculatedBonus = (baseCommission * rate) / 100;
    status = 'calculated';
    statusNote = `Calculated at ${rate}% on matched commission benchmark.`;
  } else if (basis === 'company_approved') {
    isBasisConfigured = true;
    calculatedBonus = (matchedValue * rate) / 100;
    status = 'calculated';
    statusNote = `Calculated per company-approved custom matching policy.`;
  } else {
    // 'unconfigured' or unselected
    isBasisConfigured = false;
    calculatedBonus = 0;
    status = 'pending';
    statusNote = 'Matching qualification rules are pending configuration.';
  }

  return {
    sideAEligibleValue,
    sideBEligibleValue,
    matchedValue,
    carryForwardA,
    carryForwardB,
    matchingRate: rate,
    matchingRatio: ratio,
    matchingBasis: basis,
    calculatedBonus,
    isBasisConfigured,
    status,
    statusNote,
  };
}

export async function getCommissionPlanConfig(): Promise<CommissionPlanConfig> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'commissionPlanConfig', 'default');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const raw = snap.data();
        return {
          ...DEFAULT_COMMISSION_PLAN_CONFIG,
          ...raw,
          directReferral: {
            ...DEFAULT_DIRECT_REFERRAL_CONFIG,
            ...(raw.directReferral || {}),
          },
          matchingBonus: {
            ...DEFAULT_MATCHING_BONUS_CONFIG,
            ...(raw.matchingBonus || {}),
          },
        } as CommissionPlanConfig;
      }
    } catch (err) {
      console.warn('Could not fetch commission plan config from Firestore:', err);
    }
  }

  const local = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
  if (local) {
    try {
      const raw = JSON.parse(local);
      return {
        ...DEFAULT_COMMISSION_PLAN_CONFIG,
        ...raw,
        directReferral: {
          ...DEFAULT_DIRECT_REFERRAL_CONFIG,
          ...(raw.directReferral || {}),
        },
        matchingBonus: {
          ...DEFAULT_MATCHING_BONUS_CONFIG,
          ...(raw.matchingBonus || {}),
        },
      };
    } catch {
      // fallback
    }
  }

  return DEFAULT_COMMISSION_PLAN_CONFIG;
}

export async function saveCommissionPlanConfig(
  config: Partial<CommissionPlanConfig>,
  userUid?: string,
  userName?: string
): Promise<CommissionPlanConfig> {
  const current = await getCommissionPlanConfig();
  const updated: CommissionPlanConfig = {
    ...current,
    ...config,
    updatedAt: Date.now(),
    updatedBy: userName || userUid || 'Admin',
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'commissionPlanConfig', 'default');
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn('Firestore commission plan config write fallback:', err);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(updated));

  await logAudit({
    action: 'update_commission_plan_config',
    collection: 'commissionPlanConfig',
    docId: 'default',
    performedByUid: userUid,
    performedByName: userName,
    details: {
      totalPoolRate: updated.totalPoolRate,
      referencePropertyValue: updated.referencePropertyValue,
      enabled: updated.enabled,
      upfrontPercentage: updated.upfrontPercentage,
    },
  });

  return updated;
}

// ----------------------------------------------------
// QUALIFYING TRANSACTIONS SERVICE
// ----------------------------------------------------

function getLocalTransactions(): QualifyingTransaction[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalTransactions(items: QualifyingTransaction[]) {
  localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(items));
}

export async function getQualifyingTransactions(filters?: {
  status?: string;
  directAssociateId?: string;
  projectId?: string;
}): Promise<QualifyingTransaction[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'qualifyingTransactions');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as QualifyingTransaction));
      if (items.length > 0) return items;
    } catch (err) {
      console.warn('Firestore qualifyingTransactions fetch fallback:', err);
    }
  }

  let items = getLocalTransactions();
  if (filters?.status && filters.status !== 'all') {
    items = items.filter((t) => t.transactionStatus === filters.status);
  }
  if (filters?.directAssociateId) {
    items = items.filter((t) => t.directAssociateId === filters.directAssociateId);
  }
  if (filters?.projectId) {
    items = items.filter((t) => t.projectId === filters.projectId);
  }
  return items;
}

export async function createQualifyingTransaction(
  data: Omit<QualifyingTransaction, 'id' | 'createdAt' | 'updatedAt'>,
  userUid?: string,
  userName?: string
): Promise<QualifyingTransaction> {
  const newId = 'tx_' + Math.random().toString(36).substring(2, 9) + Date.now();
  const tx: QualifyingTransaction = {
    ...data,
    id: newId,
    transactionId: data.transactionId || `TX-CR-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'qualifyingTransactions', newId);
      await setDoc(docRef, tx);
    } catch (err) {
      console.warn('Firestore qualifying transaction fallback:', err);
    }
  }

  const local = getLocalTransactions();
  local.unshift(tx);
  saveLocalTransactions(local);

  await logAudit({
    action: 'create_qualifying_transaction',
    collection: 'qualifyingTransactions',
    docId: newId,
    performedByUid: userUid,
    performedByName: userName,
    details: {
      transactionId: tx.transactionId,
      propertyValue: tx.propertyValue,
      directAssociateId: tx.directAssociateId,
      commissionEligible: tx.commissionEligible,
    },
  });

  return tx;
}

export async function updateQualifyingTransaction(
  id: string,
  data: Partial<QualifyingTransaction>,
  userUid?: string,
  userName?: string
): Promise<QualifyingTransaction | null> {
  let updated: QualifyingTransaction | null = null;
  const local = getLocalTransactions();
  const index = local.findIndex((t) => t.id === id);

  if (index >= 0) {
    local[index] = {
      ...local[index],
      ...data,
      updatedAt: Date.now(),
    };
    updated = local[index];
    saveLocalTransactions(local);
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'qualifyingTransactions', id);
      await updateDoc(docRef, { ...data, updatedAt: Date.now() });
    } catch (err) {
      console.warn('Firestore transaction update fallback:', err);
    }
  }

  await logAudit({
    action: 'update_qualifying_transaction',
    collection: 'qualifyingTransactions',
    docId: id,
    performedByUid: userUid,
    performedByName: userName,
    details: data,
  });

  return updated;
}

// ----------------------------------------------------
// COMMISSION RECORDS SERVICE
// ----------------------------------------------------

function getLocalCommissionRecords(): CommissionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCommissionRecords(items: CommissionRecord[]) {
  localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(items));
}

export async function getCommissionRecords(filters?: {
  associateId?: string;
  transactionId?: string;
  status?: string;
  level?: number;
}): Promise<CommissionRecord[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'commissionRecords');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as CommissionRecord));
      if (items.length > 0) return items;
    } catch (err) {
      console.warn('Firestore commissionRecords fetch fallback:', err);
    }
  }

  let items = getLocalCommissionRecords();
  if (filters?.associateId) {
    items = items.filter((r) => r.associateId === filters.associateId);
  }
  if (filters?.transactionId) {
    items = items.filter((r) => r.transactionId === filters.transactionId);
  }
  if (filters?.status && filters.status !== 'all') {
    items = items.filter((r) => r.status === filters.status);
  }
  if (filters?.level) {
    items = items.filter((r) => r.level === filters.level);
  }
  return items;
}

export async function generate10LevelCommissionsForTransaction(
  tx: QualifyingTransaction,
  associatesList: Associate[],
  config: CommissionPlanConfig,
  userUid?: string,
  userName?: string
): Promise<CommissionRecord[]> {
  const calculation = calculateCommissionPlan(tx.propertyValue, config);
  const createdRecords: CommissionRecord[] = [];

  // Identify direct associate
  const directAssociate = associatesList.find((a) => a.id === tx.directAssociateId);

  // Traverse sponsors upwards for up to 10 levels
  let currentAssocId: string | undefined = tx.directAssociateId;

  for (let i = 0; i < calculation.levels.length; i++) {
    const levelConfig = calculation.levels[i];
    const targetAssoc = associatesList.find((a) => a.id === currentAssocId);

    const recordId = `comm_${tx.transactionId}_L${levelConfig.level}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: CommissionRecord = {
      id: recordId,
      transactionId: tx.transactionId,
      associateId: targetAssoc?.id || `unassigned_L${levelConfig.level}`,
      associateName: targetAssoc?.name || (levelConfig.level === 1 ? tx.directAssociateName || 'Direct Associate' : `Upline Level ${levelConfig.level} Partner`),
      associatePhone: targetAssoc?.phone || '',
      level: levelConfig.level,
      rate: levelConfig.rate,
      qualifyingValue: tx.propertyValue,
      totalEligibleCommission: levelConfig.commissionAmount,
      upfrontAmount: levelConfig.upfrontAmount,
      remainingAmount: levelConfig.remainingAmount,
      payoutPlan: 'upfront_36m',
      monthlyPayoutAmount: levelConfig.monthly36,
      payoutTenureMonths: 36,
      paidAmount: 0,
      pendingAmount: levelConfig.commissionAmount,
      status: tx.commissionEligible ? 'eligible' : 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    createdRecords.push(newRecord);

    // Save locally
    const local = getLocalCommissionRecords();
    local.unshift(newRecord);
    saveLocalCommissionRecords(local);

    // Save to Firestore if available
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'commissionRecords', recordId);
        await setDoc(docRef, newRecord);
      } catch (err) {
        console.warn('Firestore commission record write error:', err);
      }
    }

    // Move to next sponsor
    currentAssocId = targetAssoc?.sponsorId || targetAssoc?.parentAssociateId;
  }

  // Create Direct Referral record for the Direct Associate (Level 1)
  // Preserves separate record while preventing double payout with Level 1
  try {
    const directRate = Number(config.directReferral?.rate) || 10.0;
    const directEligibleAmount = (tx.propertyValue * directRate) / 100;
    const directRecordId = `dir_ref_${tx.transactionId}_${Date.now()}`;
    const directRecord: DirectReferralRecord = {
      id: directRecordId,
      associateId: tx.directAssociateId,
      associateName: tx.directAssociateName || directAssociate?.name || 'Direct Associate',
      transactionId: tx.transactionId,
      projectId: tx.projectId,
      projectName: tx.projectName,
      inventoryId: tx.inventoryId,
      unitOrPlotNumber: tx.unitOrPlotNumber,
      qualifyingPlotValue: tx.propertyValue,
      directReferralRate: directRate,
      eligibleCommission: directEligibleAmount,
      approvedCommission: directEligibleAmount,
      status: tx.commissionEligible ? 'eligible' : 'pending',
      paidAmount: 0,
      pendingAmount: directEligibleAmount,
      isMappedFromLevel1: config.directReferral?.mapLevel1ToDirectReferral !== false,
      notes: 'Direct Referral identified from qualifying transaction with verified collection.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveDirectReferralRecord(directRecord);
  } catch (err) {
    console.warn('Direct referral record creation error:', err);
  }

  await logAudit({
    action: 'generate_10_level_commissions',
    collection: 'commissionRecords',
    docId: tx.transactionId,
    performedByUid: userUid,
    performedByName: userName,
    details: {
      transactionId: tx.transactionId,
      propertyValue: tx.propertyValue,
      totalRecordsCreated: createdRecords.length,
    },
  });

  return createdRecords;
}

export async function updateCommissionRecordStatus(
  recordId: string,
  status: CommissionRecord['status'],
  options?: {
    holdReason?: string;
    approvedBy?: string;
  },
  userUid?: string,
  userName?: string
): Promise<CommissionRecord | null> {
  const local = getLocalCommissionRecords();
  const index = local.findIndex((r) => r.id === recordId);
  let updated: CommissionRecord | null = null;

  if (index >= 0) {
    local[index] = {
      ...local[index],
      status,
      holdReason: options?.holdReason || local[index].holdReason,
      approvedAt: status === 'approved' ? Date.now() : local[index].approvedAt,
      approvedBy: options?.approvedBy || userName || local[index].approvedBy,
      updatedAt: Date.now(),
    };
    updated = local[index];
    saveLocalCommissionRecords(local);
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'commissionRecords', recordId);
      await updateDoc(docRef, {
        status,
        holdReason: options?.holdReason || '',
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn('Firestore commission status update fallback:', err);
    }
  }

  await logAudit({
    action: 'update_commission_record_status',
    collection: 'commissionRecords',
    docId: recordId,
    performedByUid: userUid,
    performedByName: userName,
    details: {
      status,
      options,
    },
  });

  return updated;
}

export async function recordCommissionPayout(
  recordId: string,
  event: Omit<CommissionPayoutEvent, 'id'>,
  userUid?: string,
  userName?: string
): Promise<CommissionRecord | null> {
  const local = getLocalCommissionRecords();
  const index = local.findIndex((r) => r.id === recordId);
  if (index < 0) return null;

  const current = local[index];
  const newPayoutEvent: CommissionPayoutEvent = {
    ...event,
    id: `payout_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    recordedBy: userName || userUid || 'Admin',
  };

  const newPaidAmount = (current.paidAmount || 0) + event.amount;
  const newPendingAmount = Math.max(0, current.totalEligibleCommission - newPaidAmount);

  let newStatus = current.status;
  if (newPendingAmount <= 0) {
    newStatus = 'paid';
  } else if (newPaidAmount > 0) {
    newStatus = 'partially_paid';
  }

  const updatedHistory = [...(current.payoutHistory || []), newPayoutEvent];

  local[index] = {
    ...current,
    paidAmount: newPaidAmount,
    pendingAmount: newPendingAmount,
    status: newStatus,
    payoutHistory: updatedHistory,
    updatedAt: Date.now(),
  };

  saveLocalCommissionRecords(local);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'commissionRecords', recordId);
      await updateDoc(docRef, {
        paidAmount: newPaidAmount,
        pendingAmount: newPendingAmount,
        status: newStatus,
        payoutHistory: updatedHistory,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn('Firestore payout event update fallback:', err);
    }
  }

  await logAudit({
    action: 'record_commission_payout',
    collection: 'commissionRecords',
    docId: recordId,
    performedByUid: userUid,
    performedByName: userName,
    details: {
      amount: event.amount,
      type: event.type,
      referenceNumber: event.referenceNumber,
      newPaidAmount,
      newPendingAmount,
    },
  });

  return local[index];
}

// ----------------------------------------------------
// DIRECT REFERRAL RECORDS SERVICE
// ----------------------------------------------------

export function getLocalDirectReferralRecords(): DirectReferralRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DIRECT_REFERRAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalDirectReferralRecords(items: DirectReferralRecord[]) {
  localStorage.setItem(LOCAL_STORAGE_DIRECT_REFERRAL_KEY, JSON.stringify(items));
}

export async function getDirectReferralRecords(filters?: {
  associateId?: string;
  transactionId?: string;
  status?: string;
}): Promise<DirectReferralRecord[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'directReferralRecords');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as DirectReferralRecord));
      if (items.length > 0) {
        let filtered = items;
        if (filters?.associateId) filtered = filtered.filter((r) => r.associateId === filters.associateId);
        if (filters?.transactionId) filtered = filtered.filter((r) => r.transactionId === filters.transactionId);
        if (filters?.status && filters.status !== 'all') filtered = filtered.filter((r) => r.status === filters.status);
        return filtered;
      }
    } catch (err) {
      console.warn('Firestore directReferralRecords fetch fallback:', err);
    }
  }

  let items = getLocalDirectReferralRecords();
  if (filters?.associateId) {
    items = items.filter((r) => r.associateId === filters.associateId);
  }
  if (filters?.transactionId) {
    items = items.filter((r) => r.transactionId === filters.transactionId);
  }
  if (filters?.status && filters.status !== 'all') {
    items = items.filter((r) => r.status === filters.status);
  }
  return items;
}

export async function saveDirectReferralRecord(record: DirectReferralRecord): Promise<DirectReferralRecord> {
  const local = getLocalDirectReferralRecords();
  const existingIdx = local.findIndex((r) => r.id === record.id);
  if (existingIdx >= 0) {
    local[existingIdx] = record;
  } else {
    local.unshift(record);
  }
  saveLocalDirectReferralRecords(local);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'directReferralRecords', record.id);
      await setDoc(docRef, record);
    } catch (err) {
      console.warn('Firestore direct referral record write error:', err);
    }
  }

  return record;
}

export async function updateDirectReferralRecordStatus(
  recordId: string,
  status: DirectReferralRecordStatus,
  options?: {
    approvedBy?: string;
    approvedCommission?: number;
    notes?: string;
  },
  userUid?: string,
  userName?: string
): Promise<DirectReferralRecord | null> {
  const local = getLocalDirectReferralRecords();
  const index = local.findIndex((r) => r.id === recordId);
  let updated: DirectReferralRecord | null = null;

  if (index >= 0) {
    local[index] = {
      ...local[index],
      status,
      approvedCommission: options?.approvedCommission !== undefined ? options.approvedCommission : local[index].approvedCommission,
      approvedAt: status === 'approved' ? Date.now() : local[index].approvedAt,
      approvedBy: options?.approvedBy || userName || local[index].approvedBy,
      notes: options?.notes || local[index].notes,
      updatedAt: Date.now(),
    };
    updated = local[index];
    saveLocalDirectReferralRecords(local);
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'directReferralRecords', recordId);
      await updateDoc(docRef, {
        status,
        approvedAt: status === 'approved' ? Date.now() : undefined,
        approvedBy: options?.approvedBy || userName || 'Admin',
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn('Firestore direct referral status update fallback:', err);
    }
  }

  await logAudit({
    action: 'update_direct_referral_status',
    collection: 'directReferralRecords',
    docId: recordId,
    performedByUid: userUid,
    performedByName: userName,
    details: { status, options },
  });

  return updated;
}

// ----------------------------------------------------
// 1:1 MATCHING RECORDS SERVICE
// ----------------------------------------------------

export function getLocalMatchingRecords(): MatchingRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MATCHING_RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalMatchingRecords(items: MatchingRecord[]) {
  localStorage.setItem(LOCAL_STORAGE_MATCHING_RECORDS_KEY, JSON.stringify(items));
}

export async function getMatchingRecords(filters?: {
  associateId?: string;
  cycleId?: string;
  status?: string;
}): Promise<MatchingRecord[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'matchingRecords');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as MatchingRecord));
      if (items.length > 0) {
        let filtered = items;
        if (filters?.associateId) filtered = filtered.filter((r) => r.associateId === filters.associateId);
        if (filters?.cycleId) filtered = filtered.filter((r) => r.cycleId === filters.cycleId);
        if (filters?.status && filters.status !== 'all') filtered = filtered.filter((r) => r.status === filters.status);
        return filtered;
      }
    } catch (err) {
      console.warn('Firestore matchingRecords fetch fallback:', err);
    }
  }

  let items = getLocalMatchingRecords();
  if (filters?.associateId) {
    items = items.filter((r) => r.associateId === filters.associateId);
  }
  if (filters?.cycleId) {
    items = items.filter((r) => r.cycleId === filters.cycleId);
  }
  if (filters?.status && filters.status !== 'all') {
    items = items.filter((r) => r.status === filters.status);
  }
  return items;
}

export async function saveMatchingRecord(record: MatchingRecord): Promise<MatchingRecord> {
  const local = getLocalMatchingRecords();
  const existingIdx = local.findIndex((r) => r.id === record.id);
  if (existingIdx >= 0) {
    local[existingIdx] = record;
  } else {
    local.unshift(record);
  }
  saveLocalMatchingRecords(local);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'matchingRecords', record.id);
      await setDoc(docRef, record);
    } catch (err) {
      console.warn('Firestore matching record write error:', err);
    }
  }

  return record;
}

export async function updateMatchingRecordStatus(
  recordId: string,
  status: MatchingRecordStatus,
  options?: {
    approvedBy?: string;
    approvedBonus?: number;
    notes?: string;
  },
  userUid?: string,
  userName?: string
): Promise<MatchingRecord | null> {
  const local = getLocalMatchingRecords();
  const index = local.findIndex((r) => r.id === recordId);
  let updated: MatchingRecord | null = null;

  if (index >= 0) {
    const cur = local[index];
    local[index] = {
      ...cur,
      status,
      approvedBonus: options?.approvedBonus !== undefined ? options.approvedBonus : cur.approvedBonus || cur.calculatedBonus,
      approvedAt: status === 'approved' ? Date.now() : cur.approvedAt,
      approvedBy: options?.approvedBy || userName || cur.approvedBy,
      notes: options?.notes || cur.notes,
      updatedAt: Date.now(),
    };
    updated = local[index];
    saveLocalMatchingRecords(local);
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'matchingRecords', recordId);
      await updateDoc(docRef, {
        status,
        approvedAt: status === 'approved' ? Date.now() : undefined,
        approvedBy: options?.approvedBy || userName || 'Admin',
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn('Firestore matching record status update fallback:', err);
    }
  }

  await logAudit({
    action: 'update_matching_record_status',
    collection: 'matchingRecords',
    docId: recordId,
    performedByUid: userUid,
    performedByName: userName,
    details: { status, options },
  });

  return updated;
}

export async function createMatchingCalculationForAssociate(
  associate: Associate,
  sideAEligibleValue: number,
  sideBEligibleValue: number,
  cycleId: string,
  config: CommissionPlanConfig,
  userUid?: string,
  userName?: string
): Promise<MatchingRecord> {
  const calc = calculateMatchingEngine(sideAEligibleValue, sideBEligibleValue, config.matchingBonus);

  const newRecord: MatchingRecord = {
    id: `match_${associate.id}_${Date.now()}`,
    associateId: associate.id,
    associateName: associate.name,
    cycleId: cycleId || `CYCLE-${new Date().getFullYear()}-M${new Date().getMonth() + 1}`,
    sideAEligibleValue: calc.sideAEligibleValue,
    sideBEligibleValue: calc.sideBEligibleValue,
    matchedValue: calc.matchedValue,
    carryForwardA: calc.carryForwardA,
    carryForwardB: calc.carryForwardB,
    matchingRate: calc.matchingRate,
    matchingRatio: calc.matchingRatio,
    matchingBasis: calc.matchingBasis,
    calculatedBonus: calc.calculatedBonus,
    approvedBonus: 0,
    paidBonus: 0,
    status: calc.status,
    notes: calc.statusNote,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveMatchingRecord(newRecord);

  await logAudit({
    action: 'calculate_1to1_matching_bonus',
    collection: 'matchingRecords',
    docId: newRecord.id,
    performedByUid: userUid,
    performedByName: userName,
    details: {
      associateId: associate.id,
      sideA: sideAEligibleValue,
      sideB: sideBEligibleValue,
      matchedValue: calc.matchedValue,
      calculatedBonus: calc.calculatedBonus,
      matchingBasis: calc.matchingBasis,
    },
  });

  return newRecord;
}

// ----------------------------------------------------
// SEEDING DATA FOR 10-LEVEL ASSOCIATE DEMO
// ----------------------------------------------------

export async function seedSampleCommissionModuleData() {
  const config = await getCommissionPlanConfig();
  await saveCommissionPlanConfig(config, 'system', 'System Init');

  // Create sample 10-tier associate chain
  const sampleAssociates: Associate[] = [
    {
      id: 'assoc_l1_rajesh',
      associateId: 'CR-ASC-1001',
      name: 'Rajesh Sharma',
      phone: '+91 98101 23456',
      email: 'rajesh.sharma@example.com',
      city: 'Noida',
      status: 'approved',
      active: true,
      kycStatus: 'verified',
      agreementStatus: 'signed',
      sponsorId: 'assoc_l2_vikram',
      joinedAt: Date.now() - 60 * 86400000,
      createdAt: Date.now() - 60 * 86400000,
    },
    {
      id: 'assoc_l2_vikram',
      associateId: 'CR-ASC-1002',
      name: 'Vikram Malhotra',
      phone: '+91 98202 34567',
      email: 'vikram.malhotra@example.com',
      city: 'Greater Noida',
      status: 'approved',
      active: true,
      kycStatus: 'verified',
      agreementStatus: 'signed',
      sponsorId: 'assoc_l3_amit',
      joinedAt: Date.now() - 90 * 86400000,
      createdAt: Date.now() - 90 * 86400000,
    },
    {
      id: 'assoc_l3_amit',
      associateId: 'CR-ASC-1003',
      name: 'Amit Verma',
      phone: '+91 98303 45678',
      email: 'amit.verma@example.com',
      city: 'Delhi NCR',
      status: 'approved',
      active: true,
      kycStatus: 'verified',
      agreementStatus: 'signed',
      sponsorId: 'assoc_l4_priya',
      joinedAt: Date.now() - 120 * 86400000,
      createdAt: Date.now() - 120 * 86400000,
    },
    {
      id: 'assoc_l4_priya',
      associateId: 'CR-ASC-1004',
      name: 'Priya Sundaram',
      phone: '+91 98404 56789',
      email: 'priya.sundaram@example.com',
      city: 'Gurugram',
      status: 'approved',
      active: true,
      kycStatus: 'verified',
      agreementStatus: 'signed',
      sponsorId: 'assoc_l5_manoj',
      joinedAt: Date.now() - 150 * 86400000,
      createdAt: Date.now() - 150 * 86400000,
    },
    {
      id: 'assoc_l5_manoj',
      associateId: 'CR-ASC-1005',
      name: 'Manoj Gupta',
      phone: '+91 98505 67890',
      email: 'manoj.gupta@example.com',
      city: 'Faridabad',
      status: 'approved',
      active: true,
      kycStatus: 'verified',
      agreementStatus: 'signed',
      sponsorId: 'assoc_l6_sunita',
      joinedAt: Date.now() - 180 * 86400000,
      createdAt: Date.now() - 180 * 86400000,
    },
  ];

  // Save associates locally
  const currentAssocsRaw = localStorage.getItem('cosy_reality_associates');
  const currentAssocs: Associate[] = currentAssocsRaw ? JSON.parse(currentAssocsRaw) : [];
  for (const sa of sampleAssociates) {
    if (!currentAssocs.some((a) => a.id === sa.id)) {
      currentAssocs.push(sa);
    }
  }
  localStorage.setItem('cosy_reality_associates', JSON.stringify(currentAssocs));

  // Create Reference Transaction: ₹10,00,000 on Cosy Palm Meadows
  const sampleTx: QualifyingTransaction = {
    id: 'tx_sample_ref_10l',
    transactionId: 'TX-CR-1008',
    projectId: 'proj_palm_meadows',
    projectName: 'Cosy Palm Meadows — Sector 18',
    inventoryId: 'inv_pm_b1_p04',
    unitOrPlotNumber: 'Plot B-14 (120 Sq.Yd)',
    propertyValue: 1000000, // ₹10,00,000 Reference Value
    eligibleCollection: 1000000,
    customerReference: 'Client #CR-CL-8891 (Verified)',
    directAssociateId: 'assoc_l1_rajesh',
    directAssociateName: 'Rajesh Sharma (CR-ASC-1001)',
    transactionStatus: 'completed',
    commissionEligible: true,
    qualificationDate: new Date().toISOString().split('T')[0],
    notes: 'Reference qualifying property transaction with complete collection clearance.',
    createdAt: Date.now() - 14 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
  };

  const currentTxs = getLocalTransactions();
  if (!currentTxs.some((t) => t.id === sampleTx.id)) {
    currentTxs.unshift(sampleTx);
    saveLocalTransactions(currentTxs);

    // Generate 10-level commission records (also creates Direct Referral record)
    await generate10LevelCommissionsForTransaction(
      sampleTx,
      currentAssocs,
      config,
      'system',
      'Initial System Seeder'
    );
  }

  // Seed sample Matching records for demonstration of 1:1 matching engine
  const existingMatches = getLocalMatchingRecords();
  if (existingMatches.length === 0) {
    const sampleMatches: MatchingRecord[] = [
      {
        id: 'match_sample_rajesh_q3',
        associateId: 'assoc_l1_rajesh',
        associateName: 'Rajesh Sharma',
        cycleId: 'CYCLE-2026-Q3',
        sideAEligibleValue: 1500000,
        sideBEligibleValue: 1000000,
        matchedValue: 1000000,
        carryForwardA: 500000,
        carryForwardB: 0,
        matchingRate: 10.0,
        matchingRatio: '1:1',
        matchingBasis: 'matched_business_volume',
        calculatedBonus: 100000,
        approvedBonus: 100000,
        paidBonus: 100000,
        status: 'approved',
        notes: '1:1 Matched on ₹10,00,000 volume with ₹5,00,000 Side A carry forward.',
        createdAt: Date.now() - 20 * 86400000,
        approvedAt: Date.now() - 15 * 86400000,
        approvedBy: 'Super Admin',
        updatedAt: Date.now() - 15 * 86400000,
      },
      {
        id: 'match_sample_vikram_q4',
        associateId: 'assoc_l2_vikram',
        associateName: 'Vikram Malhotra',
        cycleId: 'CYCLE-2026-Q4',
        sideAEligibleValue: 2000000,
        sideBEligibleValue: 2000000,
        matchedValue: 2000000,
        carryForwardA: 0,
        carryForwardB: 0,
        matchingRate: 10.0,
        matchingRatio: '1:1',
        matchingBasis: 'unconfigured',
        calculatedBonus: 0,
        approvedBonus: 0,
        paidBonus: 0,
        status: 'pending',
        notes: 'Matching qualification rules are pending configuration.',
        createdAt: Date.now() - 5 * 86400000,
        updatedAt: Date.now() - 5 * 86400000,
      },
    ];

    for (const m of sampleMatches) {
      await saveMatchingRecord(m);
    }
  }
}
