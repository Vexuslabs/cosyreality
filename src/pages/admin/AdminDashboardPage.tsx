import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../utils/seo';

// Services
import { getProjects } from '../../services/projectsService';
import { getInventory, getAllStatusHistory } from '../../services/inventoryService';
import { getLeads } from '../../services/leadsService';
import { getSiteVisits } from '../../services/siteVisitsService';
import { getAssociates } from '../../services/associatesService';
import { getQualifyingTransactions, getCommissionRecords } from '../../services/commissionService';
import { getAuditLogs } from '../../services/auditService';
import { seedInitialData } from '../../services/seedService';

// Types
import {
  Project,
  InventoryItem,
  Lead,
  SiteVisit,
  Associate,
  QualifyingTransaction,
  CommissionRecord,
  AuditLog,
  StatusHistory,
} from '../../types';

// Dashboard Sub-components
import { DashboardHeader } from '../../components/admin/dashboard/DashboardHeader';
import { DashboardAttentionPanel } from '../../components/admin/dashboard/DashboardAttentionPanel';
import { DashboardKpiGrid } from '../../components/admin/dashboard/DashboardKpiGrid';
import { DashboardInventoryCharts } from '../../components/admin/dashboard/DashboardInventoryCharts';
import { DashboardLeadPipeline } from '../../components/admin/dashboard/DashboardLeadPipeline';
import { DashboardTrendsSection } from '../../components/admin/dashboard/DashboardTrendsSection';
import { DashboardProjectPerformance } from '../../components/admin/dashboard/DashboardProjectPerformance';
import { DashboardFlowcharts } from '../../components/admin/dashboard/DashboardFlowcharts';
import { DashboardCommissionSummary } from '../../components/admin/dashboard/DashboardCommissionSummary';
import { DashboardTables } from '../../components/admin/dashboard/DashboardTables';
import { DashboardActivityAndActions } from '../../components/admin/dashboard/DashboardActivityAndActions';
import { DashboardErrorBoundary } from '../../components/admin/dashboard/DashboardErrorBoundary';

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Executive Admin Dashboard — Cosy Reality');
  const { userProfile, isSuperAdmin, isSalesAdmin, isInventoryManager } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'this_month' | 'all'>('all');

  // Live Firestore State Collections
  const [projects, setProjects] = useState<Project[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [transactions, setTransactions] = useState<QualifyingTransaction[]>([]);
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);

  const loadAllDashboardData = async () => {
    try {
      setLoading(true);
      const [
        projList,
        invList,
        leadsList,
        visitsList,
        assocList,
        txList,
        commList,
        logsList,
        histList,
      ] = await Promise.all([
        getProjects().catch(() => []),
        getInventory().catch(() => []),
        getLeads().catch(() => []),
        getSiteVisits().catch(() => []),
        getAssociates().catch(() => []),
        getQualifyingTransactions().catch(() => []),
        getCommissionRecords().catch(() => []),
        getAuditLogs().catch(() => []),
        getAllStatusHistory(30).catch(() => []),
      ]);

      setProjects(projList ?? []);
      setInventory(invList ?? []);
      setLeads(leadsList ?? []);
      setSiteVisits(visitsList ?? []);
      setAssociates(assocList ?? []);
      setTransactions(txList ?? []);
      setCommissionRecords(commList ?? []);
      setAuditLogs(logsList ?? []);
      setStatusHistory(histList ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Dashboard data fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDashboardData();
  }, []);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const result = await seedInitialData();
      addToast(
        'success',
        'Database Seeded!',
        `Successfully populated ${result.projects} projects, ${result.inventory} inventory units, and demo reviews.`
      );
      await loadAllDashboardData();
    } catch (err: any) {
      addToast('error', 'Seeding Failed', err?.message || 'Error populating data.');
    } finally {
      setSeeding(false);
    }
  };

  // Filter leads/siteVisits based on timeframe if selected
  const getFilteredItemsByTime = <T extends { createdAt?: any; date?: string; preferredDate?: string }>(
    items: T[]
  ) => {
    if (timeframe === 'all') return items;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const cutoff =
      timeframe === 'today'
        ? now - dayMs
        : timeframe === '7days'
        ? now - 7 * dayMs
        : now - 30 * dayMs;

    return (items ?? []).filter((item) => {
      if (!item) return false;
      const t =
        typeof item.createdAt === 'number'
          ? item.createdAt
          : item.date
          ? new Date(item.date).getTime()
          : item.preferredDate
          ? new Date(item.preferredDate).getTime()
          : 0;
      return t >= cutoff;
    });
  };

  const filteredLeads = getFilteredItemsByTime(leads);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Executive Controls */}
      <DashboardErrorBoundary widgetName="Executive Header">
        <DashboardHeader
          userProfile={userProfile}
          isSuperAdmin={isSuperAdmin}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          onTimeframeChange={setTimeframe}
          onRefresh={loadAllDashboardData}
          onSeedData={handleSeedData}
          loading={loading}
          seeding={seeding}
          lastUpdated={lastUpdated}
        />
      </DashboardErrorBoundary>

      {/* 2. Urgent Attention / Actionable Highlights Panel */}
      <DashboardErrorBoundary widgetName="Attention Alerts Panel">
        <DashboardAttentionPanel
          leads={leads}
          siteVisits={siteVisits}
          projects={projects}
          commissionRecords={commissionRecords}
          inventory={inventory}
          isSuperAdmin={isSuperAdmin}
        />
      </DashboardErrorBoundary>

      {/* 3. Primary KPI Metric Cards Grid */}
      <DashboardErrorBoundary widgetName="Key Metrics Grid">
        <DashboardKpiGrid
          projects={projects}
          inventory={inventory}
          leads={filteredLeads}
          siteVisits={siteVisits}
          transactions={transactions}
          commissionRecords={commissionRecords}
          isSuperAdmin={isSuperAdmin}
          loading={loading}
        />
      </DashboardErrorBoundary>

      {/* 4. Visual Inventory Distribution: Donut & Project Stacked Bar Chart */}
      <DashboardErrorBoundary widgetName="Inventory Allocation Charts">
        <DashboardInventoryCharts
          projects={projects}
          inventory={inventory}
          loading={loading}
        />
      </DashboardErrorBoundary>

      {/* 5. Lead Pipeline & CRM Funnel */}
      <DashboardErrorBoundary widgetName="Lead Conversion Funnel">
        <DashboardLeadPipeline leads={filteredLeads} />
      </DashboardErrorBoundary>

      {/* 6. Trends & Analytical Graphs */}
      <DashboardErrorBoundary widgetName="Trends & Channel Performance">
        <DashboardTrendsSection
          leads={leads}
          siteVisits={siteVisits}
          transactions={transactions}
          statusHistory={statusHistory}
        />
      </DashboardErrorBoundary>

      {/* 7. Project Performance & Absorption Rates */}
      <DashboardErrorBoundary widgetName="Project Performance Grid">
        <DashboardProjectPerformance
          projects={projects}
          inventory={inventory}
          leads={leads}
        />
      </DashboardErrorBoundary>

      {/* 8. Standard Real Estate Business Flow Charts */}
      <DashboardErrorBoundary widgetName="Business Lifecycle Flowcharts">
        <DashboardFlowcharts />
      </DashboardErrorBoundary>

      {/* 9. 10-Level Commission & Associate Network Operations */}
      {(isSuperAdmin || isSalesAdmin) && (
        <DashboardErrorBoundary widgetName="Commission Network Hub">
          <DashboardCommissionSummary
            commissionRecords={commissionRecords}
            transactions={transactions}
            associates={associates}
            isSuperAdmin={isSuperAdmin}
          />
        </DashboardErrorBoundary>
      )}

      {/* 10. Operational Tables: Upcoming Visits & Inbound Leads */}
      <DashboardErrorBoundary widgetName="Operations Tables">
        <DashboardTables
          siteVisits={siteVisits}
          leads={leads}
        />
      </DashboardErrorBoundary>

      {/* 11. Activity Timeline & Quick Actions Panel */}
      <DashboardErrorBoundary widgetName="Activity & Actions Panel">
        <DashboardActivityAndActions
          auditLogs={auditLogs}
          statusHistory={statusHistory}
          isSuperAdmin={isSuperAdmin}
        />
      </DashboardErrorBoundary>
    </div>
  );
};
