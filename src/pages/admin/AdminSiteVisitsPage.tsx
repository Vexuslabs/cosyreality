import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Phone,
  Car,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Trash2,
} from 'lucide-react';
import { SiteVisit, SiteVisitStatus } from '../../types';
import {
  getSiteVisits,
  updateSiteVisitStatus,
  deleteSiteVisit,
} from '../../services/siteVisitsService';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useDocumentTitle } from '../../utils/seo';

export const AdminSiteVisitsPage: React.FC = () => {
  useDocumentTitle('Site Visits Dispatch — Cosy Reality Admin');
  const { isSuperAdmin } = useAuth();
  const { addToast } = useToast();

  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<SiteVisit | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await getSiteVisits();
      setVisits(data);
    } catch (err) {
      console.warn('Error loading site visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleStatusChange = async (visit: SiteVisit, newStatus: SiteVisitStatus) => {
    try {
      await updateSiteVisitStatus(visit.id, newStatus);
      addToast('success', 'Status Updated', `Site visit is now marked as ${newStatus}.`);
      await loadVisits();
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Unable to update status.');
    }
  };

  const handleDelete = async () => {
    if (!visitToDelete) return;
    try {
      setDeleting(true);
      await deleteSiteVisit(visitToDelete.id);
      addToast('success', 'Deleted', 'Site visit booking removed.');
      setDeleteConfirmOpen(false);
      setVisitToDelete(null);
      await loadVisits();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err?.message || 'Unable to delete visit.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = visits.filter((v) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchPhone = v.phone.toLowerCase().includes(q);
      const matchProj = (v.projectName || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchProj) return false;
    }
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#103858]">Site Visit Schedule & Fleet</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch vehicles and assign project coordinators for property inspections
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search visitor name, phone or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#103858] cursor-pointer font-medium"
          >
            <option value="all">All Visits ({visits.length} Total)</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F3] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Visitor Name & Phone</th>
                <th className="py-3.5 px-4">Project & Pickup</th>
                <th className="py-3.5 px-4">Preferred Date & Time</th>
                <th className="py-3.5 px-4">Visit Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((v) => {
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-extrabold text-[#103858] text-sm block">
                          {v.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-slate-600 text-xs">
                          <a
                            href={`tel:${v.phone}`}
                            className="inline-flex items-center gap-1 hover:text-[#103858] font-medium"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{v.phone}</span>
                          </a>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-700">
                        <span className="font-semibold text-[#103858] block">
                          {v.projectName}
                        </span>
                        {v.pickupRequired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#103858] font-semibold mt-0.5 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Car className="w-3 h-3 text-[#CCA02E]" />
                            <span>Pickup: {v.pickupAddress || 'Requested'}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Direct on-site arrival</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-800">
                        <div className="flex items-center gap-1 font-bold text-xs">
                          <CalendarCheck className="w-3.5 h-3.5 text-[#CCA02E]" />
                          <span>{v.preferredDate}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                          Slot: {v.preferredTime} ({v.visitorsCount || 1} Person)
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={v.status}
                          onChange={(e) => handleStatusChange(v, e.target.value as SiteVisitStatus)}
                          className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border shadow-2xs focus:outline-none focus:ring-2 cursor-pointer ${
                            v.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : v.status === 'scheduled'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : v.status === 'rescheduled'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="rescheduled">Rescheduled</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-right">
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setVisitToDelete(v);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No site visits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Visit Record"
        message="Are you sure you want to remove this site visit booking?"
      />
    </div>
  );
};
