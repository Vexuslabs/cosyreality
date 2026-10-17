import React from 'react';
import {
  Calendar,
  Database,
  RefreshCw,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { UserProfile } from '../../../types';

export type TimeframeOption = 'today' | '7days' | '30days' | 'this_month' | 'all';

interface DashboardHeaderProps {
  userProfile?: UserProfile | null;
  isSuperAdmin?: boolean;
  timeframe: TimeframeOption;
  setTimeframe?: (tf: TimeframeOption) => void;
  onTimeframeChange?: (tf: TimeframeOption) => void;
  loading?: boolean;
  seeding?: boolean;
  onRefresh?: () => void;
  onSeedData?: () => void;
  lastUpdated?: Date | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userProfile,
  isSuperAdmin = false,
  timeframe = 'all',
  setTimeframe,
  onTimeframeChange,
  loading = false,
  seeding = false,
  onRefresh,
  onSeedData,
  lastUpdated,
}) => {
  const handleTimeframeChange = (tf: TimeframeOption) => {
    if (setTimeframe) setTimeframe(tf);
    if (onTimeframeChange) onTimeframeChange(tf);
  };
  const timeframeLabels: Record<TimeframeOption, string> = {
    today: 'Today',
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    this_month: 'This Month',
    all: 'All Time',
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Greeting & Status */}
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-[11px] font-extrabold text-[#103858] uppercase tracking-wider">
              Executive Real Estate Management System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#103858] tracking-tight mt-1">
            Operations & Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>
              Signed in as <strong className="text-[#103858]">{userProfile?.name || 'Administrator'}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[#CCA02E] font-semibold capitalize">
              {userProfile?.role ? userProfile.role.replace('_', ' ') : 'Manager'}
            </span>
            {lastUpdated && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600">
            {(['today', '7days', '30days', 'this_month', 'all'] as TimeframeOption[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeframe === tf
                    ? 'bg-white text-[#103858] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-[#103858]'
                }`}
              >
                {timeframeLabels[tf]}
              </button>
            ))}
          </div>

          {/* Super Admin Seed Data Button */}
          {isSuperAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSeedData}
              loading={seeding}
              leftIcon={<Database className="w-3.5 h-3.5 text-[#CCA02E]" />}
              title="Populate test projects and live units"
            >
              Seed Demo
            </Button>
          )}

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};
