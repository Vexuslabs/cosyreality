import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { Lead, LeadStage } from '../../types';
import {
  getLeads,
  createLead,
  updateLead,
  updateLeadStage,
  deleteLead,
} from '../../services/leadsService';
import { formatDateTime, getLeadStageBadge } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useDocumentTitle } from '../../utils/seo';

export const AdminLeadsPage: React.FC = () => {
  useDocumentTitle('CRM & Leads Management — Cosy Reality Admin');
  const { userProfile, isSuperAdmin, isSalesAdmin } = useAuth();
  const { addToast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  // Edit / Details Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectName: '',
    budget: '',
    source: 'admin_created',
    stage: 'new' as LeadStage,
    notes: '',
    assignedToName: '',
  });

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      console.warn('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const openCreateModal = () => {
    setSelectedLead(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      projectName: '',
      budget: '',
      source: 'manual_walkin',
      stage: 'new',
      notes: '',
      assignedToName: userProfile?.name || 'Sales Desk',
    });
    setModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      projectName: lead.projectName || '',
      budget: lead.budget || '',
      source: lead.source || 'website_inquiry',
      stage: lead.stage,
      notes: lead.notes || '',
      assignedToName: lead.assignedToName || '',
    });
    setModalOpen(true);
  };

  const handleStageChange = async (lead: Lead, newStage: LeadStage) => {
    try {
      await updateLeadStage(lead.id, newStage);
      addToast('success', 'Lead Updated', `Stage changed to ${getLeadStageBadge(newStage).label}`);
      await loadLeads();
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Unable to update lead stage.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      addToast('error', 'Missing Information', 'Name and Phone number are required.');
      return;
    }

    try {
      setSaving(true);
      if (selectedLead) {
        await updateLead(selectedLead.id, formData);
        addToast('success', 'Lead Updated', 'Customer lead details saved.');
      } else {
        await createLead(formData);
        addToast('success', 'Lead Added', 'New lead registered in CRM.');
      }
      setModalOpen(false);
      await loadLeads();
    } catch (err: any) {
      addToast('error', 'Save Failed', err?.message || 'Unable to save lead.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;
    try {
      setDeleting(true);
      await deleteLead(leadToDelete.id);
      addToast('success', 'Lead Removed', 'Lead record has been deleted.');
      setDeleteConfirmOpen(false);
      setLeadToDelete(null);
      await loadLeads();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err?.message || 'Unable to delete lead.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = leads.filter((lead) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = lead.name.toLowerCase();
      const phone = lead.phone.toLowerCase();
      const proj = (lead.projectName || '').toLowerCase();
      if (!name.includes(q) && !phone.includes(q) && !proj.includes(q)) return false;
    }
    if (stageFilter !== 'all' && lead.stage !== stageFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#103858]">Customer Relationship Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track inquiries, site visit follow-ups, and booking pipeline conversions
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4 text-[#103858]" />}
          className="font-bold shadow-sm"
        >
          Add Walk-in / Inbound Lead
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search lead by name, phone or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white"
          />
        </div>

        <div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#103858] cursor-pointer font-medium"
          >
            <option value="all">All Stages ({leads.length} Total Leads)</option>
            <option value="new">New Inquiries</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="site_visit_scheduled">Site Visit Scheduled</option>
            <option value="negotiation">Negotiation / Token Discussion</option>
            <option value="booking_done">Booking Done / Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F3] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Customer Details</th>
                <th className="py-3.5 px-4">Project & Budget</th>
                <th className="py-3.5 px-4">Pipeline Stage</th>
                <th className="py-3.5 px-4">Source / Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((lead) => {
                  const badge = getLeadStageBadge(lead.stage);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-extrabold text-[#103858] text-sm block">
                          {lead.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-slate-600 text-xs">
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 hover:text-[#103858] font-medium"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lead.phone}</span>
                          </a>
                          {lead.email && (
                            <span className="text-slate-400 hidden sm:inline">• {lead.email}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-700">
                        <span className="font-semibold text-[#103858] block">
                          {lead.projectName || 'General Enquiry'}
                        </span>
                        <span className="text-[11px] text-slate-500">{lead.budget || '—'}</span>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={lead.stage}
                          onChange={(e) => handleStageChange(lead, e.target.value as LeadStage)}
                          className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border shadow-2xs focus:outline-none focus:ring-2 cursor-pointer ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="interested">Interested</option>
                          <option value="site_visit_scheduled">Site Visit Scheduled</option>
                          <option value="negotiation">Negotiation</option>
                          <option value="booking_done">Booking Done</option>
                          <option value="closed_lost">Closed Lost</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-slate-500 text-xs">
                        <span className="block font-medium capitalize">
                          {lead.source?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(lead.createdAt)}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(lead)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                            title="Edit lead"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setLeadToDelete(lead);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                              title="Delete lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No leads match criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        title={selectedLead ? `Edit Lead: ${selectedLead.name}` : 'Create CRM Lead'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Customer Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Phone Number"
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Interested Project / Locality"
              placeholder="e.g. Cosy Green Meadows"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Budget Range"
              placeholder="e.g. ₹50 Lakh - ₹1 Crore"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
                Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as LeadStage })}
                className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="site_visit_scheduled">Site Visit Scheduled</option>
                <option value="negotiation">Negotiation</option>
                <option value="booking_done">Booking Done</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>

            <Input
              label="Assigned Executive"
              placeholder="e.g. Rohit Sharma"
              value={formData.assignedToName}
              onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })}
            />
          </div>

          <Textarea
            label="Call Notes & Client Requirements"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={saving} className="font-bold">
              {selectedLead ? 'Save Updates' : 'Add Lead'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Customer Lead"
        message={`Are you sure you want to permanently delete lead "${leadToDelete?.name}"?`}
      />
    </div>
  );
};
