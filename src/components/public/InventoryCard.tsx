import React from 'react';
import { Compass, Maximize2, Navigation, IndianRupee, Layers } from 'lucide-react';
import { InventoryItem } from '../../types';
import { formatINR, formatINRShort } from '../../utils/formatters';
import { StatusBadge } from '../ui/StatusBadge';

interface InventoryCardProps {
  item: InventoryItem;
  onSelect: (item: InventoryItem) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-200 cursor-pointer p-5 flex flex-col justify-between space-y-4"
    >
      {/* Top Header: Plot / Unit Number & Status Badge */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div>
          <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider block truncate">
            {item.projectName}
          </span>
          <h4 className="text-base sm:text-lg font-black text-[#103858] group-hover:text-[#CCA02E] transition-colors mt-0.5">
            {item.unitNumber || item.plotNumber || 'Unit'}
          </h4>
        </div>

        {/* Live Status Badge with Green/Yellow/Red system */}
        <StatusBadge status={item.status} size="sm" />
      </div>

      {/* Property Details Grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
        {/* Size */}
        {item.size ? (
          <div className="flex items-center gap-1.5 text-slate-700">
            <Maximize2 className="w-3.5 h-3.5 text-[#103858] shrink-0" />
            <span>
              <strong>{item.size}</strong> {item.sizeUnit || 'Sq. Ft.'}
            </span>
          </div>
        ) : null}

        {/* Facing */}
        {item.facing ? (
          <div className="flex items-center gap-1.5 text-slate-700">
            <Compass className="w-3.5 h-3.5 text-[#103858] shrink-0" />
            <span>{item.facing} Facing</span>
          </div>
        ) : null}

        {/* Block / Sector */}
        {(item.block || item.sector) && (
          <div className="flex items-center gap-1.5 text-slate-700 truncate">
            <Layers className="w-3.5 h-3.5 text-[#103858] shrink-0" />
            <span className="truncate">{[item.block, item.sector].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {/* Road Width */}
        {item.roadWidth ? (
          <div className="flex items-center gap-1.5 text-slate-700">
            <Navigation className="w-3.5 h-3.5 text-[#103858] shrink-0" />
            <span>{item.roadWidth} Road</span>
          </div>
        ) : null}

        {/* Corner Plot Flag */}
        {item.cornerPlot && (
          <div className="col-span-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Corner Property
            </span>
          </div>
        )}
      </div>

      {/* Price & Details Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Price
          </span>
          <span className="text-base font-extrabold text-[#103858]">
            {formatINR(item.finalPrice)}
          </span>
        </div>

        <button
          type="button"
          className="text-xs font-bold text-[#103858] bg-[#FAF8F3] hover:bg-[#103858] hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
