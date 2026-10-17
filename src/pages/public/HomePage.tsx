import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Building2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronRight,
  MapPin,
  Calendar,
  Sparkles,
  Eye,
  X,
  CheckCircle2,
  Trees,
  Zap,
  PhoneCall,
  FileText,
  Clock,
  ArrowUpRight,
  Maximize2,
  Grid,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Project, InventoryItem } from '../../types';
import { getFeaturedProjects } from '../../services/projectsService';
import { getInventory, getInventoryCounts } from '../../services/inventoryService';
import { formatINR } from '../../utils/formatters';
import { SiteVisitModal } from '../../components/public/SiteVisitModal';
import { EnquireModal } from '../../components/public/EnquireModal';
import { InventoryModal } from '../../components/public/InventoryModal';
import { useDocumentTitle } from '../../utils/seo';

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  useDocumentTitle('Cosy Reality — Modern Property Starts With Better Choices');

  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [sampleInventory, setSampleInventory] = useState<InventoryItem[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<{
    total: number;
    booking: number;
    waiting: number;
    sold: number;
  }>({ total: 0, booking: 0, waiting: 0, sold: 0 });
  const [loading, setLoading] = useState(true);

  // Modals & Lightbox state
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [enquireCustomMsg, setEnquireCustomMsg] = useState('');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsData, countsData, inventoryData] = await Promise.all([
          getFeaturedProjects(),
          getInventoryCounts(),
          getInventory(),
        ]);

        // Prioritize Bansuri Dham first in the list if present
        const sortedProjects = [...projectsData].sort((a, b) => {
          if (a.slug === 'bansuri-dham') return -1;
          if (b.slug === 'bansuri-dham') return 1;
          return 0;
        });

        setFeaturedProjects(sortedProjects);
        setInventoryCounts(countsData);
        setSampleInventory(inventoryData.slice(0, 6));
      } catch (err) {
        console.warn('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Find Bansuri Dham specifically for the spotlight section
  const bansuriProject = featuredProjects.find(
    (p) => p.slug === 'bansuri-dham' || p.projectName.toLowerCase().includes('bansuri')
  );

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      title: 'Plotted Enclave & Arterial Road Corridor',
      subtitle: 'Yamuna Expressway Region',
    },
    {
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      title: 'Township Greenery & Planned Central Parks',
      subtitle: '2,878 sqm Landscaped Park Zone',
    },
    {
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      title: 'Contemporary Residential Architecture',
      subtitle: 'Modern Freehold Living',
    },
    {
      url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
      title: 'Wide Internal Infrastructure & Avenue Lighting',
      subtitle: '20,548 sqm Road Network',
    },
    {
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      title: 'Commercial Frontages & Mixed-Use Hub',
      subtitle: 'Institutional & Retail Catchment',
    },
    {
      url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      title: 'Serene Plotted Enclave Horizons',
      subtitle: 'Freehold Plots & Farm Parcels',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#172B3A] selection:bg-[#CCA02E]/30 selection:text-[#103858]">
      {/* =========================================================================
          1. CINEMATIC HERO SECTION — PRECISE ARCHITECTURAL COMPOSITION OVERLAY
          ========================================================================= */}
      <section className="relative min-h-[680px] sm:min-h-[720px] lg:min-h-[760px] w-full bg-[#081D2F] text-white flex items-center overflow-hidden pt-28 pb-24 sm:pt-32 sm:pb-28">
        {/* Full-width Focal Real-Estate Background Image */}
        <img
          src={
            settings.heroImage ||
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85'
          }
          alt="Cosy Reality Plotted & Residential Developments"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center lg:object-right opacity-65"
        />

        {/* Subtle Dark Blue Architectural Gradient Overlay for High Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071927]/95 via-[#0A243A]/75 to-[#0A243A]/30" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-[1240px] w-full mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-[560px] space-y-6 sm:space-y-7">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xs text-xs font-semibold text-[#FFD875]">
              <Sparkles className="w-3.5 h-3.5 text-[#CCA02E]" />
              <span>Plotted & Urban Real Estate Solutions</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-bold text-white leading-[1.04] tracking-tight">
              Find The Right Property.
              <br />
              <span className="text-[#FFD875] font-extrabold">Build A Better Future.</span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-slate-200 max-w-[440px] leading-relaxed font-normal">
              Discover thoughtfully presented plotted, residential and commercial developments with
              transparent information and live property availability.
            </p>

            {/* Hero CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <Link to="/projects">
                <button className="h-[52px] px-8 rounded-lg bg-[#CCA02E] hover:bg-[#b88f26] text-[#103858] font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2">
                  <span>View Projects</span>
                  <ArrowRight className="w-4 h-4 text-[#103858]" />
                </button>
              </Link>

              <button
                onClick={() => {
                  setEnquireCustomMsg('I would like to request general project and availability information.');
                  setEnquireOpen(true);
                }}
                className="h-[52px] px-7 rounded-lg bg-transparent hover:bg-white/10 text-white border border-white/40 font-semibold text-sm tracking-wide transition-all cursor-pointer inline-flex items-center justify-center"
              >
                Request Info
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. 3 FLOATING FEATURE CARDS — OVERLAPPING HERO BOTTOM
          ========================================================================= */}
      <section className="relative z-20 max-w-[1160px] mx-auto px-5 sm:px-8 w-full -mt-14 sm:-mt-18 lg:-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {/* Card 1: Residential Plots */}
          <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-lg shadow-slate-900/5 text-center flex flex-col justify-between min-h-[200px] hover:translate-y-[-2px] transition-transform duration-200">
            <div className="space-y-2">
              <div className="w-11 h-11 rounded-full bg-[#FAF8F3] border border-slate-200/70 text-[#103858] mx-auto flex items-center justify-center mb-3 shadow-2xs">
                <Compass className="w-5 h-5 text-[#CCA02E]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#103858]">Residential Plots</h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-[280px] mx-auto">
                Explore well-presented plotted developments with current property availability.
              </p>
            </div>
            <div>
              <div className="w-8 h-px bg-slate-200 mx-auto my-3" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A6801C]">
                Live Project Options
              </span>
            </div>
          </div>

          {/* Card 2: Urban & Commercial */}
          <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-lg shadow-slate-900/5 text-center flex flex-col justify-between min-h-[200px] hover:translate-y-[-2px] transition-transform duration-200">
            <div className="space-y-2">
              <div className="w-11 h-11 rounded-full bg-[#FAF8F3] border border-slate-200/70 text-[#103858] mx-auto flex items-center justify-center mb-3 shadow-2xs">
                <Building2 className="w-5 h-5 text-[#CCA02E]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#103858]">Urban & Commercial</h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-[280px] mx-auto">
                Discover residential and commercial property opportunities across active projects.
              </p>
            </div>
            <div>
              <div className="w-8 h-px bg-slate-200 mx-auto my-3" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A6801C]">
                Multiple Property Types
              </span>
            </div>
          </div>

          {/* Card 3: Live Availability */}
          <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-lg shadow-slate-900/5 text-center flex flex-col justify-between min-h-[200px] hover:translate-y-[-2px] transition-transform duration-200">
            <div className="space-y-2">
              <div className="w-11 h-11 rounded-full bg-[#FAF8F3] border border-slate-200/70 text-[#103858] mx-auto flex items-center justify-center mb-3 shadow-2xs">
                <Layers className="w-5 h-5 text-[#CCA02E]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#103858]">Live Availability</h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-[280px] mx-auto">
                Check Booking Open, Waiting / Hold and Sold inventory directly from live data.
              </p>
            </div>
            <div>
              <div className="w-8 h-px bg-slate-200 mx-auto my-3" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A]">
                Real-Time Status
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. ABOUT COSY REALITY — EDITORIAL 2-COLUMN SECTION
          ========================================================================= */}
      <section className="pt-24 sm:pt-32 pb-20 sm:pb-28 bg-[#FAF8F3]/60">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column Content (~45%) */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E] block mb-2">
                  Company Overview
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#103858] tracking-tight leading-tight">
                  About Cosy Reality
                </h2>
              </div>

              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  Cosy Reality brings together real-estate experience, structured property information
                  and customer-focused coordination.
                </p>
                <p>
                  Our goal is to make property discovery clearer, more transparent and easier to
                  understand through live project and inventory information.
                </p>
              </div>

              <div className="pt-1">
                <Link to="/about">
                  <button className="h-[48px] px-6 rounded-lg bg-[#103858] hover:bg-[#0B253A] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer inline-flex items-center gap-2">
                    <span>Learn More About Us</span>
                    <ChevronRight className="w-4 h-4 text-[#CCA02E]" />
                  </button>
                </Link>
              </div>

              {/* 2 Compact Trust Points Side by Side */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-[#103858] flex items-center justify-center shrink-0 shadow-2xs">
                    <Award className="w-4 h-4 text-[#CCA02E]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#103858]">Trusted Experience</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      15 years of real-estate and construction understanding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-[#103858] flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-[#CCA02E]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#103858]">Transparent Support</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      Clear property information and structured coordination.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Large Real-Estate Development Visual (~50%) */}
            <div className="lg:col-span-6">
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80"
                  alt="Cosy Reality Township & Infrastructure Planning"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURED PROJECTS — STRONGER VISUAL DESIGN
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
          {/* Top Row Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E] block mb-1.5">
                Current Portfolio
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#103858] tracking-tight">
                Featured Projects
              </h2>
            </div>

            <Link to="/projects">
              <button className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] transition-colors inline-flex items-center gap-1 cursor-pointer">
                <span>View All Projects</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#CCA02E]" />
              </button>
            </Link>
          </div>

          {/* Projects Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-3">
                  <div className="bg-slate-100 aspect-[16/11] rounded-lg animate-pulse" />
                  <div className="h-5 bg-slate-100 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : featuredProjects.length > 0 ? (
            <div
              className={`grid gap-8 ${
                featuredProjects.length === 1
                  ? 'grid-cols-1 max-w-3xl mx-auto'
                  : featuredProjects.length === 2
                  ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {featuredProjects.slice(0, 3).map((project) => {
                const isBansuri =
                  project.slug === 'bansuri-dham' ||
                  project.projectName.toLowerCase().includes('bansuri');

                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.slug}`}
                    className="group block space-y-3.5"
                  >
                    {/* Project Image */}
                    <div className="relative aspect-[16/11] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                      <img
                        src={
                          project.heroImage ||
                          project.thumbnail ||
                          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80'
                        }
                        alt={project.projectName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      {/* Project Status & Type Chips */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-[#103858]/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                          {project.projectType || 'Plotted Development'}
                        </span>
                        <span className="bg-[#16A34A]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                          {project.projectStatus || 'Ongoing'}
                        </span>
                      </div>
                    </div>

                    {/* Project Details Below Image */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-[#103858] group-hover:text-[#CCA02E] transition-colors leading-tight">
                          {project.projectName}
                        </h3>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#CCA02E] transition-colors shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#CCA02E] shrink-0" />
                        <span>
                          {isBansuri
                            ? '58 KM Milestone, Yamuna Expressway'
                            : `${project.location || project.city}`}
                        </span>
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-[#103858]">Projects are being updated</h4>
              <p className="text-xs text-slate-500 mt-1">
                Please visit our projects catalog or contact our sales team.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          5. BANSURI DHAM SPOTLIGHT SECTION — DEDICATED FULL-WIDTH IMAGE-LED
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#091F33] text-white relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CCA02E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column Image Showcase (~50%) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-[16/11] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900 group">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80"
                  alt="Bansuri Dham Yamuna Expressway"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                  <span className="font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FFD875]" />
                    <span>58 KM Milestone, Yamuna Expressway</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs font-bold text-[10px]">
                    79,452 sqm Master Area
                  </span>
                </div>
              </div>

              {/* Verified Area Highlights Bar */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="block text-sm sm:text-base font-extrabold text-[#FFD875]">29,992 sqm</span>
                  <span className="block text-[10px] text-slate-300 uppercase tracking-wider mt-0.5">Plot Area</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="block text-sm sm:text-base font-extrabold text-[#FFD875]">25,783 sqm</span>
                  <span className="block text-[10px] text-slate-300 uppercase tracking-wider mt-0.5">Farm Area</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="block text-sm sm:text-base font-extrabold text-[#FFD875]">20,548 sqm</span>
                  <span className="block text-[10px] text-slate-300 uppercase tracking-wider mt-0.5">Road Network</span>
                </div>
              </div>
            </div>

            {/* Right Column Project Narrative (~50%) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCA02E]/20 border border-[#CCA02E]/40 text-[#FFD875] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Plotted Township</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight">
                  Bansuri Dham
                </h2>
                <p className="text-sm sm:text-base text-[#FFD875] font-medium">
                  58 KM Milestone, Yamuna Expressway, Near Jewar Airport
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Bansuri Dham is a planned plotted development positioned along the strategic Yamuna
                Expressway corridor, near Jewar Airport. The project combines residential plots, farm
                spaces, commercial provisions, road infrastructure, and central park areas.
              </p>

              {/* Key Quick Bullet Facts */}
              <div className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#CCA02E] shrink-0" />
                  <span>Positioned in the Jewar International Airport development corridor</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#CCA02E] shrink-0" />
                  <span>Integrated 20,548 sqm wide arterial and internal road connectivity</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#CCA02E] shrink-0" />
                  <span>2,878 sqm dedicated central park and landscaped green verges</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3.5">
                <Link to="/projects/bansuri-dham">
                  <button className="h-[48px] px-6 rounded-lg bg-[#CCA02E] hover:bg-[#b88f26] text-[#103858] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer inline-flex items-center gap-2">
                    <span>View Project Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <Link to="/inventory?project=bansuri-dham-project">
                  <button className="h-[48px] px-6 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#CCA02E]" />
                    <span>Check Live Availability</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. LIVE INVENTORY — VISUAL SECTION WITH STATUS SUMMARY & SAMPLE UNITS
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#FAF8F3]/60">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10">
          {/* Header & Status Summary Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 max-w-md">
              <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E]">
                Direct Real-Time Inventory
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#103858]">
                Live Property Availability
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Transparent availability across all ongoing plotted and residential phases.
              </p>
            </div>

            {/* 3 Status Summaries */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#16A34A] shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Booking Open
                  </span>
                  <span className="text-lg sm:text-xl font-black text-[#103858]">
                    {inventoryCounts.booking} Units
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#EAB308] shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Waiting / Hold
                  </span>
                  <span className="text-lg sm:text-xl font-black text-[#103858]">
                    {inventoryCounts.waiting} Units
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#DC2626] shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Sold
                  </span>
                  <span className="text-lg sm:text-xl font-black text-[#103858]">
                    {inventoryCounts.sold} Units
                  </span>
                </div>
              </div>
            </div>

            {/* Link to Full Inventory */}
            <div className="shrink-0">
              <Link to="/inventory">
                <button className="h-[46px] px-6 rounded-lg bg-[#103858] hover:bg-[#0B253A] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                  <span>View Full Inventory</span>
                  <ChevronRight className="w-4 h-4 text-[#CCA02E]" />
                </button>
              </Link>
            </div>
          </div>

          {/* Sample Inventory Cards (4 to 6 units) */}
          {sampleInventory.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sampleInventory.map((item) => {
                const isBooking = item.status === 'booking';
                const isHold = item.status === 'waiting';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedInventoryItem(item);
                      setInventoryModalOpen(true);
                    }}
                    className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#CCA02E]/60 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-xs font-bold text-[#103858]">
                            {item.unitNumber || item.plotNumber}
                          </span>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {item.projectName || 'Cosy Reality Project'}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isBooking
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isHold
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {isBooking ? 'Booking Open' : isHold ? 'Waiting / Hold' : 'Sold'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Size / Area</span>
                          <span className="font-semibold text-slate-800">
                            {item.size} {item.sizeUnit || 'Sq. Ft.'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Facing</span>
                          <span className="font-semibold text-slate-800">{item.facing || 'Standard'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Pricing</span>
                        <span className="text-xs font-bold text-[#103858]">
                          {item.finalPrice && item.finalPrice > 0
                            ? formatINR(item.finalPrice)
                            : 'Price on Request'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#CCA02E] inline-flex items-center gap-1">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          7. EXPLORE BY PROPERTY TYPE — EDITORIAL TILES WITH IMAGE OVERLAYS
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E]">
              Portfolio Classifications
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#103858] tracking-tight">
              Explore by Property Type
            </h2>
            <p className="text-sm text-slate-600">
              Browse tailored plotted spaces, commercial zones and planned residential enclaves.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tile 1: Residential Plots */}
            <Link
              to="/projects?type=Plotted+Development"
              className="group relative h-[320px] rounded-xl overflow-hidden shadow-md flex items-end p-6 border border-slate-200"
            >
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                alt="Residential Plots"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081D2F]/95 via-[#081D2F]/40 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#FFD875] uppercase tracking-wider">
                  Freehold Plots
                </span>
                <h3 className="text-xl font-bold">Residential Plots</h3>
                <p className="text-xs text-slate-300">
                  Planned plots with ready road and avenue infrastructure.
                </p>
              </div>
            </Link>

            {/* Tile 2: Commercial Property */}
            <Link
              to="/projects?type=Commercial"
              className="group relative h-[320px] rounded-xl overflow-hidden shadow-md flex items-end p-6 border border-slate-200"
            >
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
                alt="Commercial Property"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081D2F]/95 via-[#081D2F]/40 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#FFD875] uppercase tracking-wider">
                  Retail & Corporate
                </span>
                <h3 className="text-xl font-bold">Commercial Property</h3>
                <p className="text-xs text-slate-300">
                  Strategic high-visibility road frontage spaces.
                </p>
              </div>
            </Link>

            {/* Tile 3: Land & Farm Parcels */}
            <Link
              to="/projects?type=Plotted+Development"
              className="group relative h-[320px] rounded-xl overflow-hidden shadow-md flex items-end p-6 border border-slate-200"
            >
              <img
                src="https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&q=80"
                alt="Land & Farm Parcels"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081D2F]/95 via-[#081D2F]/40 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#FFD875] uppercase tracking-wider">
                  Open Living
                </span>
                <h3 className="text-xl font-bold">Land & Farm Parcels</h3>
                <p className="text-xs text-slate-300">
                  Spacious farm spaces for countryside relaxation.
                </p>
              </div>
            </Link>

            {/* Tile 4: Apartments & Villas */}
            <Link
              to="/projects?type=Residential"
              className="group relative h-[320px] rounded-xl overflow-hidden shadow-md flex items-end p-6 border border-slate-200"
            >
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                alt="Apartments & Villas"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081D2F]/95 via-[#081D2F]/40 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#FFD875] uppercase tracking-wider">
                  Modern Enclaves
                </span>
                <h3 className="text-xl font-bold">Apartments & Villas</h3>
                <p className="text-xs text-slate-300">
                  Contemporary multi-tier residential dwellings.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CONNECTIVITY / REGIONAL CORRIDOR HIGHLIGHTS
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#FAF8F3]/60">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E] block mb-1.5">
                Strategic Infrastructure
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#103858] tracking-tight">
                Connectivity & Regional Highlights
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md">
              Focusing on key corridors like the Yamuna Expressway and Jewar Airport development belt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Panel 1: Yamuna Expressway */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col">
              <div className="h-44 relative overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
                  alt="Yamuna Expressway Corridor"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-base font-bold text-[#103858]">Yamuna Expressway</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    6-lane access-controlled high-speed corridor connecting Greater Noida to Agra.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#A6801C] uppercase tracking-wider block">
                  Regional Arterial Link
                </span>
              </div>
            </div>

            {/* Panel 2: Jewar Airport Corridor */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col">
              <div className="h-44 relative overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"
                  alt="Noida International Airport Jewar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-base font-bold text-[#103858]">Jewar Airport Corridor</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Near the Noida International Airport precinct, driving regional growth and development.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#A6801C] uppercase tracking-wider block">
                  Aviation Zone
                </span>
              </div>
            </div>

            {/* Panel 3: Film City & Tech Zones */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col">
              <div className="h-44 relative overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
                  alt="Film City & Tech Precinct"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-base font-bold text-[#103858]">Film City & Tech Hubs</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Close proximity to designated industrial, entertainment and IT growth corridors.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#A6801C] uppercase tracking-wider block">
                  Institutional Hubs
                </span>
              </div>
            </div>

            {/* Panel 4: Regional Highway Links */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col">
              <div className="h-44 relative overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80"
                  alt="Highway Connectivity"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-base font-bold text-[#103858]">Highway Network</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Connected via Bajna-Chandaus & Aligarh-Palwal routes with easy transit to Vrindavan.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#A6801C] uppercase tracking-wider block">
                  Transit Nodes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. MASTER PLAN & SITE PLANNING VISUAL
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column Interactive Master Plan Blueprint (~55%) */}
            <div className="lg:col-span-7">
              <div className="bg-[#FAF8F3] border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-[#CCA02E]" />
                    <span className="text-xs font-bold text-[#103858] uppercase tracking-wider">
                      Bansuri Dham Master Plan Layout
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setLightboxImage(
                        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80'
                      )
                    }
                    className="text-xs font-bold text-[#103858] hover:text-[#CCA02E] flex items-center gap-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Fullscreen</span>
                  </button>
                </div>

                {/* Blueprint Graphic */}
                <div
                  onClick={() =>
                    setLightboxImage(
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80'
                    )
                  }
                  className="relative aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden border border-slate-300 cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
                    alt="Master Plan Layout Blueprint"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white text-xs space-y-0.5">
                      <p className="font-bold">Total Master Site: 79,452 sqm</p>
                      <p className="text-slate-300 text-[11px]">Click to inspect layout diagram</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Area Facts (~45%) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E] block mb-1.5">
                  Spatial Master Planning
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#103858] tracking-tight">
                  Master Plan & Site Planning
                </h2>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Structured layout distribution ensures wide internal thoroughfares, open park
                expanses and clearly demarcated residential and farm parcels.
              </p>

              {/* Area Distribution Table */}
              <div className="bg-[#FAF8F3] border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Total Site Area</span>
                  <span className="font-bold text-[#103858]">79,452 sqm (100%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Plot Area</span>
                  <span className="font-bold text-[#103858]">29,992 sqm (37.75%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Farm Area</span>
                  <span className="font-bold text-[#103858]">25,783 sqm (32.45%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Road Network</span>
                  <span className="font-bold text-[#103858]">20,548 sqm (25.86%)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Central Park & Greenery</span>
                  <span className="font-bold text-[#103858]">2,878 sqm (3.62%)</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/projects/bansuri-dham">
                  <button className="h-[46px] px-6 rounded-lg bg-[#103858] hover:bg-[#0B253A] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer inline-flex items-center gap-2">
                    <span>View Full Master Plan</span>
                    <ChevronRight className="w-4 h-4 text-[#CCA02E]" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. AMENITIES & LIFESTYLE — 6 LARGE VISUAL TILES
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#FAF8F3]/60">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E]">
              Infrastructure & Living
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#103858] tracking-tight">
              Amenities & Lifestyle
            </h2>
            <p className="text-sm text-slate-600">
              Planned physical infrastructure and recreational amenities supporting everyday living.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tile 1: Parks & Walking Tracks */}
            <div className="group relative h-60 rounded-xl overflow-hidden border border-slate-200 shadow-xs flex items-end p-5">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
                alt="Parks & Walking Tracks"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#FFD875] uppercase tracking-wider block">
                  2,878 sqm Greenery
                </span>
                <h3 className="text-lg font-bold">Parks & Walking Tracks</h3>
                <p className="text-xs text-slate-300">Central park areas and landscaped verges.</p>
              </div>
            </div>

            {/* Tile 2: Roads & Infrastructure */}
            <div className="group relative h-60 rounded-xl overflow-hidden border border-slate-200 shadow-xs flex items-end p-5">
              <img
                src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80"
                alt="Roads & Infrastructure"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#FFD875] uppercase tracking-wider block">
                  20,548 sqm Roads
                </span>
                <h3 className="text-lg font-bold">Roads & Infrastructure</h3>
                <p className="text-xs text-slate-300">Wide internal thoroughfares and demarcation.</p>
              </div>
            </div>

            {/* Tile 3: Solar Avenue Lighting */}
            <div className="group relative h-60 rounded-xl overflow-hidden border border-slate-200 shadow-xs flex items-end p-5">
              <img
                src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80"
                alt="Solar Lighting"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#FFD875] uppercase tracking-wider block">
                  Eco Lighting
                </span>
                <h3 className="text-lg font-bold">Solar Lights & Panels</h3>
                <p className="text-xs text-slate-300">Sustainable solar illumination along avenues.</p>
              </div>
            </div>

            {/* Tile 4: CCTV Surveillance */}
            <div className="group relative h-60 rounded-xl overflow-hidden border border-slate-200 shadow-xs flex items-end p-5">
              <img
                src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80"
                alt="CCTV Security"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#FFD875] uppercase tracking-wider block">
                  Safety First
                </span>
                <h3 className="text-lg font-bold">CCTV Surveillance</h3>
                <p className="text-xs text-slate-300">Continuous monitored gated security.</p>
              </div>
            </div>

            {/* Tile 5: Club House & Gym */}
            <div className="group relative h-60 rounded-xl overflow-hidden border border-slate-200 shadow-xs flex items-end p-5">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80"
                alt="Club House & Gym"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#FFD875] uppercase tracking-wider block">
                  Recreation
                </span>
                <h3 className="text-lg font-bold">Club House & Gym</h3>
                <p className="text-xs text-slate-300">Community fitness and gathering spaces.</p>
              </div>
            </div>

            {/* Tile 6: Devotional & Cultural Living */}
            <div className="group relative h-60 rounded-xl overflow-hidden border border-slate-200 shadow-xs flex items-end p-5">
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
                alt="Devotional Harmony"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#FFD875] uppercase tracking-wider block">
                  Braj Heritage
                </span>
                <h3 className="text-lg font-bold">Cultural Living</h3>
                <p className="text-xs text-slate-300">Calm environment near Vrindavan corridor.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. WHY COSY REALITY — SPLIT IMAGE / 4 CLEAN POINTS
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column Image (~50%) */}
            <div className="lg:col-span-6">
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg aspect-[4/3] bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80"
                  alt="Why Cosy Reality Planning"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column 4 Clean Points (~50%) */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E] block mb-2">
                  Our Principles
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#103858] tracking-tight">
                  Why Cosy Reality
                </h2>
              </div>

              <div className="space-y-4">
                {/* Point 1 */}
                <div className="p-4 rounded-xl bg-[#FAF8F3] border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#103858] flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-[#CCA02E]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#103858]">Trust & Transparency</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                      Accurate spatial data, genuine site plans and clear developer information.
                    </p>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="p-4 rounded-xl bg-[#FAF8F3] border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#103858] flex items-center justify-center shrink-0 shadow-2xs">
                    <Layers className="w-4 h-4 text-[#CCA02E]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#103858]">Live Property Availability</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                      Real-time inventory visibility distinguishing Open, Hold and Sold plots.
                    </p>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="p-4 rounded-xl bg-[#FAF8F3] border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#103858] flex items-center justify-center shrink-0 shadow-2xs">
                    <Calendar className="w-4 h-4 text-[#CCA02E]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#103858]">Professional Coordination</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                      Structured on-ground site visit scheduling and direct property desk advisory.
                    </p>
                  </div>
                </div>

                {/* Point 4 */}
                <div className="p-4 rounded-xl bg-[#FAF8F3] border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#103858] flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-4 h-4 text-[#CCA02E]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#103858]">Structured Documentation</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                      Step-by-step assistance through registration, allotment and verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          12. HOW IT WORKS — CLEAN 5-STEP PROCESS
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#FAF8F3]/60">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E]">
              Simple Advisory Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#103858] tracking-tight">
              How It Works
            </h2>
            <p className="text-sm text-slate-600">
              A smooth, transparent five-step process to explore and secure your property.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#103858] text-[#FFD875] text-xs font-bold flex items-center justify-center mx-auto">
                01
              </span>
              <h3 className="text-sm font-bold text-[#103858]">Discover</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Explore transparent plotted and residential listings.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#103858] text-[#FFD875] text-xs font-bold flex items-center justify-center mx-auto">
                02
              </span>
              <h3 className="text-sm font-bold text-[#103858]">Compare</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Evaluate layout sizes, facing, and spatial site plans.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#103858] text-[#FFD875] text-xs font-bold flex items-center justify-center mx-auto">
                03
              </span>
              <h3 className="text-sm font-bold text-[#103858]">Schedule Visit</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Coordinate an on-ground physical inspection with our desk.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#103858] text-[#FFD875] text-xs font-bold flex items-center justify-center mx-auto">
                04
              </span>
              <h3 className="text-sm font-bold text-[#103858]">Select Property</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Lock in verified unit availability and plot demarcations.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#103858] text-[#FFD875] text-xs font-bold flex items-center justify-center mx-auto">
                05
              </span>
              <h3 className="text-sm font-bold text-[#103858]">Documentation</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Complete structured paperwork, allotment, and handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          13. 15 YEARS EXPERIENCE / BRAND STORY — CINEMATIC FULL-WIDTH
          ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#081D2F] text-white relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"
          alt="15 Years Experience Real Estate"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#081D2F] via-[#081D2F]/90 to-[#081D2F]/70" />

        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xs text-xs font-bold text-[#FFD875]">
            <Award className="w-4 h-4 text-[#CCA02E]" />
            <span>Legacy of Professionalism</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            15 Years of Real Estate & Construction Understanding
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Built around thorough property understanding, structured processes, and long-term customer
            relationships across key regional growth corridors.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSiteVisitOpen(true)}
              className="h-[50px] px-8 rounded-lg bg-[#CCA02E] hover:bg-[#b88f26] text-[#103858] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#103858]" />
              <span>Schedule Site Visit</span>
            </button>
            <Link to="/about">
              <button className="h-[50px] px-8 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2">
                <span>Read Our Story</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          14. VISUAL GALLERY / STORY SECTION — ASYMMETRIC TILES WITH LIGHTBOX
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#CCA02E] block mb-1.5">
                On-Ground Visuals
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#103858] tracking-tight">
                Explore the Development
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md">
              A photo collection covering plotted avenues, site layouts and surrounding infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxImage(img.url)}
                className="group relative h-48 sm:h-64 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] text-[#FFD875] font-bold uppercase tracking-wider">
                    {img.subtitle}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold">{img.title}</h4>
                  <div className="pt-1 flex items-center gap-1 text-[11px] text-slate-300">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View photo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          15. FINAL SITE VISIT CTA — FULL-WIDTH IMAGE-BACKED
          ========================================================================= */}
      <section className="relative py-20 sm:py-28 bg-[#103858] text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
          alt="Site Visit Property Consultation"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[#091F33]/90" />

        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFD875]">
              Get in Touch
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Ready to Explore Your Next Property?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Check current availability or schedule an on-ground site visit with our property advisory
              team.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <Link to="/inventory">
              <button className="h-[52px] px-8 rounded-lg bg-transparent hover:bg-white/10 text-white border border-white/40 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#CCA02E]" />
                <span>Check Availability</span>
              </button>
            </Link>

            <button
              onClick={() => setSiteVisitOpen(true)}
              className="h-[52px] px-8 rounded-lg bg-[#CCA02E] hover:bg-[#b88f26] text-[#103858] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#103858]" />
              <span>Book Site Visit</span>
            </button>
          </div>

          {settings.phone && settings.phone.trim() !== '' && (
            <p className="text-xs text-slate-300 font-medium pt-2">
              Direct Phone Desk: <span className="text-white font-bold">{settings.phone}</span>
            </p>
          )}
        </div>
      </section>

      {/* =========================================================================
          LIGHTBOX MODAL & INTERACTION OVERLAYS
          ========================================================================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged Visual"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Interactive Feature Modals */}
      <InventoryModal
        item={selectedInventoryItem}
        isOpen={inventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
        onEnquire={(item, msg) => {
          setEnquireCustomMsg(msg || '');
          setEnquireOpen(true);
        }}
        onSiteVisit={(item) => {
          setSiteVisitOpen(true);
        }}
      />

      <SiteVisitModal
        isOpen={siteVisitOpen}
        onClose={() => setSiteVisitOpen(false)}
        initialProject={bansuriProject || undefined}
      />

      <EnquireModal
        isOpen={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        project={bansuriProject || undefined}
        customMessage={enquireCustomMsg}
      />
    </div>
  );
};
