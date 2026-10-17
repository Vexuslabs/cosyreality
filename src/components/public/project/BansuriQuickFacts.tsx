import React from 'react';
import { Building, MapPin, Compass, Maximize2, Layers, CheckCircle2, Shield } from 'lucide-react';
import { Project } from '../../../types';

interface BansuriQuickFactsProps {
  project: Project;
}

export const BansuriQuickFacts: React.FC<BansuriQuickFactsProps> = ({ project }) => {
  const facts = [
    {
      label: 'Project',
      value: project.projectName || 'Bansuri Dham',
      subtext: 'Bansuri Dham Vrindavan Farms',
      icon: Building,
    },
    {
      label: 'Location',
      value: '58 KM Milestone',
      subtext: 'Yamuna Expressway corridor',
      icon: MapPin,
    },
    {
      label: 'Nearby Landmark',
      value: 'Jewar Airport',
      subtext: 'Noida International Airport corridor',
      icon: Compass,
    },
    {
      label: 'Development Type',
      value: 'Plotted / Mixed',
      subtext: 'Residential, Commercial & Farm',
      icon: Layers,
    },
    {
      label: 'Site Area',
      value: '79,452 sqm',
      subtext: 'Planned master layout',
      icon: Maximize2,
    },
    {
      label: 'Key Components',
      value: 'Plots, Farms & Parks',
      subtext: 'With 20,548 sqm road network',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider">
            Verified Project Data
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#103858] mt-0.5">
            Quick Facts & Specifications
          </h2>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#103858]/5 text-[#103858] border border-[#103858]/10">
          <Shield className="w-3.5 h-3.5 text-[#CCA02E]" />
          <span>Brochure Sourced</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {facts.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#FAF8F3] border border-slate-200/70 hover:border-[#CCA02E]/60 transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 text-[#103858] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-[#103858]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {f.label}
                </span>
                <span className="text-sm font-extrabold text-[#103858] block mt-0.5 leading-tight">
                  {f.value}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1 leading-snug">
                  {f.subtext}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
