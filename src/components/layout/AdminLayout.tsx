import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  Grid,
  Users,
  CalendarCheck,
  UserCheck,
  MessageSquareQuote,
  Settings as SettingsIcon,
  Shield,
  FileClock,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Sliders,
  Calculator,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const AdminLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signOut, isSuperAdmin, isSalesAdmin, isInventoryManager } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/admin/projects', icon: Building },
    { label: 'Live Inventory', path: '/admin/inventory', icon: Grid, badge: 'Core' },
    { label: 'Leads CRM', path: '/admin/leads', icon: Users },
    { label: 'Site Visits', path: '/admin/site-visits', icon: CalendarCheck },
    { label: 'Associates', path: '/admin/associates', icon: UserCheck },
    { label: 'Commissions', path: '/admin/commissions', icon: Calculator, badge: '10-Tier' },
    ...(isSuperAdmin ? [{ label: 'Commission Plan', path: '/admin/commission-plan', icon: Sliders }] : []),
    { label: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
    { label: 'Settings', path: '/admin/settings', icon: SettingsIcon },
    ...(isSuperAdmin ? [{ label: 'Users & Roles', path: '/admin/users', icon: Shield }] : []),
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileClock },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isSalesAdmin) return 'Sales Admin';
    if (isInventoryManager) return 'Inventory Manager';
    return userProfile?.role || 'Staff';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Mobile Bar */}
      <header className="lg:hidden bg-[#103858] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm tracking-tight text-white">
            COSY REALITY <span className="text-[#CCA02E] font-normal">| Admin</span>
          </span>
        </div>

        <Link
          to="/"
          target="_blank"
          className="text-xs text-[#CCA02E] flex items-center gap-1 hover:underline"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-[#103858] text-white flex-col shrink-0 border-r border-slate-700/50">
          {/* Brand header */}
          <div className="p-6 border-b border-white/10">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CCA02E] text-[#103858] font-black flex items-center justify-center shadow-sm">
                CR
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  COSY REALITY
                </span>
                <span className="text-[10px] font-semibold text-[#CCA02E] uppercase tracking-wider block">
                  Internal Operations
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-[#CCA02E] text-[#103858] font-bold shadow-xs'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#103858]' : 'text-[#CCA02E]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        active ? 'bg-[#103858] text-white' : 'bg-[#16A34A] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User footer profile */}
          <div className="p-4 border-t border-white/10 bg-[#0A243A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#103858] border border-[#CCA02E]/40 flex items-center justify-center text-xs font-bold text-[#CCA02E]">
                  {userProfile?.name?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {userProfile?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-[#CCA02E] font-semibold">{getRoleLabel()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                target="_blank"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3 h-3 text-[#CCA02E]" />
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative w-64 bg-[#103858] text-white flex flex-col h-full z-10 shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="font-bold text-sm text-white">Menu Navigation</span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        active
                          ? 'bg-[#CCA02E] text-[#103858] font-bold'
                          : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#16A34A] text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
