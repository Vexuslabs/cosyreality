import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin, Youtube, ShieldCheck, Lock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#103858] text-white pt-16 pb-12 border-t-4 border-[#CCA02E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b border-slate-700/60">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center border border-[#CCA02E]/40 text-[#CCA02E] shadow-sm font-bold text-xl tracking-tighter group-hover:bg-[#CCA02E] group-hover:text-[#103858] transition-colors">
                CR
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-white block">
                  COSY REALITY
                </span>
                <span className="text-[10px] font-semibold text-[#CCA02E] tracking-widest uppercase">
                  Reality but make it cosy
                </span>
              </div>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-semibold text-[#CCA02E] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#CCA02E]" />
              <span>15 Years of Experience</span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              {settings.footerText ||
                'Delivering residential, commercial, and plotted properties through structured processes, transparency, and client-first commitment.'}
            </p>

            {/* Social Links - Render only when valid URL exists in settings */}
            <div className="flex items-center gap-2.5 pt-2">
              {settings.facebook && settings.facebook.trim() !== '' && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#CCA02E] hover:text-[#103858] text-white flex items-center justify-center text-[10px] font-bold transition-colors"
                  aria-label="Facebook"
                >
                  FB
                </a>
              )}
              {settings.instagram && settings.instagram.trim() !== '' && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#CCA02E] hover:text-[#103858] text-white flex items-center justify-center text-[10px] font-bold transition-colors"
                  aria-label="Instagram"
                >
                  IN
                </a>
              )}
              {settings.whatsapp && settings.whatsapp.trim() !== '' && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#16A34A] hover:bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold transition-colors"
                  aria-label="WhatsApp"
                >
                  WA
                </a>
              )}
              {settings.linkedin && settings.linkedin.trim() !== '' && (
                <a
                  href={settings.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#CCA02E] hover:text-[#103858] text-white flex items-center justify-center text-[10px] font-bold transition-colors"
                  aria-label="LinkedIn"
                >
                  LI
                </a>
              )}
              {settings.youtube && settings.youtube.trim() !== '' && (
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#CCA02E] hover:text-[#103858] text-white flex items-center justify-center text-[10px] font-bold transition-colors"
                  aria-label="YouTube"
                >
                  YT
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-[#CCA02E] uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-slate-300 hover:text-white transition-colors">
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/inventory"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>Live Inventory</span>
                  <span className="text-[10px] bg-[#16A34A] text-white px-1.5 py-0.2 rounded font-bold">
                    Live
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              {settings.showAssociates && (
                <>
                  <li>
                    <Link
                      to="/associates"
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      Associates Network
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/associate/dashboard"
                      className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <span>Associate Portal</span>
                      <span className="text-[9px] bg-[#CCA02E]/20 text-[#CCA02E] px-1 py-0.5 rounded font-bold uppercase">
                        Portal
                      </span>
                    </Link>
                  </li>
                </>
              )}
              {settings.showCommissionPlan && (
                <li>
                  <Link
                    to="/commission-plan"
                    className="text-[#CCA02E] hover:underline font-semibold transition-colors"
                  >
                    10-Level Business Plan
                  </Link>
                </li>
              )}
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-bold text-[#CCA02E] uppercase tracking-wider mb-4">
              Compliance & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Disclaimer & Disclosures
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-700/60">
                <Link
                  to="/admin/login"
                  className="text-[#CCA02E] hover:text-white transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Lock className="w-3.5 h-3.5 text-[#CCA02E]" />
                  <span>Admin & Staff Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details from Firestore Settings */}
          <div>
            <h4 className="text-sm font-bold text-[#CCA02E] uppercase tracking-wider mb-4">
              Corporate Office
            </h4>
            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              {settings.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#CCA02E] shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </div>
              )}

              {settings.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#CCA02E] shrink-0" />
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}

              {settings.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#CCA02E] shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.email}
                  </a>
                </div>
              )}

              {settings.workingHours && (
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#CCA02E] shrink-0 mt-0.5" />
                  <span>{settings.workingHours}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Cosy Reality. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="hover:text-[#CCA02E] transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-[#CCA02E]" />
              <span>Admin Login</span>
            </Link>
            <span className="text-slate-600">•</span>
            <p className="text-slate-300 font-medium">
              {settings.developerCredit || 'Designed & Developed by FutureZenGroup'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
