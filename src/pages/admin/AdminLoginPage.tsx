import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, ShieldCheck, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AdminRole } from '../../types';
import { useDocumentTitle } from '../../utils/seo';

export const AdminLoginPage: React.FC = () => {
  useDocumentTitle('Staff Login — Cosy Reality');
  const navigate = useNavigate();
  const { signIn, demoLoginAs, userProfile } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (userProfile) {
      navigate('/admin/dashboard');
    }
  }, [userProfile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast('error', 'Required Fields', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      addToast('success', 'Welcome back!', 'Successfully signed in to Cosy Reality Management Portal.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      addToast('error', 'Login Failed', err?.message || 'Invalid credentials or inactive account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: AdminRole, label: string) => {
    demoLoginAs(role, `Cosy Reality ${label}`, `${role}@cosyreality.com`);
    addToast('success', `Signed in as ${label}`, 'Developer preview access enabled.');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#103858] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#CCA02E]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#16A34A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#CCA02E] text-[#103858] font-black shadow-xl mb-4">
          <Building2 className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white">COSY REALITY</h2>
        <p className="text-xs font-bold text-[#CCA02E] uppercase tracking-wider mt-1">
          Internal Operations & Inventory System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-200 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Staff Email"
              type="email"
              placeholder="admin@cosyreality.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
                loading={loading}
                rightIcon={<ArrowRight className="w-4 h-4 text-[#CCA02E]" />}
              >
                Sign In to Portal
              </Button>
            </div>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-[#CCA02E] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Demo Access</span>
              </span>
              <span>1-Click Role Switch</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('super_admin', 'Super Admin')}
                className="p-2 text-center rounded-xl bg-slate-100 hover:bg-[#103858] hover:text-white transition-all text-xs font-bold text-slate-700 border border-slate-200"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('sales_admin', 'Sales Lead')}
                className="p-2 text-center rounded-xl bg-slate-100 hover:bg-[#103858] hover:text-white transition-all text-xs font-bold text-slate-700 border border-slate-200"
              >
                Sales Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('inventory_manager', 'Inventory Mgr')}
                className="p-2 text-center rounded-xl bg-slate-100 hover:bg-[#103858] hover:text-white transition-all text-xs font-bold text-slate-700 border border-slate-200"
              >
                Inventory Mgr
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Cosy Reality. Strictly for authorized personnel.</p>
        </div>
      </div>
    </div>
  );
};
