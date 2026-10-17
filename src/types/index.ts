export type InventoryStatus = 'booking' | 'waiting' | 'sold';

export type ProjectStatus = 'Ongoing' | 'Upcoming' | 'Completed';

export type ProjectType = 'Plotted Development' | 'Residential' | 'Commercial' | 'Villas' | string;

export type LeadStage =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'site_visit'
  | 'site_visit_scheduled'
  | 'negotiation'
  | 'booking'
  | 'booking_done'
  | 'closed_won'
  | 'closed_lost';

export type SiteVisitStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'visited'
  | 'cancelled'
  | 'rescheduled'
  | 'follow_up';

export type AssociateStatus = 'pending' | 'approved' | 'rejected' | 'contacted';

export type AdminRole = 'super_admin' | 'sales_admin' | 'inventory_manager';

export type AreaUnit = 'Sq. Ft.' | 'Sq. Yard' | 'Sq. Yards' | 'Sq. Meter' | 'Acre' | 'Bigha' | string;

export interface ProjectFaq {
  question: string;
  answer: string;
}

export interface PaymentPlanStage {
  stage: string;
  percentage: number;
  description?: string;
}

export interface Project {
  id: string;
  projectName: string;
  slug: string;
  shortDescription: string;
  description: string;
  location: string;
  city: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  projectType: ProjectType;
  projectStatus: ProjectStatus;
  reraNumber?: string;
  startingPrice: number;
  maximumPrice?: number;
  rate?: number;
  rateUnit?: AreaUnit;
  totalArea?: string;
  projectArea?: string;
  totalUnits?: number;
  propertySizes?: string;
  possession?: string;
  possessionDate?: string;
  launchDate?: string;
  featured?: boolean;
  heroImage?: string;
  thumbnail?: string;
  gallery?: string[];
  masterPlan?: string;
  masterPlanUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  brochureUrl?: string;
  amenities?: string[];
  highlights?: string[];
  locationAdvantages?: string[];
  sitePlanUrl?: string;
  routeMapUrl?: string;
  siteAreaBreakdown?: {
    totalArea?: string;
    farmArea?: string;
    plotArea?: string;
    parkArea?: string;
    roadArea?: string;
    additionalRoadArea?: string;
  };
  components?: string[];
  developerInfo?: string;
  associatedProjects?: string[];
  showAssociatedProjects?: boolean;
  faqs?: ProjectFaq[];
  paymentPlan?: PaymentPlanStage[];
  seoTitle?: string;
  seoDescription?: string;
  active?: boolean;
  isDemo?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface InventoryItem {
  id: string;
  projectId: string;
  projectName: string;
  block?: string;
  sector?: string;
  phase?: string;
  tower?: string;
  floor?: string | number;
  plotNumber?: string;
  unitNumber: string;
  propertyType?: string;
  size: number;
  sizeUnit?: AreaUnit;
  length?: number;
  width?: number;
  facing?: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West' | string;
  roadWidth?: string;
  cornerPlot?: boolean;
  baseRate?: number;
  finalPrice: number;
  bookingAmount?: number;
  plc?: number;
  status: InventoryStatus;
  publicNotes?: string;
  privateNotes?: string;
  internalNotes?: string;
  isDemo?: boolean;
  createdAt?: number;
  updatedAt?: number;
  updatedBy?: string;
}

export interface StatusHistory {
  id: string;
  inventoryId: string;
  unitNumber?: string;
  projectId?: string;
  previousStatus?: InventoryStatus;
  oldStatus?: InventoryStatus;
  newStatus: InventoryStatus;
  changedBy?: string;
  changedByUid?: string;
  changedByName?: string;
  reason?: string;
  timestamp?: number;
  createdAt?: number;
}

export type StatusHistoryItem = StatusHistory;

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  mobile?: string;
  whatsapp?: string;
  email?: string;
  projectId?: string;
  projectName?: string;
  inventoryId?: string;
  unitNumber?: string;
  budget?: string;
  propertyType?: string;
  source: string;
  message?: string;
  stage?: LeadStage;
  status?: LeadStage;
  assignedTo?: string;
  assignedToName?: string;
  followUpDate?: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface SiteVisit {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  projectId?: string;
  projectName?: string;
  preferredDate: string;
  preferredTime: string;
  visitorsCount?: number;
  numberOfVisitors?: number;
  pickupRequired?: boolean;
  pickupAddress?: string;
  message?: string;
  status: SiteVisitStatus;
  adminNotes?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Associate {
  id: string;
  uid?: string;
  associateId?: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  companyName?: string;
  city: string;
  experience?: string;
  experienceYears?: number;
  currentProfession?: string;
  reraNumber?: string;
  message?: string;
  status: AssociateStatus;
  sponsorId?: string;
  parentAssociateId?: string;
  active?: boolean;
  kycStatus?: 'pending' | 'submitted' | 'verified' | 'rejected';
  agreementStatus?: 'pending' | 'signed' | 'expired';
  joinedAt?: number;
  adminNotes?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CommissionLevelConfig {
  level: number;
  name: string;
  rate: number; // e.g. 10.0, 2.0, 1.75
  band: 1 | 2 | 3 | 4;
  bandName: string;
}

export type MatchingBonusBasis =
  | 'unconfigured'
  | 'matched_business_volume'
  | 'matched_commission'
  | 'company_approved';

export interface MatchingBonusConfig {
  enabled: boolean;
  rate: number; // Default 10%
  ratio: string; // Default "1:1"
  basis: MatchingBonusBasis;
  carryForwardEnabled: boolean;
  maxCarryForward: number; // 0 = unlimited
  flushCycle: 'none' | 'monthly' | 'quarterly' | 'yearly';
  qualificationRequired: boolean;
  minEligibleBusiness: number;
  approvalRequired: boolean;
  qualificationDescription?: string;
}

export interface DirectReferralConfig {
  rate: number; // Default 10%
  approvalRequired: boolean;
  mapLevel1ToDirectReferral: boolean; // Prevent double payment with Level 1
  allowSeparateLevel1Payment: boolean; // Explicit toggle required to pay both
}

export interface CommissionPlanConfig {
  id: string;
  referencePropertyValue: number; // Default 1000000 (₹10 Lakh)
  totalPoolRate: number; // Default 20.0%
  levels: CommissionLevelConfig[];
  upfrontPercentage: number; // Default 25.0%
  tenureMonths1: number; // Default 36
  tenureMonths2: number; // Default 60
  enabled: boolean;
  disclaimer: string;
  // New Business Plan Components
  directReferral?: DirectReferralConfig;
  matchingBonus?: MatchingBonusConfig;
  updatedAt?: number;
  updatedBy?: string;
}

// ----------------------------------------------------
// DIRECT REFERRAL RECORD ARCHITECTURE
// ----------------------------------------------------
export type DirectReferralRecordStatus =
  | 'pending'
  | 'eligible'
  | 'approved'
  | 'partially_paid'
  | 'paid'
  | 'held'
  | 'cancelled';

export interface DirectReferralRecord {
  id: string;
  associateId: string;
  associateName?: string;
  transactionId: string;
  projectId: string;
  projectName?: string;
  inventoryId?: string;
  unitOrPlotNumber?: string;
  qualifyingPlotValue: number;
  directReferralRate: number; // Default 10%
  eligibleCommission: number;
  approvedCommission: number;
  paidAmount?: number;
  pendingAmount?: number;
  status: DirectReferralRecordStatus;
  isMappedFromLevel1?: boolean;
  notes?: string;
  createdAt: number;
  approvedAt?: number;
  approvedBy?: string;
  updatedAt?: number;
}

// ----------------------------------------------------
// 1:1 MATCHING BONUS RECORD ARCHITECTURE
// ----------------------------------------------------
export type MatchingRecordStatus =
  | 'pending'
  | 'calculated'
  | 'approved'
  | 'held'
  | 'paid'
  | 'cancelled';

export interface MatchingRecord {
  id: string;
  associateId: string;
  associateName?: string;
  cycleId: string;
  sideAEligibleValue: number;
  sideBEligibleValue: number;
  matchedValue: number;
  carryForwardA: number;
  carryForwardB: number;
  matchingRate: number;
  matchingRatio: string;
  matchingBasis: MatchingBonusBasis;
  calculatedBonus: number;
  approvedBonus: number;
  paidBonus?: number;
  status: MatchingRecordStatus;
  notes?: string;
  createdAt: number;
  approvedAt?: number;
  approvedBy?: string;
  updatedAt?: number;
}

export type QualifyingTransactionStatus = 'active' | 'completed' | 'cancelled' | 'refunded';

export interface QualifyingTransaction {
  id: string;
  transactionId: string;
  projectId: string;
  projectName?: string;
  inventoryId?: string;
  unitOrPlotNumber?: string;
  propertyValue: number;
  eligibleCollection: number;
  customerReference: string; // Masked customer identifier, e.g. "Cust-CR-9042"
  directAssociateId: string;
  directAssociateName?: string;
  transactionStatus: QualifyingTransactionStatus;
  commissionEligible: boolean;
  qualificationDate: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

export type CommissionRecordStatus =
  | 'pending'
  | 'eligible'
  | 'approved'
  | 'partially_paid'
  | 'paid'
  | 'cancelled'
  | 'held';

export interface CommissionPayoutEvent {
  id: string;
  amount: number;
  date: number;
  type: 'upfront' | 'installment' | 'manual';
  referenceNumber?: string;
  notes?: string;
  recordedBy?: string;
}

export interface CommissionRecord {
  id: string;
  transactionId: string;
  associateId: string;
  associateName?: string;
  associatePhone?: string;
  level: number; // 1 to 10
  rate: number; // e.g. 10.0
  qualifyingValue: number;
  totalEligibleCommission: number;
  upfrontAmount: number;
  remainingAmount: number;
  payoutPlan: 'upfront_36m' | 'upfront_60m' | 'custom' | 'lump_sum';
  monthlyPayoutAmount?: number;
  payoutTenureMonths?: number;
  paidAmount: number;
  pendingAmount: number;
  status: CommissionRecordStatus;
  payoutHistory?: CommissionPayoutEvent[];
  holdReason?: string;
  approvedAt?: number;
  approvedBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  clientName?: string;
  designation?: string;
  location?: string;
  projectName?: string;
  review: string;
  rating: number;
  imageUrl?: string;
  featured?: boolean;
  published?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface Settings {
  companyName: string;
  tagline: string;
  yearsOfExperience?: number;
  experienceYears?: number | string;
  phone: string;
  alternatePhone?: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours: string;
  googleMapsUrl?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  heroImage?: string;
  logoUrl?: string;
  faviconUrl?: string;
  footerText?: string;
  developerCredit?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  showAssociates?: boolean;
  showAssociatesPage?: boolean;
  showCommissionPlan?: boolean;
  showTestimonials?: boolean;
  showStatistics?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  active?: boolean;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  collection?: string;
  collectionName?: string;
  recordId?: string;
  docId?: string;
  performedByUid?: string;
  performedByName?: string;
  timestamp?: number;
  details?: any;
  oldValue?: any;
  newValue?: any;
  createdAt?: number;
}
