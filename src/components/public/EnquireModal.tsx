import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Building2, User, Phone, Mail, IndianRupee, MessageSquare, Send } from 'lucide-react';
import { Project, InventoryItem } from '../../types';
import { createLead } from '../../services/leadsService';
import { useToast } from '../../context/ToastContext';

interface EnquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  item?: InventoryItem | null;
  customMessage?: string;
}

export const EnquireModal: React.FC<EnquireModalProps> = ({
  isOpen,
  onClose,
  project,
  item,
  customMessage,
}) => {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    budget: '',
    propertyType: item?.propertyType || project?.projectType || 'Residential',
    message: '',
  });

  useEffect(() => {
    if (isOpen) {
      let initialMsg = customMessage || '';
      if (!initialMsg && item) {
        initialMsg = `I am inquiring regarding Plot/Unit: ${item.unitNumber || item.plotNumber} in ${item.projectName}. Please send price breakdown and payment plans.`;
      } else if (!initialMsg && project) {
        initialMsg = `I am interested in ${project.projectName} located at ${project.location}. Please share the brochure and current availability.`;
      }
      setFormData((prev) => ({
        ...prev,
        message: initialMsg,
        propertyType: item?.propertyType || project?.projectType || prev.propertyType,
      }));
    }
  }, [isOpen, project, item, customMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      addToast('error', 'Required Fields Missing', 'Please enter your name and phone number.');
      return;
    }

    try {
      setSubmitting(true);
      await createLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        projectId: project?.id || item?.projectId || '',
        projectName: project?.projectName || item?.projectName || '',
        unitNumber: item?.unitNumber || item?.plotNumber || '',
        budget: formData.budget,
        propertyType: formData.propertyType,
        source: item ? 'inventory_enquiry' : project ? 'project_page' : 'website_header',
        stage: 'new',
        notes: formData.message,
      });

      addToast(
        'success',
        'Enquiry Received!',
        'Thank you for reaching out to Cosy Reality. Our senior property advisor will connect with you shortly.'
      );
      onClose();
    } catch (err: any) {
      addToast('error', 'Submission Failed', err?.message || 'Unable to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#103858] text-[#CCA02E] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#103858]">Enquire Now</h3>
            <p className="text-xs text-slate-500">
              {item
                ? `Inquiry for ${item.projectName} — ${item.unitNumber || item.plotNumber}`
                : project
                ? `Inquiry for ${project.projectName}`
                : 'Connect with a Cosy Reality Advisor'}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your Full Name"
          placeholder="e.g. Vikram Singhania"
          required
          leftIcon={<User className="w-4 h-4" />}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            label="Email Address (Optional)"
            placeholder="e.g. vikram@example.com"
            type="email"
            leftIcon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
              Budget Range
            </label>
            <select
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
            >
              <option value="">Select Budget</option>
              <option value="Under ₹35 Lakh">Under ₹35 Lakh</option>
              <option value="₹35 Lakh - ₹75 Lakh">₹35 Lakh - ₹75 Lakh</option>
              <option value="₹75 Lakh - ₹1.5 Crore">₹75 Lakh - ₹1.5 Crore</option>
              <option value="₹1.5 Crore+">₹1.5 Crore+</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
              Property Type
            </label>
            <select
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
            >
              <option value="Plots / Land">Plots / Land</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Villas">Villas</option>
            </select>
          </div>
        </div>

        <Textarea
          label="Your Message or Questions"
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full font-bold shadow-md"
            loading={submitting}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Submit Enquiry
          </Button>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Your contact information is strictly confidential and protected under our privacy policy.
          </p>
        </div>
      </form>
    </Modal>
  );
};
