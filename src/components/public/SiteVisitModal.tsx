import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { CalendarCheck, MapPin, User, Phone, Mail, Clock, Users as UsersIcon } from 'lucide-react';
import { Project, InventoryItem } from '../../types';
import { getProjects } from '../../services/projectsService';
import { createSiteVisit } from '../../services/siteVisitsService';
import { createLead } from '../../services/leadsService';
import { useToast } from '../../context/ToastContext';

interface SiteVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: Project | null;
  initialItem?: InventoryItem | null;
}

export const SiteVisitModal: React.FC<SiteVisitModalProps> = ({
  isOpen,
  onClose,
  initialProject,
  initialItem,
}) => {
  const { addToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    projectId: initialProject?.id || initialItem?.projectId || '',
    projectName: initialProject?.projectName || initialItem?.projectName || '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: 'Morning (10:00 AM - 01:00 PM)',
    visitorsCount: 2,
    message: initialItem
      ? `Interested in visiting Plot/Unit: ${initialItem.unitNumber || initialItem.plotNumber}`
      : '',
  });

  useEffect(() => {
    if (isOpen) {
      async function loadAllProjects() {
        setLoadingProjects(true);
        try {
          const list = await getProjects();
          setProjects(list);
          if (!formData.projectId && list.length > 0) {
            setFormData((prev) => ({
              ...prev,
              projectId: initialProject?.id || initialItem?.projectId || list[0].id,
              projectName: initialProject?.projectName || initialItem?.projectName || list[0].projectName,
            }));
          }
        } catch (err) {
          console.warn('Failed to load projects list:', err);
        } finally {
          setLoadingProjects(false);
        }
      }
      loadAllProjects();
    }
  }, [isOpen, initialProject, initialItem]);

  const handleProjectSelect = (projId: string) => {
    const selected = projects.find((p) => p.id === projId);
    setFormData((prev) => ({
      ...prev,
      projectId: projId,
      projectName: selected?.projectName || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.projectId) {
      addToast('error', 'Required Fields Missing', 'Please provide your full name, phone number, and project.');
      return;
    }

    try {
      setSubmitting(true);

      // Create site visit entry
      await createSiteVisit({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        email: formData.email.trim(),
        projectId: formData.projectId,
        projectName: formData.projectName,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        visitorsCount: Number(formData.visitorsCount) || 1,
        message: formData.message.trim(),
        status: 'scheduled',
      });

      // Also ensure it is logged as a CRM lead
      await createLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        projectId: formData.projectId,
        projectName: formData.projectName,
        source: 'site_visit_request',
        stage: 'site_visit',
        notes: `Requested site visit for ${formData.preferredDate} (${formData.preferredTime}). Visitors: ${formData.visitorsCount}. Message: ${formData.message}`,
      });

      addToast(
        'success',
        'Site Visit Scheduled!',
        'Our property coordinator will call you to confirm your visit time and transportation details.'
      );
      onClose();
    } catch (err: any) {
      addToast('error', 'Booking Failed', err?.message || 'Unable to submit site visit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#103858] text-[#CCA02E] flex items-center justify-center font-bold">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#103858]">Schedule Free Site Visit</h3>
            <p className="text-xs text-slate-500">Pick up & drop facility available upon confirmation</p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
            Select Project <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.projectId}
            onChange={(e) => handleProjectSelect(e.target.value)}
            required
            className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.projectName} — ({proj.location}, {proj.city})
              </option>
            ))}
          </select>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Sharma"
            required
            leftIcon={<User className="w-4 h-4" />}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Phone Number"
            placeholder="Enter 10-digit mobile number"
            required
            type="tel"
            leftIcon={<Phone className="w-4 h-4" />}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="WhatsApp Number (Optional)"
            placeholder="For directions & coordinate sharing"
            type="tel"
            leftIcon={<Phone className="w-4 h-4 text-emerald-600" />}
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />

          <Input
            label="Email Address (Optional)"
            placeholder="e.g. ramesh@example.com"
            type="email"
            leftIcon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        {/* Date, Time & Visitors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Preferred Date"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
              Preferred Time Slot
            </label>
            <select
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
            >
              <option value="Morning (10:00 AM - 01:00 PM)">Morning (10 AM - 1 PM)</option>
              <option value="Afternoon (01:00 PM - 04:00 PM)">Afternoon (1 PM - 4 PM)</option>
              <option value="Evening (04:00 PM - 06:30 PM)">Evening (4 PM - 6:30 PM)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
              No. of Visitors
            </label>
            <select
              value={formData.visitorsCount}
              onChange={(e) => setFormData({ ...formData, visitorsCount: Number(e.target.value) })}
              className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
            >
              <option value={1}>1 Person</option>
              <option value={2}>2 Persons (Family)</option>
              <option value={3}>3-4 Persons</option>
              <option value={5}>5+ Persons</option>
            </select>
          </div>
        </div>

        {/* Message / Special Instructions */}
        <Textarea
          label="Special Requests / Pick-up Requirement"
          placeholder="Let us know if you need assistance with transportation or have specific plots in mind..."
          rows={2}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full font-bold shadow-md"
            loading={submitting}
          >
            Confirm Site Visit Booking
          </Button>
        </div>
      </form>
    </Modal>
  );
};
