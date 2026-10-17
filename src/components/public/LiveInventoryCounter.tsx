import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, ArrowRight, Layers } from 'lucide-react';
import { getInventoryStats } from '../../services/inventoryService';

export const LiveInventoryCounter: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    booking: 0,
    waiting: 0,
    sold: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getInventoryStats();
        setStats(data);
      } catch (err) {
        console.warn('Failed to load inventory stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-2xl border-l-4 border-[#CCA02E] border-y border-r border-[#103858]/10 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#103858]/10">
          <div>
            <span className="text-[#103858] font-bold text-sm tracking-wider uppercase">
              Live Inventory Summary
            </span>
            <p className="text-xs text-[#172B3A]/70 mt-0.5">
              Live units and plots availability updated in real-time across all active projects
            </p>
          </div>

          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#103858] hover:text-[#CCA02E] uppercase tracking-wider transition-colors"
          >
            <span>View All Inventory</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#CCA02E]" />
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Units */}
          <div className="bg-[#103858]/5 p-4 rounded text-center border border-[#103858]/10">
            <div className="text-[#103858] font-bold text-2xl">
              {loading ? '...' : stats.total}
            </div>
            <div className="text-[10px] text-[#103858] font-semibold uppercase tracking-wider mt-1">
              Total Listed
            </div>
          </div>

          {/* Booking Open (Green) */}
          <div className="bg-[#16A34A]/10 p-4 rounded text-center border border-[#16A34A]/20">
            <div className="text-[#16A34A] font-bold text-2xl">
              {loading ? '...' : stats.booking}
            </div>
            <div className="text-[10px] text-[#16A34A] font-semibold uppercase tracking-wider mt-1">
              Booking Open
            </div>
          </div>

          {/* Waiting / Hold (Yellow) */}
          <div className="bg-[#EAB308]/10 p-4 rounded text-center border border-[#EAB308]/20">
            <div className="text-[#EAB308] font-bold text-2xl">
              {loading ? '...' : stats.waiting}
            </div>
            <div className="text-[10px] text-[#EAB308] font-semibold uppercase tracking-wider mt-1">
              Waiting / Hold
            </div>
          </div>

          {/* Sold (Red) */}
          <div className="bg-[#DC2626]/10 p-4 rounded text-center border border-[#DC2626]/20">
            <div className="text-[#DC2626] font-bold text-2xl">
              {loading ? '...' : stats.sold}
            </div>
            <div className="text-[10px] text-[#DC2626] font-semibold uppercase tracking-wider mt-1">
              Sold
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
