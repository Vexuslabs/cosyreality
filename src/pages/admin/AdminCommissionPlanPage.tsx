import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  IndianRupee,
  ShieldAlert,
  Database,
  ExternalLink,
  Info,
  Split,
  Percent,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import {
  getCommissionPlanConfig,
  saveCommissionPlanConfig,
  CommissionPlanConfig,
  DEFAULT_COMMISSION_PLAN_CONFIG,
  DEFAULT_COMMISSION_LEVELS,
  DEFAULT_DIRECT_REFERRAL_CONFIG,
  DEFAULT_MATCHING_BONUS_CONFIG,
  calculateCommissionPlan,
  seedSampleCommissionModuleData,
  COMPLIANCE_DISCLAIMER,
  BUSINESS_PLAN_DISCLOSURE,
  MatchingBonusBasis,
} from '../../services/commissionService';
import { CommissionVisualFlow } from '../../components/admin/commission/CommissionVisualFlow';
import { formatINR } from '../../utils/formatters';
import { useDocumentTitle } from '../../utils/seo';

export const AdminCommissionPlanPage: React.FC = () => {
  useDocumentTitle('10-Level Commission Plan Configuration — Admin');
  const { isSuperAdmin, userProfile } = useAuth();
  const { addToast } = useToast();
  const { settings, updateSettings } = useSettings();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [config, setConfig] = useState<CommissionPlanConfig>(DEFAULT_COMMISSION_PLAN_CONFIG);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getCommissionPlanConfig();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load commission plan config:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleLevelRateChange = (levelNum: number, newRate: number) => {
    const updatedLevels = config.levels.map((lvl) => {
      if (lvl.level === levelNum) {
        return { ...lvl, rate: newRate };
      }
      return lvl;
    });
    setConfig({ ...config, levels: updatedLevels });
  };

  const totalPercentage = config.levels.reduce(
    (sum, lvl) => sum + (Number(lvl.rate) || 0),
    0
  );
  const isTotalValid = Math.abs(totalPercentage - 20.0) < 0.001;

  const calculation = calculateCommissionPlan(config.referencePropertyValue || 1000000, config);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      addToast('error', 'Unauthorized', 'Only Super Administrators can modify the commission architecture.');
      return;
    }

    try {
      setSaving(true);
      const saved = await saveCommissionPlanConfig(
        config,
        userProfile?.uid,
        userProfile?.name
      );
      setConfig(saved);

      // Sync settings flag if changed
      if (settings.showCommissionPlan !== config.enabled) {
        await updateSettings({ showCommissionPlan: config.enabled });
      }

      addToast(
        'success',
        'Plan Saved',
        `Commission plan configuration updated successfully. Total rate: ${totalPercentage.toFixed(2)}%`
      );
    } catch (err: any) {
      addToast('error', 'Save Failed', err?.message || 'Unable to update commission plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setConfig({
      ...DEFAULT_COMMISSION_PLAN_CONFIG,
      enabled: config.enabled,
    });
    addToast('info', 'Reset to Standard', 'Levels reset to the standard 20.00% 10-tier structure.');
  };

  const handleSeedSampleData = async () => {
    try {
      setSeeding(true);
      await seedSampleCommissionModuleData();
      addToast(
        'success',
        'Sample Data Initialized',
        'Seeded 10-level associate chain, reference ₹10L property deal, and calculated commission records.'
      );
    } catch (err: any) {
      addToast('error', 'Seed Error', err?.message || 'Failed to seed sample records.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#103858] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Super Admin Control
            </span>
            <span className="text-xs font-semibold text-[#CCA02E]">
              10-Level Commission Architecture
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#103858]">
            Commission Plan & Level Rates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure qualifying transaction base, multi-tier slab percentages, upfront shares, and public visibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/commission-plan" target="_blank">
            <Button variant="outline" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Preview Public Plan
            </Button>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSeedSampleData}
            loading={seeding}
            leftIcon={<Database className="w-3.5 h-3.5 text-[#CCA02E]" />}
          >
            Seed Demo Data
          </Button>
        </div>
      </div>

      {/* PLAN VALIDATION ALERT BANNER */}
      {!isTotalValid && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-red-900 shadow-sm flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-red-950 uppercase tracking-wide">
              Plan Rate Validation Alert
            </h3>
            <p className="text-xs text-red-900 font-semibold">
              Current level percentages total {totalPercentage.toFixed(2)}%. Please review the commission plan.
            </p>
            <p className="text-[11px] text-red-800">
              The standard Cosy Reality model requires exactly 20.00% total pool allocation across all 10 levels.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Global Parameters */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-[#CCA02E]" />
            <h3 className="font-bold text-base text-[#103858]">Global Plan Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Reference Property Base (₹)"
              type="number"
              value={config.referencePropertyValue}
              onChange={(e) =>
                setConfig({ ...config, referencePropertyValue: Number(e.target.value) })
              }
              helperText="Default ₹10,00,000 reference illustration"
              required
            />

            <Input
              label="Upfront Component Share (%)"
              type="number"
              step="0.1"
              value={config.upfrontPercentage}
              onChange={(e) =>
                setConfig({ ...config, upfrontPercentage: Number(e.target.value) })
              }
              helperText="Default: 25.0% upfront upon collection clearance"
              required
            />

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#103858] block">
                Primary Tenure (Months)
              </label>
              <input
                type="number"
                value={config.tenureMonths1}
                onChange={(e) =>
                  setConfig({ ...config, tenureMonths1: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#103858] focus:ring-2 focus:ring-[#103858]"
              />
              <span className="text-[10px] text-slate-400 block">Default: 36 Months</span>
            </div>
          </div>

          {/* Visibility Switch */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#103858] block">
                Show 10-Level Business Plan Publicly
              </span>
              <span className="text-[11px] text-slate-500 block">
                Default: Disabled. When enabled, visitors can explore the interactive business plan at /commission-plan.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#103858]"></div>
            </label>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DIRECT REFERRAL CONFIGURATION                            */}
        {/* ======================================================== */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#CCA02E] text-[#103858] font-black flex items-center justify-center text-sm shadow-xs">
                10%
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#103858] flex items-center gap-2">
                  <span>Direct Referral Configuration</span>
                  <span className="text-[10px] bg-[#CCA02E]/20 text-[#103858] font-bold px-2 py-0.5 rounded-full uppercase">
                    Configurable
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated as direct percentage of qualifying plot/property value upon verified collection.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Illustrative Direct Commission</span>
              <span className="text-sm font-black text-[#103858]">
                ₹{formatINR(((config.referencePropertyValue || 1000000) * (config.directReferral?.rate ?? 10)) / 100)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Direct Referral Rate */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Direct Referral Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={config.directReferral?.rate ?? 10}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      directReferral: {
                        ...(config.directReferral || DEFAULT_DIRECT_REFERRAL_CONFIG),
                        rate: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#103858] focus:ring-2 focus:ring-[#103858]"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Default: 10%. Fully configurable by Super Admin.
              </p>
            </div>

            {/* Approval Required Toggle */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Executive Approval Required
              </label>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">
                  {config.directReferral?.approvalRequired !== false ? 'Required (Default)' : 'Auto-Approve'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.directReferral?.approvalRequired !== false}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        directReferral: {
                          ...(config.directReferral || DEFAULT_DIRECT_REFERRAL_CONFIG),
                          approvalRequired: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#103858]"></div>
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Ensures finance review before releasing funds.
              </p>
            </div>

            {/* Anti-Double Payout Protection */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Prevent Double Payout with Level 1
              </label>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-emerald-800">
                  {config.directReferral?.mapLevel1ToDirectReferral !== false ? 'Enabled (Safe)' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.directReferral?.mapLevel1ToDirectReferral !== false}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        directReferral: {
                          ...(config.directReferral || DEFAULT_DIRECT_REFERRAL_CONFIG),
                          mapLevel1ToDirectReferral: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Maps 10% Level 1 to Direct Referral so associates are not double-paid.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MATCHING BONUS CONFIGURATION                             */}
        {/* ======================================================== */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-blue-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#103858] text-[#CCA02E] font-black flex items-center justify-center text-sm shadow-xs">
                1:1
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#103858] flex items-center gap-2">
                  <span>Matching Bonus Configuration</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      config.matchingBonus?.enabled !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {config.matchingBonus?.enabled !== false ? 'Active Matrix' : 'Disabled'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  1:1 dual-sided network matching engine with configurable calculation basis and carry-forward rules.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.matchingBonus?.enabled !== false}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      matchingBonus: {
                        ...(config.matchingBonus || DEFAULT_MATCHING_BONUS_CONFIG),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#103858]"></div>
              </label>
              <span className="text-xs font-bold text-[#103858]">
                {config.matchingBonus?.enabled !== false ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Basis Alert Banner */}
          {(!config.matchingBonus?.basis || config.matchingBonus.basis === 'unconfigured') && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Matching qualification rules are pending configuration.</strong>
                <p className="mt-0.5 text-amber-800 leading-relaxed text-[11px]">
                  Until Admin explicitly selects and configures a calculation basis below, the system will NOT automatically calculate or credit Matching Bonus to any associate.
                </p>
              </div>
            </div>
          )}

          {/* Grid of Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Matching Bonus Basis */}
            <div className="lg:col-span-1">
              <label className="text-xs font-bold text-[#103858] block mb-1.5 flex items-center justify-between">
                <span>Matching Bonus Basis</span>
                <span className="text-[10px] text-red-600 font-bold">*Required</span>
              </label>
              <select
                value={config.matchingBonus?.basis || 'unconfigured'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    matchingBonus: {
                      ...(config.matchingBonus || DEFAULT_MATCHING_BONUS_CONFIG),
                      basis: e.target.value as MatchingBonusBasis,
                    },
                  })
                }
                className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[#103858] ${
                  config.matchingBonus?.basis && config.matchingBonus.basis !== 'unconfigured'
                    ? 'bg-white border-slate-300 text-[#103858]'
                    : 'bg-amber-50/60 border-amber-300 text-amber-900 font-extrabold'
                }`}
              >
                <option value="unconfigured">Pending Configuration (No Auto-Calculation)</option>
                <option value="matched_business_volume">Eligible Matched Business Volume</option>
                <option value="matched_commission">Eligible Matched Commission</option>
                <option value="company_approved">Another Company-Approved Matching Basis</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Defines the base on which the 10% bonus is multiplied.
              </p>
            </div>

            {/* Matching Rate */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Matching Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={config.matchingBonus?.rate ?? 10}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      matchingBonus: {
                        ...(config.matchingBonus || DEFAULT_MATCHING_BONUS_CONFIG),
                        rate: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#103858] focus:ring-2 focus:ring-[#103858]"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Default: 10%. Applied to matched 1:1 business.
              </p>
            </div>

            {/* Matching Ratio */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Matching Ratio
              </label>
              <input
                type="text"
                value={config.matchingBonus?.ratio || '1:1'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    matchingBonus: {
                      ...(config.matchingBonus || DEFAULT_MATCHING_BONUS_CONFIG),
                      ratio: e.target.value || '1:1',
                    },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#103858] focus:ring-2 focus:ring-[#103858]"
                placeholder="1:1"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Standard: 1:1 dual side alignment.
              </p>
            </div>

            {/* Carry Forward Enabled */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Carry Forward Enabled
              </label>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">
                  {config.matchingBonus?.carryForwardEnabled !== false ? 'Enabled (Default)' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.matchingBonus?.carryForwardEnabled !== false}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        matchingBonus: {
                          ...(config.matchingBonus || DEFAULT_MATCHING_BONUS_CONFIG),
                          carryForwardEnabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#103858]"></div>
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Preserves unmatched business volume for future cycles.
              </p>
            </div>

            {/* Maximum Carry Forward */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Maximum Carry Forward (₹)
              </label>
              <input
                type="number"
                step="50000"
                min="0"
                value={config.matchingBonus?.maxCarryForward ?? 0}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    matchingBonus: {
                      ...(config.matchingBonus || DEFAULT_MATCHING_BONUS_CONFIG),
                      maxCarryForward: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#103858] focus:ring-2 focus:ring-[#103858]"
                placeholder="0 for Unlimited"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Enter 0 for unlimited carry forward across cycles.
              </p>
            </div>

            {/* Flush Cycle */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Flush Cycle
              </label>
              <select
                value={config.matchingBonus?.flushCycle || 'monthly'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    matchingBonus: {
                      ...(config.matchingBonus || DEFAULT_MATCHING_BONUS_CONFIG),
                      flushCycle: e.target.value as any,
                    },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#103858] focus:ring-2 focus:ring-[#103858]"
              >
                <option value="none">None (No flush)</option>
                <option value="monthly">Monthly Cycle</option>
                <option value="quarterly">Quarterly Cycle</option>
                <option value="yearly">Yearly Cycle</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Interval for reconciliation and carry-over evaluation.
              </p>
            </div>

            {/* Qualification Required */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Qualification Required
              </label>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">
                  {config.matchingBonus?.qualificationRequired !== false ? 'Required (Default)' : 'Unconditional'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.matchingBonus?.qualificationRequired !== false}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        matchingBonus: {
                          ...(config.matchingBonus || DEFAULT_MATCHING_BONUS_CONFIG),
                          qualificationRequired: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#103858]"></div>
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enforces active partner standing and verification.
              </p>
            </div>

            {/* Minimum Eligible Business */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Minimum Eligible Business (₹)
              </label>
              <input
                type="number"
                step="50000"
                min="0"
                value={config.matchingBonus?.minEligibleBusiness ?? 0}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    matchingBonus: {
                      ...(config.matchingBonus || DEFAULT_MATCHING_BONUS_CONFIG),
                      minEligibleBusiness: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#103858] focus:ring-2 focus:ring-[#103858]"
                placeholder="0"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Minimum required volume before matching activates.
              </p>
            </div>

            {/* Approval Required */}
            <div>
              <label className="text-xs font-bold text-[#103858] block mb-1.5">
                Approval Required
              </label>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">
                  {config.matchingBonus?.approvalRequired !== false ? 'Required (Default)' : 'Auto-Approve'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.matchingBonus?.approvalRequired !== false}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        matchingBonus: {
                          ...(config.matchingBonus || DEFAULT_MATCHING_BONUS_CONFIG),
                          approvalRequired: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#103858]"></div>
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Default: true. Admin review mandatory before ledger credit.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-[#103858]">10-Level Rate Matrix</h3>
              <p className="text-xs text-slate-500">
                Adjust individual tier commission rates. Real-time dynamic recalculations shown on ₹
                {formatINR(config.referencePropertyValue || 1000000)} benchmark.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                  isTotalValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {isTotalValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>Total Pool: {totalPercentage.toFixed(2)}%</span>
              </div>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs font-semibold text-slate-500 hover:text-[#103858] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to 20%</span>
              </button>
            </div>
          </div>

          {/* 10 Level Input Rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-[#103858] font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-3 rounded-l-lg">Level</th>
                  <th className="py-2.5 px-3">Designation / Band</th>
                  <th className="py-2.5 px-3 text-center">Rate (%)</th>
                  <th className="py-2.5 px-3 text-right">Commission on Reference</th>
                  <th className="py-2.5 px-3 text-right">25% Upfront</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">36m Monthly Bal.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {config.levels.map((lvl) => {
                  const calcLevel = calculation.levels.find((l) => l.level === lvl.level);
                  const isDirect = lvl.level === 1;
                  return (
                    <tr
                      key={lvl.level}
                      className={`hover:bg-slate-50 ${isDirect ? 'bg-[#FAF8F3] font-semibold' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-black ${
                            isDirect ? 'bg-[#CCA02E] text-[#103858]' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          L{lvl.level}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-[#103858] block">{lvl.name}</span>
                        <span className="text-[10px] text-slate-400">{lvl.bandName}</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            value={lvl.rate}
                            onChange={(e) =>
                              handleLevelRateChange(lvl.level, Number(e.target.value))
                            }
                            className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-center text-[#103858] focus:ring-2 focus:ring-[#103858]"
                          />
                          <span className="text-slate-400 font-bold">%</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-black text-[#103858]">
                        {formatINR(calcLevel?.commissionAmount || 0)}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        {formatINR(calcLevel?.upfrontAmount || 0)}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-700">
                        ≈ {formatINR(calcLevel?.monthly36 || 0)} / mo
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#103858] text-white font-black text-xs">
                  <td colSpan={2} className="py-3.5 px-3 rounded-l-lg uppercase">
                    Total 10-Level Sum
                  </td>
                  <td className="py-3.5 px-3 text-center text-[#CCA02E] text-sm">
                    {totalPercentage.toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-3 text-right text-sm">
                    {formatINR(calculation.totalCommissionAmount)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-emerald-300">
                    {formatINR(calculation.totalUpfrontAmount)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-[#CCA02E] rounded-r-lg">
                    ≈ {formatINR(calculation.totalMonthly36)} / mo
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* GRAPHICAL OPERATIONAL FLOWCHART                          */}
        {/* ======================================================== */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <CommissionVisualFlow
            directRate={config.directReferral?.rate ?? 10}
            matchingRate={config.matchingBonus?.rate ?? 10}
            matchingRatio={config.matchingBonus?.ratio ?? '1:1'}
            matchingBasis={config.matchingBonus?.basis ?? 'unconfigured'}
          />
        </div>

        {/* Action Buttons */}
        {isSuperAdmin && (
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={saving}
              leftIcon={<Save className="w-4 h-4 text-[#103858]" />}
              className="font-bold shadow-md"
            >
              Save Commission Configuration
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
export default AdminCommissionPlanPage;
