import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, IndianRupee, Sparkles, TrendingUp, Layers, ArrowRight, Info } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import {
  getCommissionPlanConfig,
  calculateCommissionPlan,
  CommissionPlanConfig,
  DEFAULT_COMMISSION_PLAN_CONFIG,
  COMPLIANCE_DISCLAIMER,
} from '../../services/commissionService';

export const CommissionCalculator: React.FC = () => {
  const [config, setConfig] = useState<CommissionPlanConfig>(DEFAULT_COMMISSION_PLAN_CONFIG);
  const [propertyValue, setPropertyValue] = useState<number>(1000000); // 10 Lakhs standard benchmark
  const [selectedLevel, setSelectedLevel] = useState<number>(1); // Level 1 (Direct)

  useEffect(() => {
    async function load() {
      const data = await getCommissionPlanConfig();
      setConfig(data);
      if (data.referencePropertyValue) {
        setPropertyValue(data.referencePropertyValue);
      }
    }
    load();
  }, []);

  const calculation = calculateCommissionPlan(propertyValue, config);
  const currentLvl = calculation.levels.find((l) => l.level === selectedLevel) || calculation.levels[0];

  return (
    <div className="bg-gradient-to-br from-[#103858] to-[#0A243A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CCA02E] text-[#103858] flex items-center justify-center font-bold shadow-md">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Associate Commission Calculator</h3>
            <p className="text-xs text-[#CCA02E]">Illustrative 10-tier commission distribution simulator</p>
          </div>
        </div>

        <Link
          to="/commission-plan"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#CCA02E] hover:underline"
        >
          <span>Full 10-Level Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-5">
        {/* Slider: Property Value */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Qualifying Property Deal Value
            </span>
            <span className="text-lg font-extrabold text-[#CCA02E]">
              {formatINR(propertyValue)}
            </span>
          </div>
          <input
            type="range"
            min={500000}
            max={20000000}
            step={250000}
            value={propertyValue}
            onChange={(e) => setPropertyValue(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#CCA02E]"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
            <span>₹5 Lakh</span>
            <span>₹50 Lakh</span>
            <span>₹1 Crore</span>
            <span>₹2 Crore</span>
          </div>
        </div>

        {/* Level Selector Buttons */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Commission Tier / Level
            </span>
            <span className="text-xs font-bold text-[#CCA02E]">
              {currentLvl.name} ({currentLvl.rate}%)
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {calculation.levels.map((lvl) => (
              <button
                key={lvl.level}
                type="button"
                onClick={() => setSelectedLevel(lvl.level)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLevel === lvl.level
                    ? 'bg-[#CCA02E] text-[#103858] shadow-md font-black scale-105'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                L{lvl.level}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Earnings Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-[#CCA02E]/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                Level {currentLvl.level} Eligible Commission ({currentLvl.rate}%):
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#CCA02E]">
                {formatINR(currentLvl.commissionAmount)}
              </span>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-300 block">25% Upfront Component:</span>
              <span className="font-bold text-emerald-400 text-sm">{formatINR(currentLvl.upfrontAmount)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Illustrative Monthly Balance:</span>
            <span className="font-semibold text-white">
              ≈ {formatINR(currentLvl.monthly36)} / mo (36m) &nbsp;|&nbsp; = {formatINR(currentLvl.monthly60)} / mo (60m)
            </span>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="flex items-start gap-2 text-[10px] text-slate-400 pt-1">
          <Info className="w-3.5 h-3.5 text-[#CCA02E] shrink-0 mt-0.5" />
          <p>
            * Illustrative model. Payouts are subject to verified property sale collections, documentation, approved company policy, cancellations, taxes and applicable regulations.
          </p>
        </div>
      </div>
    </div>
  );
};
export default CommissionCalculator;
