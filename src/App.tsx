import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloatingButton } from './components/layout/WhatsAppFloatingButton';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { InventoryPage } from './pages/public/InventoryPage';
import { AboutPage } from './pages/public/AboutPage';
import { AssociatesPage } from './pages/public/AssociatesPage';
import { ContactPage } from './pages/public/ContactPage';
import { CommissionPlanPage } from './pages/public/CommissionPlanPage';
import { AssociateDashboardPage } from './pages/associate/AssociateDashboardPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsPage } from './pages/public/TermsPage';
import { DisclaimerPage } from './pages/public/DisclaimerPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminLeadsPage } from './pages/admin/AdminLeadsPage';
import { AdminSiteVisitsPage } from './pages/admin/AdminSiteVisitsPage';
import { AdminAssociatesPage } from './pages/admin/AdminAssociatesPage';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminCommissionPlanPage } from './pages/admin/AdminCommissionPlanPage';
import { AdminCommissionsPage } from './pages/admin/AdminCommissionsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Public Shell
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#172B3A] font-sans antialiased selection:bg-[#CCA02E]/30 selection:text-[#103858]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/associates" element={<AssociatesPage />} />
        <Route path="/commission-plan" element={<CommissionPlanPage />} />
        <Route path="/associate-plan" element={<Navigate to="/commission-plan" replace />} />
        <Route path="/associate/dashboard" element={<AssociateDashboardPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Console */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="leads" element={<AdminLeadsPage />} />
        <Route path="site-visits" element={<AdminSiteVisitsPage />} />
        <Route path="associates" element={<AdminAssociatesPage />} />
        <Route path="commission-plan" element={<AdminCommissionPlanPage />} />
        <Route path="commissions" element={<AdminCommissionsPage />} />
        <Route path="testimonials" element={<AdminTestimonialsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
