import React from 'react';
import { PieChart, Layers, Trees, ShieldCheck } from 'lucide-react';

export const BansuriAreaBreakdown: React.FC = () => {
  const areas = [
    {
      title: 'Residential & Commercial Plots',
      category: 'Plot Area',
      sqm: 29992,
      percentage: 37.75,
      color: 'bg-[#103858]',
      textColor: 'text-[#103858]',
      badgeBg: 'bg-[#103858]/10',
      desc: 'Freehold plotted zones planned with structured demarcation and utility access.',
    },
    {
      title: 'Farm Land & Green Open Spaces',
      category: 'Farm Area',
      sqm: 25783,
      percentage: 32.45,
      color: 'bg-[#16A34A]',
      textColor: 'text-[#16A34A]',
      badgeBg: 'bg-[#16A34A]/10',
      desc: 'Expansive natural landscapes for eco-living, agro-forestry, and open serenity.',
    },
    {
      title: 'Main Internal & Arterial Roadways',
      category: 'Road Network',
      sqm: 20548,
      percentage: 25.86,
      color: 'bg-[#CCA02E]',
      textColor: 'text-[#967417]',
      badgeBg: 'bg-[#CCA02E]/10',
      desc: 'Spacious blacktop and paved corridors connecting all plots to the expressway entry.',
    },
    {
      title: 'Central Landscaped Park & Walkways',
      category: 'Park & Greenery',
      sqm: 2878,
      percentage: 3.62,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-50',
      desc: 'Themed central garden with tree-lined pedestrian tracks and seating alcoves.',
    },
    {
      title: 'Additional Road Connectivity',
      category: 'Additional Road',
      sqm: 250.2,
      percentage: 0.31,
      color: 'bg-slate-500',
      textColor: 'text-slate-700',
      badgeBg: 'bg-slate-100',
      desc: 'Supplementary access way providing seamless ingress and perimeter movement.',
    },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider">
            Site Engineering & Master Allocation
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#103858] mt-0.5">
            Site Area Breakdown
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Exact spatial composition verified from the official Bansuri Dham development layout.
          </p>
        </div>

        <div className="bg-[#FAF8F3] px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <Layers className="w-5 h-5 text-[#CCA02E]" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Master Area
            </span>
            <span className="text-lg font-black text-[#103858]">79,452 sqm</span>
          </div>
        </div>
      </div>

      {/* Visual Composition Stacked Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
          <span>Master Land Allocation Ratio</span>
          <span className="text-[#103858] font-bold">100% Accounted</span>
        </div>
        <div className="h-5 w-full rounded-xl overflow-hidden flex bg-slate-100 p-0.5 shadow-inner">
          {areas.map((item, idx) => (
            <div
              key={idx}
              className={`${item.color} h-full transition-all hover:opacity-90 relative group first:rounded-l-lg last:rounded-r-lg`}
              style={{ width: `${item.percentage}%` }}
              title={`${item.category}: ${item.sqm.toLocaleString()} sqm (${item.percentage}%)`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-600">
          {areas.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-xs ${item.color}`} />
              <span className="font-medium">{item.category} ({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {areas.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#FAF8F3] border border-slate-200/80 hover:border-[#CCA02E]/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${item.badgeBg} ${item.textColor}`}>
                  {item.category}
                </span>
                <span className="text-xs font-black text-slate-700">
                  {item.percentage}%
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#103858]">{item.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="pt-3.5 mt-3.5 border-t border-slate-200/60 flex items-baseline justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Net Allocation</span>
              <span className="text-base font-black text-[#103858]">
                {item.sqm.toLocaleString()} <span className="text-xs font-semibold text-slate-500">sqm</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
