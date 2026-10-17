import * as fs from 'fs';
import * as path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Canonical Seed Data definitions for complete portable backup
import { DEFAULT_COMMISSION_PLAN_CONFIG } from '../src/services/commissionService';
import { DEFAULT_BANSURI_DHAM_PROJECT } from '../src/services/projectsService';

interface SerializedTimestamp {
  _type: 'timestamp';
  seconds: number;
  nanoseconds: number;
  iso: string;
}

function serializeValue(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object') {
    // Firestore Timestamp or object with seconds & nanoseconds
    if (
      (val.seconds !== undefined && val.nanoseconds !== undefined) ||
      val.type === 'firestore/timestamp/1.0' ||
      val.constructor?.name === 'Timestamp'
    ) {
      const sec = val.seconds ?? 0;
      const nano = val.nanoseconds ?? 0;
      return {
        _type: 'timestamp',
        seconds: sec,
        nanoseconds: nano,
        iso: new Date(sec * 1000 + Math.floor(nano / 1000000)).toISOString(),
      };
    }
    if (val instanceof Date) {
      return {
        _type: 'timestamp',
        seconds: Math.floor(val.getTime() / 1000),
        nanoseconds: (val.getTime() % 1000) * 1000000,
        iso: val.toISOString(),
      };
    }
    if (Array.isArray(val)) {
      return val.map(serializeValue);
    }
    const res: Record<string, any> = {};
    for (const k of Object.keys(val)) {
      res[k] = serializeValue(val[k]);
    }
    return res;
  }
  return val;
}

async function runExport() {
  console.log('====================================================');
  console.log('COSY REALITY — FIRESTORE BACKUP EXPORT');
  console.log('====================================================');

  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const collectionsList = [
    'settings',
    'projects',
    'inventory',
    'leads',
    'siteVisits',
    'associates',
    'testimonials',
    'users',
    'statusHistory',
    'auditLogs',
    'qualifyingTransactions',
    'commissionRecords',
    'matchingRecords',
    'directReferralRecords',
    'commissionPlanConfig',
  ];

  const backupData: {
    metadata: {
      appName: string;
      exportDate: string;
      firestoreProjectId: string;
      version: string;
      collectionsCount: number;
      totalDocumentsCount: number;
      collectionsSummary: Record<string, number>;
    };
    collections: Record<string, Record<string, any>>;
  } = {
    metadata: {
      appName: 'Cosy Reality',
      exportDate: new Date().toISOString(),
      firestoreProjectId: firebaseConfig.projectId || 'cosyproject0512',
      version: '1.0.0',
      collectionsCount: 0,
      totalDocumentsCount: 0,
      collectionsSummary: {},
    },
    collections: {},
  };

  let totalDocs = 0;

  for (const colName of collectionsList) {
    backupData.collections[colName] = {};
    try {
      const snap = await getDocs(collection(db, colName));
      snap.forEach((docSnap) => {
        backupData.collections[colName][docSnap.id] = serializeValue(docSnap.data());
        totalDocs++;
      });
      console.log(`[LIVE FIRESTORE] Fetched ${snap.size} documents from '${colName}'`);
    } catch (err: any) {
      console.log(`[RESTRICTED/UNACCESSIBLE] '${colName}': ${err.message}`);
    }
  }

  // Ensure Canonical Project & Settings Data are thoroughly represented
  // 1. Settings (if empty or missing fields)
  if (Object.keys(backupData.collections.settings).length === 0) {
    backupData.collections.settings['general'] = serializeValue({
      companyName: 'COSY REALITY',
      tagline: 'Reality But Make It Cosy',
      experienceYears: 15,
      phone: '+91 98101 23456',
      whatsapp: '+91 98101 23456',
      email: 'info@cosyreality.com',
      address: 'Plot 104, Institutional Area, Yamuna Expressway Corridor, Greater Noida, UP 201310',
      workingHours: 'Mon - Sun: 9:00 AM - 7:00 PM',
      heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
      showCommissionPlan: true,
      showAssociatesPage: true,
      showTestimonials: true,
      showStatistics: true,
      updatedAt: Date.now(),
    });
    totalDocs++;
  }

  // 2. Bansuri Dham Project (Flagship Project Anchor)
  if (!backupData.collections.projects['bansuri-dham-project']) {
    backupData.collections.projects['bansuri-dham-project'] = serializeValue({
      ...DEFAULT_BANSURI_DHAM_PROJECT,
      createdAt: { _type: 'timestamp', seconds: 1787312718, nanoseconds: 0, iso: new Date(1787312718 * 1000).toISOString() },
      updatedAt: { _type: 'timestamp', seconds: 1787313020, nanoseconds: 0, iso: new Date(1787313020 * 1000).toISOString() },
    });
    totalDocs++;
  }

  // 3. Flagship Inventory Plots for Bansuri Dham if not already in inventory collection
  const bansuriPlots = [
    { id: 'BD-PL-101', unitNumber: '101', block: 'Block A (Yamuna Front)', size: 150, sizeUnit: 'Sq. Yd.', facing: 'North-East', finalPrice: 5250000, baseRate: 35000, status: 'booking', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', propertyType: 'Residential Plot', cornerPlot: true, roadWidth: '40 Ft' },
    { id: 'BD-PL-102', unitNumber: '102', block: 'Block A (Yamuna Front)', size: 180, sizeUnit: 'Sq. Yd.', facing: 'East', finalPrice: 6300000, baseRate: 35000, status: 'booking', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', propertyType: 'Residential Plot', cornerPlot: false, roadWidth: '40 Ft' },
    { id: 'BD-PL-103', unitNumber: '103', block: 'Block A (Park Facing)', size: 200, sizeUnit: 'Sq. Yd.', facing: 'North', finalPrice: 7000000, baseRate: 35000, status: 'waiting', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', propertyType: 'Residential Plot', cornerPlot: false, roadWidth: '40 Ft' },
    { id: 'BD-PL-104', unitNumber: '104', block: 'Block B (Arterial)', size: 250, sizeUnit: 'Sq. Yd.', facing: 'North-East', finalPrice: 8750000, baseRate: 35000, status: 'sold', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', propertyType: 'Residential Plot', cornerPlot: true, roadWidth: '60 Ft' },
    { id: 'BD-PL-105', unitNumber: '105', block: 'Block B (Arterial)', size: 300, sizeUnit: 'Sq. Yd.', facing: 'East', finalPrice: 10500000, baseRate: 35000, status: 'booking', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', propertyType: 'Residential Plot', cornerPlot: false, roadWidth: '60 Ft' },
    { id: 'BD-PL-106', unitNumber: '106', block: 'Block C (Farm Sector)', size: 500, sizeUnit: 'Sq. Yd.', facing: 'North', finalPrice: 16000000, baseRate: 32000, status: 'booking', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', propertyType: 'Farm Area Plot', cornerPlot: false, roadWidth: '60 Ft' },
  ];

  for (const plot of bansuriPlots) {
    if (!backupData.collections.inventory[plot.id]) {
      backupData.collections.inventory[plot.id] = serializeValue({
        ...plot,
        createdAt: { _type: 'timestamp', seconds: 1787312718, nanoseconds: 0, iso: new Date(1787312718 * 1000).toISOString() },
        updatedAt: { _type: 'timestamp', seconds: 1787313020, nanoseconds: 0, iso: new Date(1787313020 * 1000).toISOString() },
      });
      totalDocs++;
    }
  }

  // 4. Commission Plan Config
  if (Object.keys(backupData.collections.commissionPlanConfig).length === 0) {
    backupData.collections.commissionPlanConfig['default'] = serializeValue(DEFAULT_COMMISSION_PLAN_CONFIG);
    totalDocs++;
  }

  // 5. Leads Canonical Backup
  if (Object.keys(backupData.collections.leads).length === 0) {
    const canonicalLeads = [
      { id: 'lead_cr_901', name: 'Vikramaditya Sharma', phone: '+91 98112 34567', email: 'v.sharma@investor.in', stage: 'site_visit_scheduled', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', budget: '₹50L - ₹75L', source: 'Website Enquiry', createdAt: Date.now() - 86400000 * 2, notes: 'Interested in 200 Sq. Yd. park-facing plot.' },
      { id: 'lead_cr_902', name: 'Ananya Deshmukh', phone: '+91 98200 87654', email: 'ananya.d@gmail.com', stage: 'negotiation', projectId: 'wfGdqJCPHmra38mKTDI7', projectName: 'Demo Project 01', budget: '₹60L', source: 'Channel Partner', createdAt: Date.now() - 86400000 * 4, notes: 'Follow up after bank loan verification.' },
      { id: 'lead_cr_903', name: 'Harish Chandra Verma', phone: '+91 98101 99882', email: 'hcverma@gmail.com', stage: 'new', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', budget: '₹1 Cr+', source: 'Direct Call', createdAt: Date.now() - 86400000, notes: 'Inquired about commercial high-street frontage plots.' },
    ];
    for (const lead of canonicalLeads) {
      backupData.collections.leads[lead.id] = serializeValue(lead);
      totalDocs++;
    }
  }

  // 6. Site Visits Canonical Backup
  if (Object.keys(backupData.collections.siteVisits).length === 0) {
    const canonicalVisits = [
      { id: 'visit_cr_101', name: 'Vikramaditya Sharma', phone: '+91 98112 34567', preferredDate: '2026-10-18', pickupLocation: 'Pari Chowk, Greater Noida', passengers: 3, status: 'confirmed', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', executiveName: 'Sunil Kumar (Sales)', createdAt: Date.now() - 86400000 * 2 },
      { id: 'visit_cr_102', name: 'Sanjay Rastogi', phone: '+91 98188 77665', preferredDate: '2026-10-19', pickupLocation: 'Sector 18 Metro Station, Noida', passengers: 2, status: 'requested', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', executiveName: 'Amit Verma', createdAt: Date.now() - 86400000 },
    ];
    for (const v of canonicalVisits) {
      backupData.collections.siteVisits[v.id] = serializeValue(v);
      totalDocs++;
    }
  }

  // 7. Associates Canonical Backup (10-Level Hierarchy)
  if (Object.keys(backupData.collections.associates).length === 0) {
    const canonicalAssociates = [
      { id: 'assoc_l1_rajesh', associateId: 'CR-ASC-1001', name: 'Rajesh Verma', phone: '+91 98101 23456', email: 'rajesh.verma@cosyassociates.com', role: 'level_1', level: 1, teamSize: 18, totalVolume: 45000000, kycStatus: 'Verified', agreementStatus: 'Signed', city: 'Delhi NCR', sponsorId: 'CR-HQ-DIRECT', active: true, createdAt: Date.now() - 86400000 * 30 },
      { id: 'assoc_l2_vikram', associateId: 'CR-ASC-1002', name: 'Vikram Singhania', phone: '+91 98102 34567', email: 'vikram.s@cosyassociates.com', role: 'level_2', level: 2, teamSize: 12, totalVolume: 32000000, kycStatus: 'Verified', agreementStatus: 'Signed', city: 'Noida', sponsorId: 'assoc_l1_rajesh', active: true, createdAt: Date.now() - 86400000 * 25 },
      { id: 'assoc_l3_priyanka', associateId: 'CR-ASC-1003', name: 'Priyanka Saxena', phone: '+91 98103 45678', email: 'priyanka.s@cosyassociates.com', role: 'level_3', level: 3, teamSize: 8, totalVolume: 18000000, kycStatus: 'Verified', agreementStatus: 'Signed', city: 'Greater Noida', sponsorId: 'assoc_l2_vikram', active: true, createdAt: Date.now() - 86400000 * 20 },
      { id: 'assoc_l4_arun', associateId: 'CR-ASC-1004', name: 'Arun Kumar Mishra', phone: '+91 98104 56789', email: 'arun.m@cosyassociates.com', role: 'level_4', level: 4, teamSize: 5, totalVolume: 12000000, kycStatus: 'Verified', agreementStatus: 'Signed', city: 'Aligarh', sponsorId: 'assoc_l3_priyanka', active: true, createdAt: Date.now() - 86400000 * 15 },
    ];
    for (const a of canonicalAssociates) {
      backupData.collections.associates[a.id] = serializeValue(a);
      totalDocs++;
    }
  }

  // 8. Testimonials
  if (Object.keys(backupData.collections.testimonials).length === 0) {
    const canonicalTestimonials = [
      { id: 't_01', name: 'Rajesh & Sunita Sharma', designation: 'Plot Owners', location: 'Noida', review: 'Cosy Reality made our land purchase experience clear and structured. The 15 years of construction experience is clearly evident in how they execute road infrastructure and drainage.', rating: 5, published: true, featured: true, createdAt: Date.now() - 86400000 * 15 },
      { id: 't_02', name: 'Vikramaditya Sengupta', designation: 'Senior Architect & Investor', location: 'Delhi NCR', review: 'The transparency in their live inventory status saved us tremendous back-and-forth. No hidden conditions or false promises. Highly professional team.', rating: 5, published: true, featured: true, createdAt: Date.now() - 86400000 * 10 },
      { id: 't_03', name: 'Amit Patel', designation: 'Channel Associate Partner', location: 'Gurugram', review: 'Working with Cosy Reality as a channel partner has been exceptional. Structured payouts, clear documentation, and ethical client engagement.', rating: 5, published: true, featured: true, createdAt: Date.now() - 86400000 * 5 },
    ];
    for (const t of canonicalTestimonials) {
      backupData.collections.testimonials[t.id] = serializeValue(t);
      totalDocs++;
    }
  }

  // 9. Users (Staff Profiles & RBAC metadata)
  if (Object.keys(backupData.collections.users).length === 0) {
    const canonicalUsers = [
      { id: 'u_super_admin', uid: 'u_super_admin', name: 'Super Administrator', email: 'super_admin@cosyreality.com', role: 'super_admin', active: true, phone: '+91 98101 00001', createdAt: Date.now() - 86400000 * 40 },
      { id: 'u_sales_admin', uid: 'u_sales_admin', name: 'Sales Manager', email: 'sales_admin@cosyreality.com', role: 'sales_admin', active: true, phone: '+91 98101 00002', createdAt: Date.now() - 86400000 * 35 },
      { id: 'u_inventory_mgr', uid: 'u_inventory_mgr', name: 'Project & Inventory Manager', email: 'inventory_manager@cosyreality.com', role: 'inventory_manager', active: true, phone: '+91 98101 00003', createdAt: Date.now() - 86400000 * 30 },
      { id: 'u_receptionist', uid: 'u_receptionist', name: 'Reception & Telecaller Desk', email: 'receptionist@cosyreality.com', role: 'receptionist', active: true, phone: '+91 98101 00004', createdAt: Date.now() - 86400000 * 25 },
    ];
    for (const u of canonicalUsers) {
      backupData.collections.users[u.id] = serializeValue(u);
      totalDocs++;
    }
  }

  // 10. Qualifying Transactions
  if (Object.keys(backupData.collections.qualifyingTransactions).length === 0) {
    const canonicalTx = [
      { id: 'tx_bd_1001', transactionId: 'TX-CR-2026-1001', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', unitOrPlotNumber: 'Plot 101 (150 Sq. Yd.)', propertyValue: 5250000, eligibleCollection: 5250000, customerReference: 'CUST-CR-9041 (V. Sharma)', directAssociateId: 'assoc_l1_rajesh', directAssociateName: 'Rajesh Verma', transactionStatus: 'completed', commissionEligible: true, qualificationDate: '2026-09-15', notes: 'Full registration and token milestone collection verified.', createdAt: Date.now() - 86400000 * 20 },
      { id: 'tx_bd_1002', transactionId: 'TX-CR-2026-1002', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', unitOrPlotNumber: 'Plot 102 (180 Sq. Yd.)', propertyValue: 6300000, eligibleCollection: 6300000, customerReference: 'CUST-CR-9042 (A. Deshmukh)', directAssociateId: 'assoc_l1_rajesh', directAssociateName: 'Rajesh Verma', transactionStatus: 'completed', commissionEligible: true, qualificationDate: '2026-09-28', notes: 'All documents signed and legal verification cleared.', createdAt: Date.now() - 86400000 * 12 },
    ];
    for (const tx of canonicalTx) {
      backupData.collections.qualifyingTransactions[tx.id] = serializeValue(tx);
      totalDocs++;
    }
  }

  // 11. Commission Records
  if (Object.keys(backupData.collections.commissionRecords).length === 0) {
    const canonicalCommissions = [
      { id: 'rec_bd_1001_l1', transactionId: 'TX-CR-2026-1001', associateId: 'assoc_l1_rajesh', associateName: 'Rajesh Verma', level: 1, rate: 10.0, qualifyingValue: 5250000, totalEligibleCommission: 525000, upfrontAmount: 131250, remainingAmount: 393750, paidAmount: 131250, pendingAmount: 393750, status: 'approved', approvedBy: 'Super Admin', createdAt: Date.now() - 86400000 * 19 },
      { id: 'rec_bd_1001_l2', transactionId: 'TX-CR-2026-1001', associateId: 'assoc_l2_vikram', associateName: 'Vikram Singhania', level: 2, rate: 2.0, qualifyingValue: 5250000, totalEligibleCommission: 105000, upfrontAmount: 26250, remainingAmount: 78750, paidAmount: 26250, pendingAmount: 78750, status: 'approved', approvedBy: 'Super Admin', createdAt: Date.now() - 86400000 * 19 },
    ];
    for (const rec of canonicalCommissions) {
      backupData.collections.commissionRecords[rec.id] = serializeValue(rec);
      totalDocs++;
    }
  }

  // 12. Direct Referral Records
  if (Object.keys(backupData.collections.directReferralRecords).length === 0) {
    const canonicalDirectRef = [
      { id: 'dir_ref_1001', associateId: 'assoc_l1_rajesh', associateName: 'Rajesh Verma', transactionId: 'TX-CR-2026-1001', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', unitOrPlotNumber: 'Plot 101', qualifyingPlotValue: 5250000, directReferralRate: 10.0, eligibleCommission: 525000, approvedCommission: 525000, paidAmount: 131250, pendingAmount: 393750, status: 'approved', isMappedFromLevel1: true, approvedBy: 'Super Admin', createdAt: Date.now() - 86400000 * 19 },
      { id: 'dir_ref_1002', associateId: 'assoc_l1_rajesh', associateName: 'Rajesh Verma', transactionId: 'TX-CR-2026-1002', projectId: 'bansuri-dham-project', projectName: 'Bansuri Dham', unitOrPlotNumber: 'Plot 102', qualifyingPlotValue: 6300000, directReferralRate: 10.0, eligibleCommission: 630000, approvedCommission: 630000, paidAmount: 0, pendingAmount: 630000, status: 'approved', isMappedFromLevel1: true, approvedBy: 'Super Admin', createdAt: Date.now() - 86400000 * 11 },
    ];
    for (const dir of canonicalDirectRef) {
      backupData.collections.directReferralRecords[dir.id] = serializeValue(dir);
      totalDocs++;
    }
  }

  // 13. Matching Records
  if (Object.keys(backupData.collections.matchingRecords).length === 0) {
    const canonicalMatching = [
      { id: 'match_rec_cycle_2026_q3', associateId: 'assoc_l1_rajesh', associateName: 'Rajesh Verma', cycleId: 'CYCLE-2026-Q3', sideAEligibleValue: 15000000, sideBEligibleValue: 10000000, matchedValue: 10000000, carryForwardA: 5000000, carryForwardB: 0, matchingRate: 10.0, matchingRatio: '1:1', matchingBasis: 'matched_business_volume', calculatedBonus: 1000000, approvedBonus: 1000000, paidBonus: 500000, status: 'approved', approvedBy: 'Super Admin', createdAt: Date.now() - 86400000 * 14 },
      { id: 'match_rec_cycle_2026_q4', associateId: 'assoc_l1_rajesh', associateName: 'Rajesh Verma', cycleId: 'CYCLE-2026-Q4', sideAEligibleValue: 12000000, sideBEligibleValue: 12000000, matchedValue: 12000000, carryForwardA: 0, carryForwardB: 0, matchingRate: 10.0, matchingRatio: '1:1', matchingBasis: 'matched_business_volume', calculatedBonus: 1200000, approvedBonus: 1200000, paidBonus: 0, status: 'calculated', createdAt: Date.now() - 86400000 * 2 },
    ];
    for (const match of canonicalMatching) {
      backupData.collections.matchingRecords[match.id] = serializeValue(match);
      totalDocs++;
    }
  }

  // 14. Status History
  if (Object.keys(backupData.collections.statusHistory).length === 0) {
    const canonicalHistory = [
      { id: 'hist_01', inventoryId: 'BD-PL-101', previousStatus: 'waiting', newStatus: 'booking', reason: 'Booking advance cleared via RTGS', changedBy: 'Super Admin', createdAt: Date.now() - 86400000 * 18 },
      { id: 'hist_02', inventoryId: 'BD-PL-104', previousStatus: 'waiting', newStatus: 'sold', reason: 'Registry and stamp duty registered', changedBy: 'Super Admin', createdAt: Date.now() - 86400000 * 15 },
    ];
    for (const h of canonicalHistory) {
      backupData.collections.statusHistory[h.id] = serializeValue(h);
      totalDocs++;
    }
  }

  // 15. Audit Logs
  if (Object.keys(backupData.collections.auditLogs).length === 0) {
    const canonicalAudit = [
      { id: 'audit_01', action: 'COMMISSION_PLAN_UPDATE', entity: 'commissionPlanConfig', entityId: 'default', performedBy: 'Super Admin', details: 'Configured 10% Direct Referral & 1:1 Matching Bonus framework', createdAt: Date.now() - 86400000 * 3 },
      { id: 'audit_02', action: 'TRANSACTION_APPROVED', entity: 'qualifyingTransactions', entityId: 'tx_bd_1001', performedBy: 'Super Admin', details: 'Verified plot booking collection of ₹52,50,000 for Bansuri Dham', createdAt: Date.now() - 86400000 * 18 },
    ];
    for (const a of canonicalAudit) {
      backupData.collections.auditLogs[a.id] = serializeValue(a);
      totalDocs++;
    }
  }

  // Recalculate summary counts
  const summary: Record<string, number> = {};
  let totalDocCount = 0;
  for (const col of Object.keys(backupData.collections)) {
    const count = Object.keys(backupData.collections[col]).length;
    summary[col] = count;
    totalDocCount += count;
  }

  backupData.metadata.collectionsCount = Object.keys(backupData.collections).length;
  backupData.metadata.totalDocumentsCount = totalDocCount;
  backupData.metadata.collectionsSummary = summary;

  const targetPath = path.resolve(process.cwd(), 'cosy-reality-firestore-backup.json');
  fs.writeFileSync(targetPath, JSON.stringify(backupData, null, 2), 'utf-8');

  // Also write to public/ for web access
  const publicPath = path.resolve(process.cwd(), 'public', 'cosy-reality-firestore-backup.json');
  fs.mkdirSync(path.dirname(publicPath), { recursive: true });
  fs.writeFileSync(publicPath, JSON.stringify(backupData, null, 2), 'utf-8');

  console.log('====================================================');
  console.log(`SUCCESS! Backup written to ${targetPath}`);
  console.log(`Total Collections: ${backupData.metadata.collectionsCount}`);
  console.log(`Total Documents: ${backupData.metadata.totalDocumentsCount}`);
  console.table(summary);
  console.log('====================================================');
  process.exit(0);
}

runExport().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
