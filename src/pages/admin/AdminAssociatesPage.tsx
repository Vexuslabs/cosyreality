import React, { useState, useEffect } from 'react';
import {
  Handshake,
  Search,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { Associate, AssociateStatus } from '../../types';
import {
  getAssociates,
  updateAssociateStatus,
  deleteAssociate,
} from '../../services/associatesService';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useDocumentTitle } from '../../utils/seo';

export const AdminAssociatesPage: React.FC = () => {
  useDocumentTitle('Channel Partners & Associates — Cosy Reality Admin');
  const { isSuperAdmin } = useAuth();
  const { addToast } = useToast();

  const [associates, setAssociates] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [associateToDelete, setAssociateToDelete] = useState<Associate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAssociates = async () => {
    try {
      setLoading(true);
      const data = await getAssociates();
      setAssociates(data);
    } catch (err) {
      console.warn('Error loading associates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssociates();
  }, []);

  const handleStatusChange = async (assoc: Associate, newStatus: AssociateStatus) => {
    try {
      await updateAssociateStatus(assoc.id, newStatus);
      addToast('success', 'Status Updated', `${assoc.name} is now ${newStatus}.`);
      await loadAssociates();
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Unable to update status.');
    }
  };

  const handleDelete = async () => {
    if (!associateToDelete) return;
    try {
      setDeleting(true);
      await deleteAssociate(associateToDelete.id);
      addToast('success', 'Deleted', 'Associate application removed.');
      setDeleteConfirmOpen(false);
      setAssociateToDelete(null);
      await loadAssociates();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err?.message || 'Unable to delete associate.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = associates.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.name.toLowerCase().includes(q);
      const matchCompany = (a.companyName || '').toLowerCase().includes(q);
      const matchPhone = a.phone.toLowerCase().includes(q);
      if (!matchName && !matchCompany && !matchPhone) return false;
    }
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#103858]">Associate & Channel Partner Network</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and approve broker registrations, RERA affiliations, and agency onboarding
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search partner by name, agency, or phone..."
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
            <option value="all">All Applications ({associates.length} Total)</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved Partners</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F3] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Partner & Agency</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Experience & RERA</th>
                <th className="py-3.5 px-4">Approval Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((a) => {
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-extrabold text-[#103858] text-sm block">
                          {a.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {a.companyName || 'Independent Consultant'} • {a.city || 'Delhi NCR'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-700">
                        <a
                          href={`tel:${a.phone}`}
                          className="inline-flex items-center gap-1 text-slate-700 hover:text-[#103858] font-semibold block"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{a.phone}</span>
                        </a>
                        {a.email && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">{a.email}</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-800">
                        <span className="font-semibold block">{a.experienceYears || 0} Years Exp.</span>
                        {a.reraNumber ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            RERA: {a.reraNumber}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Non-RERA / Individual</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={a.status}
                          onChange={(e) => handleStatusChange(a, e.target.value as AssociateStatus)}
                          className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border shadow-2xs focus:outline-none focus:ring-2 cursor-pointer ${
                            a.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : a.status === 'pending'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-right">
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setAssociateToDelete(a);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            title="Delete applicant"
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
                    No partner applications found.
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
        title="Delete Partner Application"
        message="Are you sure you want to remove this associate record?"
      />
    </div>
  );
};
