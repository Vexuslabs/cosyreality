import React from 'react';
import {
  Trees,
  Dumbbell,
  Sun,
  Shield,
  Compass,
  Droplets,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const BansuriAmenitiesSection: React.FC = () => {
  const amenities = [
    {
      title: 'Parks & Walking Tracks',
      desc: '2,878 sqm landscaped central park, themed flowerbeds, and dedicated pedestrian walking corridors.',
      icon: Trees,
      tag: 'Green Living',
    },
    {
      title: 'Club House & Fitness Provisions',
      desc: 'Planned community social lounge, indoor activity spaces, and modern fitness center facilities.',
      icon: Dumbbell,
      tag: 'Community & Health',
    },
    {
      title: 'Solar Lighting & Energy Panels',
      desc: 'Eco-conscious solar-powered street lighting along main avenues to promote energy conservation.',
      icon: Sun,
      tag: 'Eco Friendly',
    },
    {
      title: 'CCTV Surveillance & Gated Security',
      desc: 'Multi-tier gated entrance with security cabin, perimeter boundary wall, and 24x7 surveillance provision.',
      icon: Shield,
      tag: 'Safety First',
    },
    {
      title: 'Engineered Road Infrastructure',
      desc: '20,548 sqm comprehensive internal road network with 30ft, 40ft, and 60ft wide blacktop avenues.',
      icon: Compass,
      tag: '20,548 sqm Roads',
    },
    {
      title: 'Underground Drainage & Sewerage',
      desc: 'Planned storm-water drainage lines, rain-water harvesting recharge pits, and underground utilities.',
      icon: Droplets,
      tag: 'Civic Utilities',
    },
    {
      title: 'Educational & Activity Zones',
      desc: 'Reserved spaces for foundational education centers, daycare facilities, and children play zones.',
      icon: GraduationCap,
      tag: 'Family Infrastructure',
    },
    {
      title: 'Devotional & Cultural Harmony',
      desc: 'Peaceful natural ambiance designed to reflect the cultural essence of the Vrindavan-Braj corridor.',
      icon: Sparkles,
      tag: 'Culture Inspired',
    },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider">
          Township Infrastructure & Facilities
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[#103858] mt-0.5">
          Planned Amenities & Utilities
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Essential lifestyle amenities and civic infrastructure planned across the Bansuri Dham development.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {amenities.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#FAF8F3] border border-slate-200/80 hover:border-[#CCA02E]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-[#103858] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#103858]" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#103858]">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
