import React from 'react';
import {
  Plane,
  Film,
  Train,
  Navigation,
  Compass,
  Building2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const BansuriConnectivitySection: React.FC = () => {
  const highlightCards = [
    {
      title: 'Yamuna Expressway',
      tag: 'Corridor Frontage',
      desc: 'Strategic access through the 6-lane Yamuna Expressway corridor connecting Greater Noida, Mathura, and Agra.',
      icon: Navigation,
      color: 'border-sky-500/40 bg-sky-50/50',
      iconBg: 'bg-sky-600 text-white',
    },
    {
      title: 'Jewar Airport',
      tag: 'International Gateway',
      desc: 'Project is positioned near the Jewar Airport (Noida International Airport) regional development corridor.',
      icon: Plane,
      color: 'border-emerald-500/40 bg-emerald-50/50',
      iconBg: 'bg-emerald-600 text-white',
    },
    {
      title: 'Film City',
      tag: 'Entertainment Sector',
      desc: 'Film City is highlighted in the project brochure as part of surrounding regional economic and cultural development.',
      icon: Film,
      color: 'border-amber-500/40 bg-amber-50/50',
      iconBg: 'bg-amber-600 text-white',
    },
    {
      title: 'Rapid Rail / Metro Connectivity',
      tag: 'Upcoming Transit',
      desc: 'Planned / upcoming regional transit corridors and multimodal transport links referenced in the supplied project brochure.',
      icon: Train,
      color: 'border-indigo-500/40 bg-indigo-50/50',
      iconBg: 'bg-indigo-600 text-white',
    },
  ];

  const regionalLandmarks = [
    'Noida International Airport (Jewar)',
    'Formula One (F1) International Circuit',
    'Bajna-Chandaus Highway Corridor',
    'Aligarh-Palwal State Highway',
    'Pari Chowk & Knowledge Park Hubs',
    'Eastern Peripheral Expressway (EPE)',
    'Designated Defence & Aviation Corridor',
    'Designated Tech Zones & IT Parks',
    'International Universities & Institutional Area',
    'Vrindavan, Mathura & Braj Cultural Circuit',
    'Planned Multi-Modal Logistics Hub (MMLH)',
    'Agra Heritage & Tourism Highway Corridor',
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider">
          Regional Infrastructure & Growth Corridor
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[#103858] mt-0.5">
          Connectivity & Surrounding Development
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Source-supported connectivity landmarks referenced along the 58 KM Yamuna Expressway milestone.
        </p>
      </div>

      {/* 4 Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {highlightCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${card.color} hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#103858] bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-xs">
                    {card.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#103858]">{card.title}</h3>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Regional Landmarks List */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-4 h-4 text-[#CCA02E]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#103858]">
            Regional Connectivity & Key Landmarks
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {regionalLandmarks.map((landmark, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F3] border border-slate-200/70 text-xs font-semibold text-[#103858]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>{landmark}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
