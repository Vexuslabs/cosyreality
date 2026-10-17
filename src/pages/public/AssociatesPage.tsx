import React, { useState } from 'react';
import {
  Handshake,
  ShieldCheck,
  TrendingUp,
  Award,
  Users2,
  Send,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { CommissionCalculator } from '../../components/public/CommissionCalculator';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { createAssociate } from '../../services/associatesService';
import { useDocumentTitle } from '../../utils/seo';

export const AssociatesPage: React.FC = () => {
  useDocumentTitle('Associate & Channel Partner Network — Cosy Reality');
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    companyName: '',
    city: '',
    reraNumber: '',
    experienceYears: 3,
    message: '',
  });

  const partnerBenefits = [
    {
      title: 'Real-Time Inventory Access',
      desc: 'Get instant visibility into live booking status, plot allocations, and developer inventory without middlemen.',
      icon: TrendingUp,
    },
    {
      title: 'Guaranteed Timely Payouts',
      desc: 'Transparent commission disbursement upon client token clearance with complete invoice tracking.',
      icon: Award,
    },
    {
      title: 'Dedicated Site Coordinators',
      desc: 'Our fleet and on-ground project managers assist your client during site inspections and registry procedures.',
      icon: Users2,
    },
    {
      title: '15-Year Developer Brand Credibility',
      desc: 'Sell with confidence backed by 15 years of construction quality, 100% clear titles, and verified land records.',
      icon: ShieldCheck,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      addToast('error', 'Required Fields', 'Please provide your full name and primary phone number.');
      return;
    }

    try {
      setSubmitting(true);
      await createAssociate({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        email: formData.email.trim(),
        companyName: formData.companyName.trim(),
        city: formData.city.trim() || 'Delhi NCR',
        reraNumber: formData.reraNumber.trim(),
        experienceYears: Number(formData.experienceYears) || 0,
        message: formData.message.trim(),
        status: 'pending',
      });

      addToast(
        'success',
        'Application Received!',
        'Thank you for applying to the Cosy Reality Channel Partner Network. Our Channel Head will contact you within 24 hours.'
      );

      setFormData({
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        companyName: '',
        city: '',
        reraNumber: '',
        experienceYears: 3,
        message: '',
      });
    } catch (err: any) {
      addToast('error', 'Submission Error', err?.message || 'Unable to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 sm:py-20">
      <Container>
        {/* Header */}
        <SectionHeading
          badge="Channel Partner Program"
          title="Partner With Cosy Reality"
          subtitle="Join an elite network of over 500+ channel partners and real estate advisors. Grow your business with transparent inventory and fast payouts."
        />

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {partnerBenefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#103858] text-[#CCA02E] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#103858] mb-2">{b.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form and Commission Calculator / Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Partner Registration Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#CCA02E]">
                Direct Partner Onboarding
              </span>
              <h3 className="text-2xl font-bold text-[#103858] mt-1">Associate Registration</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your credentials to receive an associate agreement and portal access.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  placeholder="e.g. Anil Kumar"
                  required
                  leftIcon={<User className="w-4 h-4" />}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                  label="Agency / Firm Name"
                  placeholder="e.g. Apex Property Advisory"
                  leftIcon={<Building className="w-4 h-4" />}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary Phone Number"
                  placeholder="Enter 10-digit mobile number"
                  required
                  type="tel"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <Input
                  label="WhatsApp Number"
                  placeholder="For inventory updates"
                  type="tel"
                  leftIcon={<Phone className="w-4 h-4 text-emerald-600" />}
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  placeholder="e.g. anil@apexadvisory.com"
                  type="email"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Input
                  label="City / Operating Market"
                  placeholder="e.g. Noida / Greater Noida"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="RERA Registration No. (If applicable)"
                  placeholder="e.g. UPRERAAGT12345"
                  leftIcon={<FileCheck className="w-4 h-4" />}
                  value={formData.reraNumber}
                  onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
                    Years of Experience
                  </label>
                  <select
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
                  >
                    <option value={1}>Less than 2 Years</option>
                    <option value={3}>2 to 5 Years</option>
                    <option value={7}>5 to 10 Years</option>
                    <option value={12}>10+ Years</option>
                  </select>
                </div>
              </div>

              <Textarea
                label="Portfolio / Specialization Overview"
                placeholder="Share your focus area (Plots, Highrise, Commercial, Luxury Villas)..."
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full font-bold shadow-md"
                  loading={submitting}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Submit Channel Partner Application
                </Button>
              </div>
            </form>
          </div>

          {/* Right Col: Commission Calculator / Partner Promise */}
          <div className="lg:col-span-5 space-y-6">
            {settings.showCommissionPlan && <CommissionCalculator />}

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#103858] border border-slate-200 flex items-center justify-center font-bold">
                  <Handshake className="w-5 h-5 text-[#CCA02E]" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#103858]">The Cosy Reality Guarantee</h4>
                  <p className="text-xs text-slate-500">15 Years of Ethical Partnership</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We believe our channel associates are equal stakeholders in our brand. When you introduce a client to Cosy Reality, your customer data remains protected and client ownership is strictly honored for all future bookings.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
