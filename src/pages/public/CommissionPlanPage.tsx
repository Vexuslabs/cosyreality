import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  ShieldCheck,
  Award,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Briefcase,
  Sparkles,
  BookOpen,
  Compass,
  PhoneCall,
  Lock,
  IndianRupee,
} from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import {
  getCommissionPlanConfig,
  calculateCommissionPlan,
  CommissionPlanConfig,
  DEFAULT_COMMISSION_PLAN_CONFIG,
  COMPLIANCE_DISCLAIMER,
} from '../../services/commissionService';
import { formatINR } from '../../utils/formatters';
import { useDocumentTitle } from '../../utils/seo';
import { CommissionVisualFlow } from '../../components/admin/commission/CommissionVisualFlow';

export const CommissionPlanPage: React.FC = () => {
  useDocumentTitle('10-Level Associate Business Plan — Cosy Reality');
  const { settings } = useSettings();
  const { isSuperAdmin, isAdmin } = useAuth();

  const [config, setConfig] = useState<CommissionPlanConfig>(DEFAULT_COMMISSION_PLAN_CONFIG);
  const [propertyValue, setPropertyValue] = useState<number>(1000000); // ₹10,00,000 default
  const [customInput, setCustomInput] = useState<string>('1000000');
  const [activeTab, setActiveTab] = useState<'36m' | '60m'>('36m');

  useEffect(() => {
    async function loadConfig() {
      const data = await getCommissionPlanConfig();
      setConfig(data);
      if (data.referencePropertyValue) {
        setPropertyValue(data.referencePropertyValue);
        setCustomInput(data.referencePropertyValue.toString());
      }
    }
    loadConfig();
  }, []);

  const calculation = calculateCommissionPlan(propertyValue, config);

  const presets = [
    { label: '₹10 Lakh (Standard)', value: 1000000 },
    { label: '₹25 Lakh (Villa/Plot)', value: 2500000 },
    { label: '₹50 Lakh (Apartment)', value: 5000000 },
    { label: '₹1 Crore (Commercial)', value: 10000000 },
  ];

  const handlePresetSelect = (val: number) => {
    setPropertyValue(val);
    setCustomInput(val.toString());
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomInput(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setPropertyValue(num);
    }
  };

  // If Super Admin disabled the public commission plan and the user is not an admin
  const isPubliclyVisible = settings.showCommissionPlan || config.enabled || isSuperAdmin || isAdmin;

  if (!isPubliclyVisible) {
    return (
      <div className="py-20 bg-[#FAF8F3]">
        <Container>
          <div className="max-w-2xl mx-auto text-center bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#103858]/10 text-[#103858] flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-[#CCA02E]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#103858]">
                Associate Business Plan
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                The 10-Level Associate Business Plan module is currently available to verified registered channel partners. If you are an active partner, please sign in or register below.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link to="/associates">
                <Button variant="gold" size="md">
                  Apply as Channel Partner
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="md">
                  Contact Channel Desk
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 sm:py-16">
      <Container className="space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#103858]/10 text-[#103858] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#CCA02E]" />
            <span>Illustrative Channel Partner Model</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#103858] tracking-tight">
            10-Level Associate Business Plan
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            A structured, transparent 10-tier commission ecosystem designed to reward direct deal origination and professional network leadership on qualifying property transactions.
          </p>
        </div>

        {/* PROMINENT COMPLIANCE & STATUTORY DISCLAIMER BANNER */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 sm:p-6 text-amber-900 shadow-xs">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm sm:text-base text-amber-950 uppercase tracking-wide">
                Regulatory Compliance & Policy Disclosure
              </h3>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                {COMPLIANCE_DISCLAIMER}
              </p>
              <p className="text-[11px] text-amber-800 font-semibold pt-1">
                ⚠️ This plan is strictly illustrative and is never presented as guaranteed return, fixed monthly income, assured earnings, or an investment scheme.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION A: REFERENCE TRANSACTION OVERVIEW CARD */}
        <div className="bg-gradient-to-br from-[#103858] to-[#0A243A] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 bg-[#CCA02E]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E] block mb-1">
                  Reference Transaction Benchmark
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Source Illustration: {formatINR(config.referencePropertyValue || 1000000)} Qualifying Deal
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Calculated against standard 20.00% total multi-tier commission pool ({formatINR(calculation.totalCommissionAmount)})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link to="/associates">
                  <Button variant="gold" size="sm">
                    Become an Associate
                  </Button>
                </Link>
                <Link to="/associate/dashboard">
                  <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer">
                    Associate Dashboard
                  </button>
                </Link>
              </div>
            </div>

            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-xs p-5 rounded-2xl border border-white/10">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                  Qualifying Property Value
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white block mt-1">
                  {formatINR(calculation.propertyValue)}
                </span>
                <span className="text-[11px] text-[#CCA02E] mt-1 block">Verified Customer Purchase</span>
              </div>

              <div className="bg-[#CCA02E]/10 backdrop-blur-xs p-5 rounded-2xl border border-[#CCA02E]/30">
                <span className="text-[11px] font-semibold text-[#CCA02E] uppercase tracking-wider block">
                  Total 10-Level Pool (20%)
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white block mt-1">
                  {formatINR(calculation.totalCommissionAmount)}
                </span>
                <span className="text-[11px] text-slate-300 mt-1 block">Distributed Across 10 Levels</span>
              </div>

              <div className="bg-white/5 backdrop-blur-xs p-5 rounded-2xl border border-white/10">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                  25% Upfront Component
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 block mt-1">
                  {formatINR(calculation.totalUpfrontAmount)}
                </span>
                <span className="text-[11px] text-slate-300 mt-1 block">One-time upon collection clearance</span>
              </div>

              <div className="bg-white/5 backdrop-blur-xs p-5 rounded-2xl border border-white/10">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                  Remaining 75% Balance
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#CCA02E] block mt-1">
                  {formatINR(calculation.totalRemainingAmount)}
                </span>
                <span className="text-[11px] text-slate-300 mt-1 block">
                  Illustrative {config.tenureMonths1 || 36}m or {config.tenureMonths2 || 60}m schedule
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DIRECT REFERRAL & 1:1 MATCHING BONUS ARCHITECTURE        */}
        {/* ======================================================== */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#CCA02E]">
              Core Business Plan Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103858]">
              Direct Referral & 1:1 Matching Bonus
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Transparent, performance-driven incentives structured around actual customer land acquisitions and verified collections.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. DIRECT REFERRAL CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-xs flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#CCA02E] text-[#103858] font-black flex items-center justify-center text-base shadow-xs">
                      {config.directReferral?.rate ?? 10}%
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                        Commission Type
                      </span>
                      <h3 className="text-xl font-extrabold text-[#103858]">Direct Referral</h3>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    Configurable Rate
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800">
                    An eligible Direct Referral commission is calculated as {config.directReferral?.rate ?? 10}% of the qualifying plot/property value, subject to company eligibility, collection, documentation and approval rules.
                  </p>
                  <p className="text-slate-500">
                    Direct Referral Commission = Qualifying Plot Value × Direct Referral Rate ({config.directReferral?.rate ?? 10}%)
                  </p>
                </div>

                {/* Example Box */}
                <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                    Illustrative Example
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-700">
                      <span>Qualifying Plot Value:</span>
                      <span className="font-bold text-[#103858]">₹10,00,000</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Direct Referral Rate:</span>
                      <span className="font-bold text-amber-800">{config.directReferral?.rate ?? 10}%</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-amber-200 font-extrabold text-[#103858]">
                      <span>Illustrative Direct Referral Commission:</span>
                      <span className="text-sm font-black text-[#103858]">
                        ₹{formatINR((1000000 * (config.directReferral?.rate ?? 10)) / 100)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
                * Rate is administratively configurable. Payments are released upon verified milestone collections and administrative sign-off.
              </div>
            </div>

            {/* 2. MATCHING BONUS CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xs flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#103858] text-[#CCA02E] font-black flex items-center justify-center text-base shadow-xs">
                      1:1
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">
                        Dual-Network Matrix
                      </span>
                      <h3 className="text-xl font-extrabold text-[#103858]">Matching Bonus</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                      {config.matchingBonus?.rate ?? 10}% Rate
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800">
                    "Matching Bonus is calculated on eligible 1:1 matched business according to the approved company plan and qualification rules."
                  </p>
                  <p className="text-slate-500">
                    Dual network alignment across two eligible business channels (Side A / Left Business & Side B / Right Business). Matching occurs exclusively against qualifying completed business volumes.
                  </p>
                </div>

                {/* Engine Breakdown Box */}
                <div className="bg-blue-50/50 border border-blue-200/70 rounded-2xl p-4 space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                    1:1 Matching Engine Mechanism
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-700">
                      <span>Side A (Left) Eligible Volume:</span>
                      <span className="font-bold text-[#103858]">₹15,00,000</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Side B (Right) Eligible Volume:</span>
                      <span className="font-bold text-[#103858]">₹10,00,000</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-blue-200 text-slate-800 font-bold">
                      <span>1:1 Matched Volume:</span>
                      <span className="text-blue-900 font-black">₹10,00,000</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                      <span>Carry-Forward to Next Cycle (Side A):</span>
                      <span>₹5,00,000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-amber-800/90 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 leading-normal">
                <strong>Statutory Notice:</strong> Not guaranteed income. Calculation basis is subject to approved Admin configuration (Matched Business Volume / Matched Commission / Company Framework).
              </div>
            </div>
          </div>

          {/* GRAPHICAL VISUAL FLOW COMPONENT */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <CommissionVisualFlow
              directRate={config.directReferral?.rate ?? 10}
              matchingRate={config.matchingBonus?.rate ?? 10}
              matchingRatio={config.matchingBonus?.ratio || '1:1'}
              matchingBasis={config.matchingBonus?.basis || 'unconfigured'}
            />
          </div>
        </div>

        {/* SECTION F: INTERACTIVE DYNAMIC COMMISSION CALCULATOR */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#103858] text-[#CCA02E] flex items-center justify-center font-bold shadow-xs">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#103858]">
                  Dynamic Commission Calculator
                </h3>
                <p className="text-xs text-slate-500">
                  Select or input any qualifying transaction value to preview real-time 10-level disbursements
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePresetSelect(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    propertyValue === p.value
                      ? 'bg-[#103858] text-white shadow-xs'
                      : 'bg-[#FAF8F3] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Input Slider */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-[#103858]">
                  Qualifying Property Transaction Value
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={customInput}
                    onChange={handleCustomInputChange}
                    className="w-40 bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 text-sm font-black text-[#103858] text-right focus:outline-none focus:ring-2 focus:ring-[#103858]"
                  />
                </div>
              </div>

              <input
                type="range"
                min={500000}
                max={20000000}
                step={250000}
                value={propertyValue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPropertyValue(val);
                  setCustomInput(val.toString());
                }}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#103858]"
              />

              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span>₹5 Lakh</span>
                <span>₹50 Lakh</span>
                <span>₹1 Crore</span>
                <span>₹2 Crore</span>
              </div>
            </div>

            {/* Live Calculation Callout */}
            <div className="lg:col-span-5 bg-[#FAF8F3] p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Total 20% Pool:</span>
                <span className="font-black text-base text-[#103858]">
                  {formatINR(calculation.totalCommissionAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-700">25% Upfront Component:</span>
                <span className="font-bold text-sm text-emerald-700">
                  {formatINR(calculation.totalUpfrontAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-800">75% Remaining Balance:</span>
                <span className="font-bold text-sm text-amber-800">
                  {formatINR(calculation.totalRemainingAmount)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Illustrative Monthly Schedule:</span>
                <div className="text-right">
                  <span className="text-xs font-black text-[#103858] block">
                    ≈ {formatINR(calculation.totalMonthly36)} / mo (36m)
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 block">
                    = {formatINR(calculation.totalMonthly60)} / mo (60m)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION C: 4-BAND NETWORK VISUALIZATION */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#CCA02E]">
              Graphical Network Distribution
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103858] mt-1">
              Commission Band Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Visualizing the proportionate share of the 20% commission pool across all 4 operational tiers
            </p>
          </div>

          {/* Visual Bar Strip */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#103858] mb-2">
                <span>Commission Pool Allocation (100% of ₹{formatINR(calculation.totalCommissionAmount)})</span>
                <span>20.00% of Property Value</span>
              </div>

              <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-100 shadow-inner">
                <div
                  style={{ width: `${calculation.bands[0]?.shareOfPool || 50}%` }}
                  className="bg-[#103858] text-white text-[10px] font-bold flex items-center justify-center transition-all"
                  title="Band 1: Direct Level 1 (50%)"
                >
                  Direct (50%)
                </div>
                <div
                  style={{ width: `${calculation.bands[1]?.shareOfPool || 26.25}%` }}
                  className="bg-[#CCA02E] text-[#103858] text-[10px] font-bold flex items-center justify-center transition-all"
                  title="Band 2: Early Network L2-4 (26.25%)"
                >
                  L2–L4 (26.25%)
                </div>
                <div
                  style={{ width: `${calculation.bands[2]?.shareOfPool || 11.25}%` }}
                  className="bg-[#16A34A] text-white text-[10px] font-bold flex items-center justify-center transition-all"
                  title="Band 3: Mid Network L5-8 (11.25%)"
                >
                  L5–L8
                </div>
                <div
                  style={{ width: `${calculation.bands[3]?.shareOfPool || 12.5}%` }}
                  className="bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                  title="Band 4: Deep Network L9-10 (12.5%)"
                >
                  L9–L10
                </div>
              </div>
            </div>

            {/* 4 Band Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {calculation.bands.map((band, idx) => {
                const colors = [
                  { border: 'border-[#103858]/30', bg: 'bg-[#103858]/5', badge: 'bg-[#103858] text-white', text: 'text-[#103858]' },
                  { border: 'border-[#CCA02E]/30', bg: 'bg-[#CCA02E]/10', badge: 'bg-[#CCA02E] text-[#103858]', text: 'text-[#8C6D1F]' },
                  { border: 'border-[#16A34A]/30', bg: 'bg-[#16A34A]/10', badge: 'bg-[#16A34A] text-white', text: 'text-[#16A34A]' },
                  { border: 'border-indigo-200', bg: 'bg-indigo-50', badge: 'bg-indigo-600 text-white', text: 'text-indigo-700' },
                ][idx] || { border: 'border-slate-200', bg: 'bg-slate-50', badge: 'bg-slate-800 text-white', text: 'text-slate-800' };

                return (
                  <div
                    key={band.band}
                    className={`p-5 rounded-2xl border ${colors.border} ${colors.bg} flex flex-col justify-between space-y-3`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${colors.badge}`}>
                          Band {band.band}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{band.levelRange}</span>
                      </div>

                      <h4 className={`text-base font-extrabold ${colors.text}`}>
                        {band.bandName}
                      </h4>

                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {band.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Property Rate:</span>
                        <span className="font-bold text-[#103858]">{band.combinedRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Pool Share:</span>
                        <span className="font-bold text-[#CCA02E]">{band.shareOfPool.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="font-semibold text-slate-700">Total Rupee:</span>
                        <span className="font-black text-sm text-[#103858]">
                          {formatINR(band.combinedAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION E: COMPLETE 10-LEVEL PAYOUT TABLE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#CCA02E]">
                Comprehensive Breakdown
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#103858] mt-0.5">
                Level-Wise Commission & Payout Schedule
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed simulation for {formatINR(calculation.propertyValue)} qualifying property transaction
              </p>
            </div>

            {/* Tenure Toggle */}
            <div className="flex items-center gap-1.5 bg-[#FAF8F3] p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('36m')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === '36m'
                    ? 'bg-[#103858] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#103858]'
                }`}
              >
                36-Month Schedule
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('60m')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === '60m'
                    ? 'bg-[#103858] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#103858]'
                }`}
              >
                60-Month Schedule
              </button>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#103858] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Level & Designation</th>
                  <th className="py-3 px-4 text-center">Commission %</th>
                  <th className="py-3 px-4 text-right">Total Commission</th>
                  <th className="py-3 px-4 text-right bg-emerald-900/60">25% Upfront Component</th>
                  <th className="py-3 px-4 text-right">
                    {activeTab === '36m' ? '36-Month Balance' : '60-Month Balance'}
                  </th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Share of Pool</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {calculation.levels.map((lvl) => {
                  const isDirect = lvl.level === 1;
                  return (
                    <tr
                      key={lvl.level}
                      className={`hover:bg-slate-50 transition-colors ${
                        isDirect ? 'bg-[#FAF8F3] font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                              isDirect
                                ? 'bg-[#CCA02E] text-[#103858]'
                                : 'bg-[#103858]/10 text-[#103858]'
                            }`}
                          >
                            L{lvl.level}
                          </span>
                          <div>
                            <span className="font-bold text-[#103858] block">
                              {lvl.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {lvl.bandName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-[#103858]">
                        {lvl.rate.toFixed(2)}%
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-[#103858]">
                        {formatINR(lvl.commissionAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700 bg-emerald-50/50">
                        {formatINR(lvl.upfrontAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-[#103858]">
                        {activeTab === '36m' ? (
                          <span>
                            ≈ {formatINR(lvl.monthly36)}
                            <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                          </span>
                        ) : (
                          <span>
                            = {formatINR(lvl.monthly60)}
                            <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                        {lvl.shareOfPool.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Total Footer */}
              <tfoot>
                <tr className="bg-[#103858] text-white font-extrabold text-xs">
                  <td className="py-4 px-4 rounded-l-xl uppercase tracking-wider">
                    Total 10-Level Pool
                  </td>
                  <td className="py-4 px-4 text-center font-black text-[#CCA02E]">
                    {calculation.actualTotalRate.toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-right font-black text-white text-sm">
                    {formatINR(calculation.totalCommissionAmount)}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-emerald-300 bg-emerald-950/60">
                    {formatINR(calculation.totalUpfrontAmount)}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-[#CCA02E] text-sm">
                    {activeTab === '36m' ? (
                      <span>≈ {formatINR(calculation.totalMonthly36)} / mo</span>
                    ) : (
                      <span>= {formatINR(calculation.totalMonthly60)} / mo</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right rounded-r-xl font-black">
                    100.00%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * All payout timelines and monthly balance schedules are illustrative calculations based on the source mathematical model. Specific disbursements follow verified client payment clearance and approved agreements.
          </p>
        </div>

        {/* SECTION K: 5-STEP BUSINESS MECHANICS */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#CCA02E]">
              Operational Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103858] mt-1">
              Business Mechanics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Commissions are strictly earned through verified property sales and collection milestones — never from mere lead registration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: '1. PROPERTY',
                desc: 'Customer selects and purchases an authorized, verified qualifying property or plot.',
                icon: Briefcase,
              },
              {
                step: '02',
                title: '2. COLLECTION',
                desc: 'Eligible booking token & milestone collections are cleared per company terms.',
                icon: IndianRupee,
              },
              {
                step: '03',
                title: '3. QUALIFICATION',
                desc: 'Direct associate and qualifying 10-level upline hierarchy are formally verified.',
                icon: ShieldCheck,
              },
              {
                step: '04',
                title: '4. COMMISSION',
                desc: 'Eligible commission records are generated strictly per the approved business plan.',
                icon: Calculator,
              },
              {
                step: '05',
                title: '5. PAYOUT',
                desc: 'Disbursement follows the approved schedule (upfront component + tenure balances).',
                icon: Award,
              },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.step}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden"
                >
                  <span className="text-3xl font-black text-slate-100 absolute right-3 top-3 select-none">
                    {m.step}
                  </span>
                  <div className="relative z-10 space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-[#103858] text-[#CCA02E] flex items-center justify-center font-bold mb-3">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-sm text-[#103858]">{m.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION N: ASSOCIATE JOURNEY (5 STEPS) */}
        <div className="bg-[#103858] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E]">
              Growth Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              The Associate Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Five progressive milestones for sustained professional accomplishment in real estate
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                title: 'JOIN',
                desc: 'Understand company ethos, property inventory, compliance standards, and commercial terms.',
              },
              {
                title: 'LEARN',
                desc: 'Master product specifications, land title verifications, pricing models, and client communication.',
              },
              {
                title: 'CONNECT',
                desc: 'Develop genuine client relationships and cultivate trust-based referral connections.',
              },
              {
                title: 'CONVERT',
                desc: 'Facilitate smooth qualifying property transactions backed by transparent documentation.',
              },
              {
                title: 'GROW',
                desc: 'Expand and mentor a responsible, compliant associate team through service excellence.',
              },
            ].map((j, i) => (
              <div
                key={j.title}
                className="bg-white/5 backdrop-blur-xs p-5 rounded-2xl border border-white/10 space-y-2 relative"
              >
                <div className="w-7 h-7 rounded-full bg-[#CCA02E] text-[#103858] text-xs font-black flex items-center justify-center mb-2">
                  {i + 1}
                </div>
                <h4 className="font-bold text-base text-[#CCA02E]">{j.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{j.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION O: 4 SUPPORT PILLARS */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#CCA02E]">
              Institutional Backing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103858] mt-1">
              Our 4 Support Pillars
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Everything channel partners require to operate with total confidence and efficiency
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Product Support',
                desc: 'Comprehensive project collateral, real-time inventory matrix, site visit coordination, and verified land registry records.',
                icon: BookOpen,
              },
              {
                title: 'Sales Enablement',
                desc: 'Interactive digital brochures, project walkthrough videos, structured pricing calculators, and on-ground presentation suites.',
                icon: TrendingUp,
              },
              {
                title: 'Network Support',
                desc: 'Dedicated channel partner relationship managers, hierarchy tracking, regular product workshops, and team alignment.',
                icon: Users,
              },
              {
                title: 'Documentation',
                desc: 'Legally vetted channel agreements, automated milestone collection tracking, digital invoicing, and payout statement archives.',
                icon: FileText,
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#103858]/10 text-[#103858] flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5 text-[#CCA02E]" />
                  </div>
                  <h4 className="font-bold text-base text-[#103858]">{pillar.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA SECTION */}
        <div className="bg-gradient-to-r from-[#CCA02E] to-[#B3871D] text-[#103858] rounded-3xl p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#103858]">
              Ready to Join the Cosy Reality Channel Network?
            </h3>
            <p className="text-xs sm:text-sm text-[#103858]/90 leading-relaxed">
              Register your channel partnership today, access live developer inventory, and start presenting premier residential & plotted projects in Delhi NCR.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/associates">
              <button className="bg-[#103858] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0a263c] transition-all shadow-md cursor-pointer">
                Apply for Channel Partnership
              </button>
            </Link>
            <Link to="/inventory">
              <button className="bg-white text-[#103858] px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all shadow-md cursor-pointer">
                Explore Live Inventory
              </button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};
export default CommissionPlanPage;
