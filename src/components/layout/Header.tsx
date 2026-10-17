import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Phone,
  MessageSquare,
  ChevronRight,
  Download,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

interface HeaderProps {
  onOpenEnquire?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenEnquire }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const APK_DOWNLOAD_URL =
    "https://drive.google.com/file/d/1ECZCUqY2D6EitRBN6rpFhz8R0ixkP1I0/view?usp=sharing";

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "About Us", path: "/about" },
    { name: "Live Inventory", path: "/inventory", badge: "Live" },
    ...(settings.showAssociates
      ? [{ name: "Associates", path: "/associates" }]
      : []),
    ...(settings.showCommissionPlan
      ? [{ name: "Business Plan", path: "/commission-plan" }]
      : []),
    { name: "Download APK", path: "/download-apk" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleEnquireClick = () => {
    if (onOpenEnquire) {
      onOpenEnquire();
    } else {
      navigate("/contact");
    }
  };

  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={`w-full z-40 transition-all duration-300 ${
        isTransparent
          ? "absolute top-0 left-0 right-0 bg-transparent text-white border-b border-white/15"
          : "sticky top-0 bg-white/95 backdrop-blur-md text-[#103858] border-b border-slate-200/80 shadow-xs"
      }`}
    >
      {/* Main Navigation Bar */}
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20 sm:h-[84px]">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div
              className={`w-10 h-10 rounded flex items-center justify-center transition-all ${
                isTransparent
                  ? "bg-white/10 border border-white/30 text-[#FFD875]"
                  : "bg-[#103858] border border-[#CCA02E]/30 text-[#CCA02E]"
              }`}
            >
              <span className="font-bold text-xl tracking-tighter">CR</span>
            </div>
            <div className="flex flex-col">
              <span
                className={`font-bold text-lg sm:text-xl leading-none tracking-tight transition-colors ${
                  isTransparent
                    ? "text-white"
                    : "text-[#103858] group-hover:text-[#CCA02E]"
                }`}
              >
                COSY REALITY
              </span>
              <span
                className={`text-[9px] sm:text-[10px] tracking-widest font-semibold uppercase mt-1 ${
                  isTransparent ? "text-[#FFD875]" : "text-[#CCA02E]"
                }`}
              >
                Reality but make it cosy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-sm font-medium tracking-wide transition-colors py-1.5 ${
                    active
                      ? isTransparent
                        ? "text-white font-semibold"
                        : "text-[#CCA02E] font-semibold"
                      : isTransparent
                        ? "text-white/80 hover:text-white"
                        : "text-slate-700 hover:text-[#CCA02E]"
                  }`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#16A34A] text-white">
                      {link.badge}
                    </span>
                  )}
                  {active && (
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                        isTransparent ? "bg-[#FFD875]" : "bg-[#CCA02E]"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {settings.phone && settings.phone.trim() !== "" && (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                className={`text-xs font-semibold px-3 py-2 transition-colors inline-flex items-center gap-1.5 ${
                  isTransparent
                    ? "text-white/85 hover:text-white"
                    : "text-slate-600 hover:text-[#103858]"
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-[#CCA02E]" />
                <span>{settings.phone}</span>
              </a>
            )}
            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-xs ${
                isTransparent
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </a>
            <button
              onClick={handleEnquireClick}
              className={`px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                isTransparent
                  ? "bg-[#CCA02E] hover:bg-[#b88f26] text-[#103858]"
                  : "bg-[#103858] hover:bg-[#0b253a] text-white"
              }`}
            >
              <span>Contact Sales</span>
              <ChevronRight
                className={`w-3.5 h-3.5 ${isTransparent ? "text-[#103858]" : "text-[#CCA02E]"}`}
              />
            </button>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={handleEnquireClick}
              className={`text-xs px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors ${
                isTransparent
                  ? "bg-[#CCA02E] text-[#103858]"
                  : "bg-[#103858] text-white"
              }`}
            >
              Enquire
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white text-[#103858] border-t border-slate-200 px-5 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#103858] text-white"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16A34A] text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK for Android</span>
            </a>
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-[#103858]"
              >
                <Phone className="w-3.5 h-3.5 text-[#CCA02E]" />
                <span>Call Sales: {settings.phone}</span>
              </a>
            )}
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Advisory</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
