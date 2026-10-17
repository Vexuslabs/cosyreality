import React from 'react';
import {
  Store,
  Home,
  Building,
  Sparkles,
  GraduationCap,
  ShoppingBag,
  Trophy,
  Trees,
} from 'lucide-react';

export const BansuriComponentsGrid: React.FC = () => {
  const components = [
    {
      title: 'Residential Plots',
      icon: Home,
      tag: 'Plotted Living',
      description: 'Demarcated plots with wide internal roads, underground electrical cabling, and clear boundary registries.',
    },
    {
      title: 'Commercial Plots',
      icon: Store,
      tag: 'High-Street Business',
      description: 'Strategic commercial frontage along arterial roadways designed for retail, offices, and neighborhood services.',
    },
    {
      title: 'Farm Area & Open Land',
      icon: Trees,
      tag: '25,783 sqm Agro-Living',
      description: 'Expansive farm plots offering peaceful green surroundings, fresh air, and spacious retreat parcels.',
    },
    {
      title: 'Apartments',
      icon: Building,
      tag: 'Integrated Housing',
      description: 'Planned residential group housing components supporting modern multi-family living within the township.',
    },
    {
      title: 'Recreation & Parks',
      icon: Sparkles,
      tag: 'Community Leisure',
      description: 'Central landscaped gardens, dedicated walking paths, children play areas, and tranquil seating pavilions.',
    },
    {
      title: 'Education',
      icon: GraduationCap,
      tag: 'Institutional Access',
      description: 'Planned proximity and reserved institutional zones to support foundational learning and early childhood centers.',
    },
    {
      title: 'Shopping',
      icon: ShoppingBag,
      tag: 'Daily Conveniences',
      description: 'Dedicated retail market areas to cater to groceries, healthcare, cafes, and daily household needs.',
    },
    {
      title: 'Sports & Wellness',
      icon: Trophy,
      tag: 'Active Lifestyle',
      description: 'Open-air activity courts, fitness zones, and cycling tracks encouraging an active and healthy routine.',
    },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider">
          Integrated Master Planning
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[#103858] mt-0.5">
          A Complete Development Mix
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Source-verified development categories as identified in the Bansuri Dham project e-brochure.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {components.map((comp, idx) => {
          const Icon = comp.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#FAF8F3] border border-slate-200/80 hover:border-[#CCA02E]/60 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-[#103858] group-hover:bg-[#103858] group-hover:text-[#CCA02E] flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {comp.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#103858] group-hover:text-[#CCA02E] transition-colors">
                  {comp.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {comp.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
