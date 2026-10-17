import React from 'react';
import { Sparkles, Heart, Sun, Trees, Compass, Shield } from 'lucide-react';

export const BansuriDevotionalSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0D2E49] via-[#0F3A5C] to-[#0A2338] text-white p-6 sm:p-10 border border-[#CCA02E]/30 shadow-xl">
      {/* Decorative background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#CCA02E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#CCA02E]/15 text-[#E6C665] border border-[#CCA02E]/40">
          <Sparkles className="w-3.5 h-3.5 text-[#CCA02E]" />
          <span>Devotional & Cultural Heritage</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            A Calm, Culture-Inspired Living Environment
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl">
            Drawing inspiration from the serene spiritual aura of Vrindavan and the historic Braj corridor, Bansuri Dham is conceived as a tranquil sanctuary where modern planned infrastructure meets timeless cultural harmony.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/15">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-[#CCA02E]/20 text-[#CCA02E] flex items-center justify-center mb-2">
              <Sun className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Tranquil Living</h3>
            <p className="text-xs text-slate-300 mt-1">
              Far from urban congestion, surrounded by open skies and expansive greenery.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2">
              <Trees className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Vrindavan Agro Farms</h3>
            <p className="text-xs text-slate-300 mt-1">
              25,783 sqm allocated to agro-living and natural open farm parcels.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center mb-2">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Spiritual Corridor Link</h3>
            <p className="text-xs text-slate-300 mt-1">
              Convenient highway access to Mathura, Vrindavan, Govardhan and Gokul.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
