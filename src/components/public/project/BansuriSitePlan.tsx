import React, { useState } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
  Compass,
  X,
  Eye,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Button } from '../../ui/Button';

interface BansuriSitePlanProps {
  sitePlanUrl?: string;
  projectName?: string;
}

export const BansuriSitePlan: React.FC<BansuriSitePlanProps> = ({
  sitePlanUrl,
  projectName = 'Bansuri Dham',
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [activeZone, setActiveZone] = useState<'all' | 'plots' | 'farms' | 'park' | 'commercial' | 'roads'>('all');

  const zones = [
    { id: 'all', label: 'All Zones', count: '79,452 sqm', color: 'bg-slate-800 text-white' },
    { id: 'plots', label: 'Residential Plots', count: '29,992 sqm', color: 'bg-[#103858] text-white' },
    { id: 'farms', label: 'Farm Land', count: '25,783 sqm', color: 'bg-[#16A34A] text-white' },
    { id: 'park', label: 'Central Park', count: '2,878 sqm', color: 'bg-emerald-600 text-white' },
    { id: 'commercial', label: 'Commercial Frontage', count: 'Entry Zone', color: 'bg-[#CCA02E] text-[#103858]' },
    { id: 'roads', label: 'Road Network', count: '20,548 sqm', color: 'bg-slate-600 text-white' },
  ];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider">
            Township Layout & Spatial Master Plan
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#103858] mt-0.5">
            Township Site Plan
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Planned plotted layout detailing residential sectors, farm acreage, arterial avenues, and green buffers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullscreenOpen(true)}
            leftIcon={<Maximize2 className="w-4 h-4 text-[#103858]" />}
          >
            View Full Site Plan
          </Button>
        </div>
      </div>

      {/* Interactive Zone Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Filter Zone:</span>
        </span>
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => setActiveZone(z.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeZone === z.id
                ? `${z.color} shadow-xs scale-102`
                : 'bg-[#FAF8F3] text-slate-700 hover:bg-slate-200/70 border border-slate-200/70'
            }`}
          >
            <span>{z.label}</span>
            <span className="text-[10px] opacity-80 font-normal">({z.count})</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Site Plan Stage */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#0B2135] min-h-[380px] sm:min-h-[480px] flex items-center justify-center p-4">
        {/* Floating Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors text-xs font-bold"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFullscreenOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#103858] hover:bg-[#103858]/10 transition-colors"
            title="Fullscreen Modal"
            aria-label="Fullscreen Modal"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Compass Marker */}
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-md border border-slate-200 flex items-center gap-2 text-xs font-bold text-[#103858]">
          <Compass className="w-4 h-4 text-[#CCA02E] animate-spin-slow" />
          <span>North Aligned Master Plan</span>
        </div>

        {/* Site Plan Graphic Container */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-200 overflow-auto cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {sitePlanUrl ? (
            <img
              src={sitePlanUrl}
              alt="Bansuri Dham Township Site Plan"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[500px] object-contain rounded-xl"
            />
          ) : (
            /* High-fidelity architectural vector diagram of Bansuri Dham */
            <div className="w-full max-w-3xl bg-[#0F2A42] p-6 rounded-2xl border border-white/10 shadow-2xl text-white">
              {/* Site Plan Title Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#CCA02E]" />
                  <span className="text-xs font-black tracking-widest uppercase text-[#CCA02E]">
                    BANSURI DHAM — 79,452 SQM MASTER TOWNSHIP LAYOUT
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono">58 KM YAMUNA EXPRESSWAY</span>
              </div>

              {/* Layout Visual Simulation */}
              <div className="space-y-4">
                {/* Main Arterial Road (Top) */}
                <div className={`p-3 rounded-xl border border-amber-400/30 transition-all ${activeZone === 'roads' || activeZone === 'all' ? 'bg-amber-500/20' : 'opacity-40'}`}>
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>MAIN 60-FT ARTERIAL ENTRY BOULEVARD & DRAINAGE CORRIDOR</span>
                    <span className="text-[10px] font-mono">DIRECT EXPRESSWAY ACCESS</span>
                  </div>
                </div>

                {/* Main Grid Sectors */}
                <div className="grid grid-cols-12 gap-3">
                  {/* Commercial Frontage (Left) */}
                  <div className={`col-span-3 p-4 rounded-xl border border-yellow-500/40 flex flex-col justify-between min-h-[160px] transition-all ${activeZone === 'commercial' || activeZone === 'all' ? 'bg-yellow-500/20 ring-1 ring-yellow-400' : 'opacity-40'}`}>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#CCA02E] text-[#103858] uppercase">
                        Sector A
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1.5">Commercial Hub & Retail Plots</h4>
                      <p className="text-[10px] text-slate-300 mt-1">High-street retail frontages & convenience shopping</p>
                    </div>
                    <span className="text-[10px] font-mono text-amber-200">Plots C-01 to C-24</span>
                  </div>

                  {/* Central Residential Plots (Middle) */}
                  <div className={`col-span-5 p-4 rounded-xl border border-sky-400/40 flex flex-col justify-between min-h-[160px] transition-all ${activeZone === 'plots' || activeZone === 'all' ? 'bg-sky-500/20 ring-1 ring-sky-400' : 'opacity-40'}`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-sky-400 text-[#103858] uppercase">
                          Sector B
                        </span>
                        <span className="text-[10px] font-mono text-sky-200">29,992 SQM</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1.5">Residential Plots Enclave</h4>
                      <p className="text-[10px] text-slate-300 mt-1">Planned freehold plots with 30ft & 40ft internal lanes</p>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-2">
                      {['P-101', 'P-102', 'P-103', 'P-104', 'P-105', 'P-106', 'P-107', 'P-108'].map((p) => (
                        <span key={p} className="p-1 rounded text-center text-[8px] font-mono bg-white/10 text-slate-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Farm Land & Eco Area (Right) */}
                  <div className={`col-span-4 p-4 rounded-xl border border-emerald-400/40 flex flex-col justify-between min-h-[160px] transition-all ${activeZone === 'farms' || activeZone === 'all' ? 'bg-emerald-500/20 ring-1 ring-emerald-400' : 'opacity-40'}`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-400 text-[#103858] uppercase">
                          Sector C
                        </span>
                        <span className="text-[10px] font-mono text-emerald-200">25,783 SQM</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1.5">Vrindavan Farm Plots</h4>
                      <p className="text-[10px] text-slate-300 mt-1">Expansive green land for nature retreats & agro-living</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300">Farms F-01 to F-18</span>
                  </div>
                </div>

                {/* Central Park & Community Band */}
                <div className={`p-3 rounded-xl border border-teal-400/40 flex items-center justify-between transition-all ${activeZone === 'park' || activeZone === 'all' ? 'bg-teal-500/20 ring-1 ring-teal-400' : 'opacity-40'}`}>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-teal-400 text-[#103858] uppercase">
                      Green Zone
                    </span>
                    <span className="text-xs font-bold text-teal-200">2,878 SQM Central Park, Jogging Track & Cultural Pavilion</span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-300">Dedicated Green Reserve</span>
                </div>

                {/* Footer Internal Roads */}
                <div className={`p-2.5 rounded-xl border border-slate-600/50 flex items-center justify-between text-[11px] text-slate-300 transition-all ${activeZone === 'roads' || activeZone === 'all' ? 'bg-slate-800/80' : 'opacity-40'}`}>
                  <span>INTERNAL 30-FT & 40-FT INTERCONNECTED NETWORK (20,548 SQM + 250.2 SQM ADDITIONAL)</span>
                  <span className="font-mono text-[#CCA02E]">100% BLACKTOP PLANNED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Watermark / Badge */}
        <div className="absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-mono text-slate-300">
          Source: Bansuri Dham Project Brochure Layout
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col p-4 sm:p-6 animate-fade-in">
          <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white">
                Bansuri Dham — Township Site Plan (79,452 sqm)
              </h3>
              <p className="text-xs text-slate-400">
                58 KM Milestone, Yamuna Expressway corridor
              </p>
            </div>
            <button
              onClick={() => setFullscreenOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {sitePlanUrl ? (
              <img
                src={sitePlanUrl}
                alt="Full Site Plan"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
            ) : (
              <div className="w-full max-w-4xl bg-[#0F2A42] p-8 rounded-3xl border border-white/20 shadow-2xl text-white space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#CCA02E] uppercase tracking-widest">
                      ARCHITECTURAL SITE BLUEPRINT
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">
                      Bansuri Dham Township Detailed Layout
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300 block">Total Site Area</span>
                    <span className="text-xl font-extrabold text-[#CCA02E]">79,452 sqm</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-sky-500/20 border border-sky-400/40">
                    <span className="text-xs font-bold text-sky-300 uppercase">Plot Area</span>
                    <p className="text-xl font-black text-white mt-1">29,992 sqm</p>
                    <p className="text-xs text-slate-300 mt-1">Residential & commercial plots with demarcated boundary lines.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40">
                    <span className="text-xs font-bold text-emerald-300 uppercase">Farm Land</span>
                    <p className="text-xl font-black text-white mt-1">25,783 sqm</p>
                    <p className="text-xs text-slate-300 mt-1">Farmland zones for peaceful retreat & sustainable living.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40">
                    <span className="text-xs font-bold text-amber-300 uppercase">Road Network</span>
                    <p className="text-xl font-black text-white mt-1">20,548 sqm</p>
                    <p className="text-xs text-slate-300 mt-1">+250.2 sqm additional road corridor with wide avenues.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-teal-300 uppercase">Central Park & Green Zone</span>
                    <p className="text-lg font-bold text-white mt-0.5">2,878 sqm dedicated park, walking pathways & open landscaped spaces.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-400 text-[#103858]">Green Enclave</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
