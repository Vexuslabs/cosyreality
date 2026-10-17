import React from 'react';
import {
  Maximize2,
  Compass,
  Navigation,
  Layers,
  IndianRupee,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  Info,
  Building2,
  Tag,
} from 'lucide-react';
import { InventoryItem } from '../../types';
import { formatINR, formatINRShort } from '../../utils/formatters';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { useSettings } from '../../context/SettingsContext';

interface InventoryModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEnquire: (item: InventoryItem, customMessage?: string) => void;
  onSiteVisit: (item: InventoryItem) => void;
  onFilterSimilar?: (propertyType?: string, projectId?: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  item,
  isOpen,
  onClose,
  onEnquire,
  onSiteVisit,
  onFilterSimilar,
}) => {
  const { settings } = useSettings();

  if (!item) return null;

  const handleWhatsApp = () => {
    if (!settings.whatsapp) return;
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const plotText = item.unitNumber || item.plotNumber || 'Unit';
    const message = encodeURIComponent(
      `Hi Cosy Reality, I am interested in Plot/Unit [${plotText}] at [${item.projectName}]. Please share current availability and details.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#103858] text-[#CCA02E] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#CCA02E] uppercase tracking-wider block">
              {item.projectName}
            </span>
            <h3 className="text-xl font-black text-[#103858]">
              {item.unitNumber || item.plotNumber || 'Property Details'}
            </h3>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F3] border border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Inventory Status:
            </span>
            <StatusBadge status={item.status} size="md" />
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Final Price
            </span>
            <span className="text-xl font-black text-[#103858]">
              {formatINR(item.finalPrice)}
            </span>
          </div>
        </div>

        {/* Core Specifications Table */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Property Type */}
          {item.propertyType && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Property Type</span>
              <span className="text-sm font-bold text-[#103858]">{item.propertyType}</span>
            </div>
          )}

          {/* Size */}
          {item.size ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Area</span>
              <span className="text-sm font-bold text-[#103858]">
                {item.size} {item.sizeUnit || 'Sq. Ft.'}
              </span>
            </div>
          ) : null}

          {/* Dimensions */}
          {(item.length || item.width) && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Dimensions</span>
              <span className="text-sm font-bold text-[#103858]">
                {item.length || '—'} × {item.width || '—'} Ft.
              </span>
            </div>
          )}

          {/* Facing */}
          {item.facing && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Orientation</span>
              <span className="text-sm font-bold text-[#103858]">{item.facing} Facing</span>
            </div>
          )}

          {/* Road Width */}
          {item.roadWidth && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Road Frontage</span>
              <span className="text-sm font-bold text-[#103858]">{item.roadWidth}</span>
            </div>
          )}

          {/* Corner Plot */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Corner Plot</span>
            <span className="text-sm font-bold text-[#103858]">
              {item.cornerPlot ? 'Yes (Corner)' : 'No (Standard)'}
            </span>
          </div>

          {/* Block / Sector / Phase */}
          {item.block && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Block</span>
              <span className="text-sm font-bold text-[#103858]">{item.block}</span>
            </div>
          )}
          {item.sector && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Sector</span>
              <span className="text-sm font-bold text-[#103858]">{item.sector}</span>
            </div>
          )}
          {item.phase && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Phase</span>
              <span className="text-sm font-bold text-[#103858]">{item.phase}</span>
            </div>
          )}
        </div>

        {/* Pricing Breakdown (Base Rate, Booking Amount, PLC) */}
        <div className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
          <h4 className="font-bold text-sm text-[#103858] mb-2 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-[#CCA02E]" />
            <span>Pricing Breakdown</span>
          </h4>

          {item.baseRate && item.baseRate > 0 ? (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Base Rate</span>
              <span className="font-semibold text-slate-900">
                {formatINR(item.baseRate)} / {item.sizeUnit || 'Sq. Ft.'}
              </span>
            </div>
          ) : null}

          {item.plc && item.plc > 0 ? (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">PLC (Preferential Location Charge)</span>
              <span className="font-semibold text-slate-900">{formatINR(item.plc)}</span>
            </div>
          ) : null}

          {item.bookingAmount && item.bookingAmount > 0 ? (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Booking Amount</span>
              <span className="font-bold text-emerald-700">{formatINR(item.bookingAmount)}</span>
            </div>
          ) : null}

          {typeof item.finalPrice === 'number' && item.finalPrice > 0 && (
            <div className="flex justify-between pt-2 text-sm font-black text-[#103858]">
              <span>Total Price</span>
              <span>{formatINR(item.finalPrice)}</span>
            </div>
          )}
        </div>

        {/* Public Notes */}
        {item.publicNotes && (
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>{item.publicNotes}</p>
          </div>
        )}

        {/* Dynamic Action Buttons based on Status */}
        <div className="pt-3 border-t border-slate-200">
          {item.status === 'booking' && (
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <Button
                variant="gold"
                size="md"
                className="w-full sm:flex-1"
                onClick={() => {
                  onClose();
                  onEnquire(item);
                }}
              >
                Enquire About This Property
              </Button>
              <Button
                variant="primary"
                size="md"
                className="w-full sm:flex-1"
                onClick={() => {
                  onClose();
                  onSiteVisit(item);
                }}
              >
                Schedule Site Visit
              </Button>
              {settings.whatsapp && (
                <Button
                  variant="success"
                  size="md"
                  onClick={handleWhatsApp}
                  className="w-full sm:w-auto"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {item.status === 'waiting' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>This property is currently on hold under token verification. You can join the waiting priority list.</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <Button
                  variant="gold"
                  size="md"
                  className="w-full sm:flex-1"
                  onClick={() => {
                    onClose();
                    onEnquire(item, `I want to join the waiting list for Plot/Unit ${item.unitNumber || item.plotNumber} at ${item.projectName}.`);
                  }}
                >
                  Join Waiting List
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full sm:flex-1"
                  onClick={() => {
                    onClose();
                    onEnquire(item);
                  }}
                >
                  General Enquiry
                </Button>
              </div>
            </div>
          )}

          {item.status === 'sold' && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>This Property Has Been Sold.</span>
              </div>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => {
                  onClose();
                  if (onFilterSimilar) {
                    onFilterSimilar(item.propertyType, item.projectId);
                  }
                }}
              >
                Show Similar Available Properties
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
