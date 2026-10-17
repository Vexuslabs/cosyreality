import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Project, InventoryItem } from '../../../types';
import { ArrowRight, Layers, PieChart as PieIcon, BarChart3, Info } from 'lucide-react';

interface DashboardInventoryChartsProps {
  projects?: Project[];
  inventory?: InventoryItem[];
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  booking: '#16A34A', // Emerald 600
  waiting: '#EAB308', // Amber 500
  sold: '#DC2626', // Red 600
};

export const DashboardInventoryCharts: React.FC<DashboardInventoryChartsProps> = ({
  projects = [],
  inventory = [],
}) => {
  const navigate = useNavigate();
  const safeProjects = projects ?? [];
  const safeInventory = inventory ?? [];

  // 1. Calculate Donut Data
  const totalInventory = safeInventory.length;
  const bookingCount = safeInventory.filter((i) => i && i.status === 'booking').length;
  const waitingCount = safeInventory.filter((i) => i && i.status === 'waiting').length;
  const soldCount = safeInventory.filter((i) => i && i.status === 'sold').length;

  const donutData = [
    {
      name: 'Booking Open',
      statusKey: 'booking',
      value: bookingCount,
      color: STATUS_COLORS.booking,
      percent: totalInventory > 0 ? Math.round((bookingCount / totalInventory) * 100) : 0,
    },
    {
      name: 'Waiting / Hold',
      statusKey: 'waiting',
      value: waitingCount,
      color: STATUS_COLORS.waiting,
      percent: totalInventory > 0 ? Math.round((waitingCount / totalInventory) * 100) : 0,
    },
    {
      name: 'Sold',
      statusKey: 'sold',
      value: soldCount,
      color: STATUS_COLORS.sold,
      percent: totalInventory > 0 ? Math.round((soldCount / totalInventory) * 100) : 0,
    },
  ].filter((d) => totalInventory === 0 || d.value > 0);

  // 2. Calculate Project-wise Bar Chart Data
  const projectBarData = safeProjects
    .map((p) => {
      const pUnits = safeInventory.filter((i) => i && i.projectId === p.id);
      const b = pUnits.filter((i) => i && i.status === 'booking').length;
      const w = pUnits.filter((i) => i && i.status === 'waiting').length;
      const s = pUnits.filter((i) => i && i.status === 'sold').length;
      return {
        id: p.id,
        name: p.projectName && p.projectName.length > 16 ? p.projectName.substring(0, 14) + '...' : (p.projectName || 'Project'),
        fullName: p.projectName || 'Project',
        booking: b,
        waiting: w,
        sold: s,
        total: pUnits.length,
      };
    })
    .filter((d) => d.total > 0 || safeProjects.length <= 4)
    .slice(0, 8); // Top 8 projects for clean spacing

  // Find max available project
  const maxAvailableProject = [...projectBarData].sort((a, b) => b.booking - a.booking)[0];

  const handleDonutClick = (data: any) => {
    if (data && data.statusKey) {
      navigate(`/admin/inventory?status=${data.statusKey}`);
    }
  };

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedProject = data.activePayload[0].payload;
      if (clickedProject?.id) {
        navigate(`/admin/inventory?projectId=${clickedProject.id}`);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 1. Inventory Status Donut Chart */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-[#103858]">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                  Inventory Status Donut
                </h3>
                <p className="text-xs text-slate-500">Live allocation across all developments</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] flex items-center gap-1 transition-colors"
            >
              <span>Units</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {totalInventory > 0 ? (
            <div className="relative h-64 mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    onClick={handleDonutClick}
                    cursor="pointer"
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#103858] text-white text-xs px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-700">
                            <div className="font-bold">{d.name}</div>
                            <div className="text-slate-300 mt-0.5">
                              Units: <strong className="text-white">{d.value}</strong> ({d.percent}%)
                            </div>
                            <div className="text-[10px] text-[#CCA02E] mt-1">Click to filter list</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl sm:text-3xl font-black text-[#103858]">
                  {totalInventory}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Total Units
                </span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Layers className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No inventory units added yet.</p>
              <button
                onClick={() => navigate('/admin/inventory')}
                className="text-xs font-bold text-[#103858] mt-2 underline"
              >
                + Add First Unit
              </button>
            </div>
          )}
        </div>

        {/* Legend / Status Badges */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate('/admin/inventory?status=booking')}
            className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 hover:border-emerald-300 transition-all text-left"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Booking</span>
            </div>
            <div className="text-base font-black text-[#16A34A] mt-0.5">{bookingCount}</div>
            <div className="text-[10px] text-emerald-700">
              {totalInventory > 0 ? Math.round((bookingCount / totalInventory) * 100) : 0}%
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/inventory?status=waiting')}
            className="p-2 rounded-xl bg-amber-50/70 border border-amber-100 hover:border-amber-300 transition-all text-left"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
              <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
              <span>Waiting</span>
            </div>
            <div className="text-base font-black text-[#EAB308] mt-0.5">{waitingCount}</div>
            <div className="text-[10px] text-amber-700">
              {totalInventory > 0 ? Math.round((waitingCount / totalInventory) * 100) : 0}%
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/inventory?status=sold')}
            className="p-2 rounded-xl bg-rose-50/70 border border-rose-100 hover:border-rose-300 transition-all text-left"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-800">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <span>Sold</span>
            </div>
            <div className="text-base font-black text-[#DC2626] mt-0.5">{soldCount}</div>
            <div className="text-[10px] text-rose-700">
              {totalInventory > 0 ? Math.round((soldCount / totalInventory) * 100) : 0}%
            </div>
          </button>
        </div>
      </div>

      {/* 2. Project-wise Inventory Stacked Bar Chart */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-[#103858]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#103858]">
                  Project-wise Inventory Distribution
                </h3>
                <p className="text-xs text-slate-500">Live booking availability per development</p>
              </div>
            </div>

            {maxAvailableProject && maxAvailableProject.booking > 0 && (
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                Highest Available: <strong>{maxAvailableProject.fullName}</strong> ({maxAvailableProject.booking})
              </span>
            )}
          </div>

          {projectBarData.length > 0 ? (
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectBarData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
                  onClick={handleBarClick}
                  cursor="pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#103858] text-white text-xs px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-700">
                            <div className="font-bold text-sm mb-1">{data.fullName}</div>
                            <div className="space-y-0.5">
                              <div className="text-emerald-400 flex items-center justify-between gap-4">
                                <span>Booking Open:</span>
                                <strong>{data.booking}</strong>
                              </div>
                              <div className="text-amber-400 flex items-center justify-between gap-4">
                                <span>Waiting / Hold:</span>
                                <strong>{data.waiting}</strong>
                              </div>
                              <div className="text-rose-400 flex items-center justify-between gap-4">
                                <span>Sold Units:</span>
                                <strong>{data.sold}</strong>
                              </div>
                              <div className="text-slate-300 pt-1 border-t border-slate-600 flex items-center justify-between gap-4 font-bold">
                                <span>Total Units:</span>
                                <span>{data.total}</span>
                              </div>
                            </div>
                            <div className="text-[10px] text-[#CCA02E] mt-2">Click bar to view project units</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                  />
                  <Bar
                    dataKey="booking"
                    name="Booking Open"
                    stackId="a"
                    fill={STATUS_COLORS.booking}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="waiting"
                    name="Waiting / Hold"
                    stackId="a"
                    fill={STATUS_COLORS.waiting}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="sold"
                    name="Sold"
                    stackId="a"
                    fill={STATUS_COLORS.sold}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <BarChart3 className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No project inventory mapped yet.</p>
              <button
                onClick={() => navigate('/admin/projects')}
                className="text-xs font-bold text-[#103858] mt-2 underline"
              >
                + Manage Projects
              </button>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600 mt-2">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Info className="w-3.5 h-3.5 text-[#103858] shrink-0" />
            Click any bar to filter live inventory for that specific project.
          </span>
          <button
            onClick={() => navigate('/admin/inventory')}
            className="text-[11px] font-bold text-[#103858] hover:text-[#CCA02E] shrink-0 ml-2"
          >
            All Inventory →
          </button>
        </div>
      </div>
    </div>
  );
};
