import React, { useState } from 'react';
import {
  MapPin,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  ExternalLink,
  Compass,
  X,
} from 'lucide-react';
import { Button } from '../../ui/Button';

interface BansuriRouteMapProps {
  routeMapUrl?: string;
  googleMapsUrl?: string;
}

export const BansuriRouteMap: React.FC<BansuriRouteMapProps> = ({
  routeMapUrl,
  googleMapsUrl,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => setZoomLevel(1);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider">
            Corridor Access & Geographic Positioning
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#103858] mt-0.5">
            Route Map & Connectivity Corridor
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Regional access schematic along the 58 KM Milestone on Yamuna Expressway.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Navigation className="w-3.5 h-3.5 text-[#103858]" />}
                rightIcon={<ExternalLink className="w-3 h-3" />}
              >
                Open in Google Maps
              </Button>
            </a>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            leftIcon={<Maximize2 className="w-4 h-4 text-[#103858]" />}
          >
            Fullscreen Map
          </Button>
        </div>
      </div>

      {/* Stage Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#0B2135] min-h-[360px] sm:min-h-[440px] flex items-center justify-center p-4">
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
            onClick={handleReset}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#103858] hover:bg-[#103858]/10 transition-colors"
            title="Fullscreen Modal"
            aria-label="Fullscreen Modal"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Milestone Indicator */}
        <div className="absolute top-4 left-4 z-20 bg-[#CCA02E] text-[#103858] px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2 text-xs font-black">
          <MapPin className="w-4 h-4" />
          <span>58 KM MILESTONE — YAMUNA EXPRESSWAY</span>
        </div>

        {/* Map Stage */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-200 overflow-auto"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {routeMapUrl ? (
            <img
              src={routeMapUrl}
              alt="Bansuri Dham Route Map"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[460px] object-contain rounded-xl"
            />
          ) : (
            /* High-clarity regional corridor vector graphic */
            <div className="w-full max-w-2xl bg-[#0F2A42] p-6 rounded-2xl border border-white/10 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-black tracking-widest text-[#CCA02E] uppercase">
                  REGIONAL CONNECTIVITY CORRIDOR SCHEMATIC
                </span>
                <span className="text-[10px] text-slate-300">YAMUNA EXPRESSWAY AXIS</span>
              </div>

              {/* Highway Axis */}
              <div className="relative py-6 px-4 bg-slate-900/60 rounded-xl border border-white/10">
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-3 bg-[#CCA02E]/80 rounded-full flex items-center justify-between px-2">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span className="w-2 h-2 rounded-full bg-white" />
                </div>

                <div className="grid grid-cols-4 gap-2 relative z-10 text-center">
                  <div className="bg-[#103858] p-2.5 rounded-xl border border-white/20 shadow-md">
                    <span className="text-[9px] text-slate-300 uppercase block">Origin</span>
                    <span className="text-xs font-black text-white">Greater Noida / Pari Chowk</span>
                  </div>
                  <div className="bg-[#103858] p-2.5 rounded-xl border border-white/20 shadow-md">
                    <span className="text-[9px] text-sky-300 uppercase block">Infrastructure Hub</span>
                    <span className="text-xs font-black text-sky-200">Jewar Airport / Film City</span>
                  </div>
                  <div className="bg-[#CCA02E] p-2.5 rounded-xl text-[#103858] shadow-lg ring-2 ring-white">
                    <span className="text-[9px] font-black uppercase block">PROJECT SITE</span>
                    <span className="text-xs font-black">BANSURI DHAM (58 KM)</span>
                  </div>
                  <div className="bg-[#103858] p-2.5 rounded-xl border border-white/20 shadow-md">
                    <span className="text-[9px] text-emerald-300 uppercase block">Destination</span>
                    <span className="text-xs font-black text-emerald-200">Mathura / Vrindavan / Agra</span>
                  </div>
                </div>
              </div>

              {/* Connecting State Highways */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-[#CCA02E] font-bold uppercase block">Secondary Arterial Link</span>
                  <p className="font-semibold text-slate-200 mt-0.5">Bajna - Chandaus Highway</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Direct east-west cross connectivity corridor</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-[#CCA02E] font-bold uppercase block">Regional Highway Link</span>
                  <p className="font-semibold text-slate-200 mt-0.5">Aligarh - Palwal State Highway</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Seamless transit connecting Haryana & UP belts</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-mono text-slate-300">
          Source: Official Yamuna Expressway Regional Route Plan
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col p-4 sm:p-6 animate-fade-in">
          <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white">
                Bansuri Dham — Route Map & Regional Connectivity
              </h3>
              <p className="text-xs text-slate-400">
                58 KM Milestone, Yamuna Expressway
              </p>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {routeMapUrl ? (
              <img
                src={routeMapUrl}
                alt="Full Route Map"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
            ) : (
              <div className="w-full max-w-4xl bg-[#0F2A42] p-8 rounded-3xl border border-white/20 shadow-2xl text-white space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#CCA02E] uppercase tracking-widest">
                      REGIONAL TRANSIT & ROUTE MAP
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">
                      58 KM Yamuna Expressway Corridor
                    </h2>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#CCA02E] text-[#103858]">
                    Prime Access Point
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs font-bold text-sky-300 uppercase">North Gateway</span>
                    <p className="text-lg font-bold text-white mt-1">Noida & Greater Noida</p>
                    <p className="text-xs text-slate-400 mt-1">Pari Chowk, Knowledge Parks & Eastern Peripheral Expressway.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs font-bold text-amber-300 uppercase">Central Milestone</span>
                    <p className="text-lg font-bold text-white mt-1">Bansuri Dham (58 KM)</p>
                    <p className="text-xs text-slate-400 mt-1">Directly positioned near Jewar Airport & upcoming Film City.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs font-bold text-emerald-300 uppercase">South Cultural Hub</span>
                    <p className="text-lg font-bold text-white mt-1">Mathura & Vrindavan</p>
                    <p className="text-xs text-slate-400 mt-1">Seamless highway drive to Braj spiritual destinations & Agra.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
