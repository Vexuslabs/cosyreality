import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  Building2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { SiteVisitModal } from '../../components/public/SiteVisitModal';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { createLead } from '../../services/leadsService';
import { useDocumentTitle } from '../../utils/seo';

export const ContactPage: React.FC = () => {
  useDocumentTitle('Contact Us — Cosy Reality');
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Enquiry',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      addToast('error', 'Missing Information', 'Please provide your name and phone number.');
      return;
    }

    try {
      setSubmitting(true);
      await createLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        source: 'contact_page_form',
        stage: 'new',
        notes: `Subject: ${formData.subject}. Message: ${formData.message}`,
      });

      addToast(
        'success',
        'Message Sent!',
        'Thank you for contacting Cosy Reality. Our customer advisory team will get back to you shortly.'
      );

      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'General Enquiry',
        message: '',
      });
    } catch (err: any) {
      addToast('error', 'Submission Failed', err?.message || 'Unable to submit message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 sm:py-20">
      <Container>
        {/* Heading */}
        <SectionHeading
          badge="Get in Touch"
          title="Connect With Our Advisory Team"
          subtitle="Whether you are exploring plot investments, booking a site visit, or seeking construction advisory, we are here to assist."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Office details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#103858] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#CCA02E]">
                  Cosy Reality Headquarters
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">Corporate Office</h3>
                <p className="text-xs text-slate-300 mt-1">
                  15 Years of Experience in Real Estate & Construction
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-200">
                {settings.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#CCA02E] shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Office Location
                      </span>
                      <span>{settings.address}</span>
                    </div>
                  </div>
                )}

                {settings.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#CCA02E] shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Phone Enquiries
                      </span>
                      <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-[#CCA02E]">
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                )}

                {settings.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#CCA02E] shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Email Support
                      </span>
                      <a href={`mailto:${settings.email}`} className="hover:text-[#CCA02E]">
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}

                {settings.workingHours && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#CCA02E] shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Working Hours
                      </span>
                      <span>{settings.workingHours}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => setSiteVisitOpen(true)}
                  className="w-full font-bold shadow-md"
                  leftIcon={<Calendar className="w-4 h-4 text-[#103858]" />}
                >
                  Book Free Site Visit
                </Button>

                {settings.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat on WhatsApp Directly</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#CCA02E]">
                Direct Message
              </span>
              <h3 className="text-2xl font-bold text-[#103858] mt-1">Send Us An Inquiry</h3>
              <p className="text-xs text-slate-500 mt-1">
                Our property specialist will review your request and get back within 2 business hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Rajesh Mehra"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  placeholder="Enter 10-digit mobile number"
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <Input
                  label="Email Address"
                  placeholder="e.g. rajesh@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
                  Nature of Enquiry
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
                >
                  <option value="General Property Enquiry">General Property Enquiry</option>
                  <option value="Plot & Land Booking">Plot & Land Booking</option>
                  <option value="Residential Apartments">Residential Apartments</option>
                  <option value="Commercial Spaces">Commercial Spaces</option>
                  <option value="Construction Ecosystem">Construction / Turnkey Contracting</option>
                  <option value="Channel Partner Network">Channel Partner Inquiry</option>
                </select>
              </div>

              <Textarea
                label="Message / Requirements"
                placeholder="Tell us what you are looking for (Location preference, budget range, plot size)..."
                rows={4}
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
                  Submit Inquiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Container>

      {/* Site Visit Modal */}
      <SiteVisitModal isOpen={siteVisitOpen} onClose={() => setSiteVisitOpen(false)} />
    </div>
  );
};
