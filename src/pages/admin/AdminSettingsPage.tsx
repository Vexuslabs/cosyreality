import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Save,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Globe,
  Sliders,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { useDocumentTitle } from '../../utils/seo';

export const AdminSettingsPage: React.FC = () => {
  useDocumentTitle('System & Brand Settings — Cosy Reality Admin');
  const { settings, updateSiteSettings } = useSettings();
  const { isSuperAdmin } = useAuth();
  const { addToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: settings.companyName,
    tagline: settings.tagline,
    yearsOfExperience: settings.yearsOfExperience,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    address: settings.address,
    workingHours: settings.workingHours,
    heroImage: settings.heroImage,
    showCommissionPlan: settings.showCommissionPlan,
    showAssociatesPage: settings.showAssociatesPage,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      addToast('error', 'Unauthorized', 'Only Super Administrators can update core system settings.');
      return;
    }

    try {
      setSaving(true);
      await updateSiteSettings(formData);
      addToast('success', 'Settings Saved', 'Global company settings updated successfully.');
    } catch (err: any) {
      addToast('error', 'Save Failed', err?.message || 'Unable to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#103858]">Company & Platform Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure branding, direct support channels, and channel partner controls
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-[#CCA02E]" />
            <h3 className="font-bold text-base text-[#103858]">Brand Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />

            <Input
              label="Tagline"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Years of Experience in Real Estate & Construction"
              type="number"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
            />

            <Input
              label="Operating Hours"
              value={formData.workingHours}
              onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
            />
          </div>
        </div>

        {/* Contact Channels */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="w-5 h-5 text-[#CCA02E]" />
            <h3 className="font-bold text-base text-[#103858]">Contact & Dispatch Numbers</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Primary Phone Desk"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <Input
              label="WhatsApp Quick Connect"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              required
            />

            <Input
              label="Official Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <Textarea
            label="Corporate Office Address"
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* Media & Hero */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-5 h-5 text-[#CCA02E]" />
            <h3 className="font-bold text-base text-[#103858]">Homepage Hero Banner</h3>
          </div>

          <ImageUploader
            label="Default Hero Backdrop Image"
            value={formData.heroImage}
            onChange={(url) => setFormData({ ...formData, heroImage: url })}
            storagePath="settings/hero"
          />
        </div>

        {/* Feature Toggles */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-[#CCA02E]" />
            <h3 className="font-bold text-base text-[#103858]">Channel Partner Feature Flags</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showAssociatesPage}
                onChange={(e) => setFormData({ ...formData, showAssociatesPage: e.target.checked })}
                className="w-4 h-4 rounded text-[#103858] focus:ring-[#103858]"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-[#103858] block">
                  Enable Public Channel Partner & Associate Registration Page
                </span>
                <span className="text-[11px] text-slate-400">Controls visibility of /associates public onboarding</span>
              </div>
            </label>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showCommissionPlan}
                  onChange={(e) => setFormData({ ...formData, showCommissionPlan: e.target.checked })}
                  className="w-4 h-4 rounded text-[#103858] focus:ring-[#103858]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#103858] block">
                    Show 10-Level Associate Business Plan Publicly
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Default: Disabled. Enables the public /commission-plan showcase and dynamic calculator.
                  </span>
                </div>
              </label>

              <Link
                to="/admin/commission-plan"
                className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] underline shrink-0 sm:ml-4"
              >
                Configure 10-Level Rates →
              </Link>
            </div>
          </div>
        </div>

        {/* Submit */}
        {isSuperAdmin && (
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={saving}
              leftIcon={<Save className="w-4 h-4 text-[#103858]" />}
              className="font-bold shadow-md"
            >
              Save System Settings
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
