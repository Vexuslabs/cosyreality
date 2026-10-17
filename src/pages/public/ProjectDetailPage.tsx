import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building,
  Calendar,
  Download,
  Share2,
  PhoneCall,
  CheckCircle2,
  Maximize2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Video,
  Layers,
  ArrowLeft,
  Eye,
  X,
  FileText,
  Compass,
} from 'lucide-react';
import { Project, InventoryItem } from '../../types';
import { getProjectBySlug } from '../../services/projectsService';
import { getInventoryByProject } from '../../services/inventoryService';
import { formatINR, getProjectStatusBadge } from '../../utils/formatters';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { InventoryCard } from '../../components/public/InventoryCard';
import { InventoryModal } from '../../components/public/InventoryModal';
import { SiteVisitModal } from '../../components/public/SiteVisitModal';
import { EnquireModal } from '../../components/public/EnquireModal';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../utils/seo';

// Bansuri Dham Specific Modular Components
import { BansuriQuickFacts } from '../../components/public/project/BansuriQuickFacts';
import { BansuriAreaBreakdown } from '../../components/public/project/BansuriAreaBreakdown';
import { BansuriSitePlan } from '../../components/public/project/BansuriSitePlan';
import { BansuriComponentsGrid } from '../../components/public/project/BansuriComponentsGrid';
import { BansuriConnectivitySection } from '../../components/public/project/BansuriConnectivitySection';
import { BansuriRouteMap } from '../../components/public/project/BansuriRouteMap';
import { BansuriAmenitiesSection } from '../../components/public/project/BansuriAmenitiesSection';
import { BansuriDevotionalSection } from '../../components/public/project/BansuriDevotionalSection';
import { BansuriDeveloperSection } from '../../components/public/project/BansuriDeveloperSection';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { settings } = useSettings();

  const [project, setProject] = useState<Project | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery Modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Modals
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [enquireCustomMsg, setEnquireCustomMsg] = useState('');

  useDocumentTitle(
    project
      ? `${project.projectName} Yamuna Expressway | Cosy Reality`
      : 'Project Details'
  );

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        setLoading(true);
        const p = await getProjectBySlug(slug);
        if (p) {
          setProject(p);
          const items = await getInventoryByProject(p.id);
          setInventoryItems(items);
        }
      } catch (err) {
        console.warn('Failed to load project details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] py-20 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#103858] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] py-20 flex items-center justify-center">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#103858]">Project Not Found</h2>
          <p className="text-sm text-slate-600 mt-2 mb-6">
            The project you are looking for might have been archived or moved.
          </p>
          <Link to="/projects">
            <Button variant="primary" size="md">
              Browse All Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getProjectStatusBadge(project.projectStatus);
  const isBansuri = project.slug === 'bansuri-dham' || project.projectName.toLowerCase().includes('bansuri');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.projectName,
        text: `Check out ${project.projectName} by Cosy Reality`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('info', 'Link Copied', 'Project link has been copied to your clipboard.');
    }
  };

  const handleBrochure = () => {
    if (project.brochureUrl && project.brochureUrl.trim() !== '') {
      window.open(project.brochureUrl, '_blank');
    } else {
      setEnquireCustomMsg(`I would like to request the official brochure and availability for ${project.projectName}.`);
      setEnquireOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-24">
      {/* Breadcrumb & Top Bar */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sticky top-16 z-30 shadow-2xs">
        <Container>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <Link to="/projects" className="hover:text-[#103858] flex items-center gap-1 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Projects</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-bold text-[#103858] truncate">{project.projectName}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#103858] hover:text-[#CCA02E] transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => setSiteVisitOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#CCA02E] text-[#103858] hover:bg-[#b88f26] transition-all cursor-pointer shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Site Visit</span>
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero Banner with Devotional / Plotted Landscape Atmosphere */}
      <section className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-[520px] w-full overflow-hidden bg-[#0A2238] flex items-end">
        <img
          src={project.heroImage || project.thumbnail || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80'}
          alt={project.projectName}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081B2D] via-[#0A2238]/60 to-transparent" />

        {/* Devotional decorative glow for Bansuri Dham */}
        {isBansuri && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#CCA02E]/15 rounded-full blur-3xl pointer-events-none" />
        )}

        <Container className="relative z-10 text-white py-10 sm:py-14 w-full">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                >
                  {project.projectStatus}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs text-white">
                  {project.projectType}
                </span>
                {project.reraNumber && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#CCA02E]/20 border border-[#CCA02E]/40 text-[#CCA02E]">
                    RERA: {project.reraNumber}
                  </span>
                )}
                {isBansuri && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#CCA02E]/25 text-[#FFD875] border border-[#CCA02E]/50 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Vrindavan Farms Corridor</span>
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white">
                  {project.projectName}
                </h1>
                {isBansuri && (
                  <p className="text-xs sm:text-sm text-[#FFD875] font-medium tracking-wide mt-1">
                    Bansuri Dham Vrindavan Farms • Plotted Development
                  </p>
                )}
              </div>

              <p className="text-sm sm:text-base text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#CCA02E] shrink-0" />
                <span>{project.location}, {project.city}</span>
              </p>

              {/* Quick Hero Actions */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <a href="#inventory-section">
                  <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#103858] hover:bg-slate-100 transition-all shadow-md cursor-pointer flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#103858]" />
                    <span>Check Live Availability</span>
                  </button>
                </a>
                <button
                  onClick={() => setSiteVisitOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#CCA02E] text-[#103858] hover:bg-[#b88f26] transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Site Visit</span>
                </button>
                {project.brochureUrl ? (
                  <button
                    onClick={handleBrochure}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Brochure</span>
                  </button>
                ) : (
                  <button
                    onClick={handleBrochure}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Request Details & Brochure</span>
                  </button>
                )}
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-left sm:text-right shrink-0">
              <span className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                {project.startingPrice && project.startingPrice > 0 ? 'Starting Price' : 'Pricing Guidance'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#CCA02E]">
                {project.startingPrice && project.startingPrice > 0
                  ? formatINR(project.startingPrice)
                  : 'Price on Request'}
              </span>
              <span className="block text-[10px] text-slate-300 mt-1">
                {project.startingPrice && project.startingPrice > 0
                  ? 'Base plot rates apply'
                  : 'Connect with sales desk for plot schedule'}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content Sections */}
      <Container className="mt-8 sm:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8 sm:space-y-10">
            {/* 1. Quick Facts Section */}
            <BansuriQuickFacts project={project} />

            {/* 2. Overview & About */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider">
                  Development Overview
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#103858] mt-0.5">
                  About {project.projectName}
                </h2>
              </div>
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-3">
                <p className="font-medium text-[#103858]">
                  {project.shortDescription}
                </p>
                <p>
                  {project.description}
                </p>
              </div>
            </div>

            {/* 3. Site Area Breakdown (Verified Brochure Data) */}
            <BansuriAreaBreakdown />

            {/* 4. Township Site Plan Layout (Interactive Blueprint) */}
            <BansuriSitePlan
              sitePlanUrl={project.sitePlanUrl}
              projectName={project.projectName}
            />

            {/* 5. Project Components (A Complete Development Mix) */}
            <BansuriComponentsGrid />

            {/* 6. Connectivity & Surrounding Development */}
            <BansuriConnectivitySection />

            {/* 7. Route Map & Regional Corridor */}
            <BansuriRouteMap
              routeMapUrl={project.routeMapUrl}
              googleMapsUrl={project.googleMapsUrl}
            />

            {/* 8. Planned Amenities & Infrastructure */}
            <BansuriAmenitiesSection />

            {/* 9. Devotional & Cultural Lifestyle Theme */}
            <BansuriDevotionalSection />

            {/* 10. Live Project Inventory (Units & Plots) */}
            <div id="inventory-section" className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#CCA02E]">
                    Direct Availability
                  </span>
                  <h3 className="text-xl font-extrabold text-[#103858]">
                    Live Inventory Status for {project.projectName}
                  </h3>
                </div>
                <Link
                  to={`/inventory?project=${project.id}`}
                  className="text-xs font-bold text-[#103858] hover:underline flex items-center gap-1"
                >
                  <span>Filter in Full Inventory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {inventoryItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inventoryItems.map((item) => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      onSelect={(selected) => {
                        setSelectedInventoryItem(selected);
                        setInventoryModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-[#FAF8F3] rounded-2xl border border-slate-200">
                  <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-[#103858]">Live inventory is being updated</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    Live inventory for Bansuri Dham is being updated. Please contact the property team for current availability and phase allocations.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setEnquireCustomMsg(`I am inquiring about plot availability and phase allocation for ${project.projectName}.`);
                      setEnquireOpen(true);
                    }}
                  >
                    Request Plot Availability
                  </Button>
                </div>
              )}
            </div>

            {/* 11. Project Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider">
                    Visual Showcase
                  </span>
                  <h3 className="text-xl font-bold text-[#103858]">Project Visuals & Landscapes</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.gallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className="group relative h-36 sm:h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer"
                    >
                      <img
                        src={imgUrl}
                        alt={`${project.projectName} visual ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 12. Developer & Associated Projects */}
            <BansuriDeveloperSection
              developerInfo={project.developerInfo}
              associatedProjects={project.associatedProjects}
            />
          </div>

          {/* Sticky Sidebar Action Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-32 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5">
              <div>
                <span className="text-xs font-bold text-[#CCA02E] uppercase tracking-wider">
                  Property Advisory Desk
                </span>
                <h3 className="text-xl font-bold text-[#103858] mt-1">
                  Interested in {project.projectName}?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Check current availability, request project details or schedule an on-ground site visit with our team.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full font-bold shadow-md"
                  onClick={() => setSiteVisitOpen(true)}
                  leftIcon={<Calendar className="w-4 h-4 text-[#103858]" />}
                >
                  Schedule Site Visit
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setEnquireCustomMsg(`I am interested in ${project.projectName} at 58 KM Milestone Yamuna Expressway. Please provide pricing and plot availability.`);
                    setEnquireOpen(true);
                  }}
                >
                  Request Project Details
                </Button>

                {project.brochureUrl ? (
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={handleBrochure}
                    leftIcon={<Download className="w-4 h-4 text-slate-600" />}
                  >
                    Download Official Brochure
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={handleBrochure}
                    leftIcon={<FileText className="w-4 h-4 text-slate-600" />}
                  >
                    Request Project Brochure
                  </Button>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>58 KM Yamuna Expressway milestone</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Jewar International Airport corridor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Freehold plotted & farm parcels</span>
                </div>
              </div>

              {settings.phone && settings.phone.trim() !== '' && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-[#103858]">
                  <PhoneCall className="w-4 h-4 text-[#CCA02E]" />
                  <span>Call Property Desk: {settings.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Project Visual"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
          />
        </div>
      )}

      {/* Modals */}
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
        initialProject={project}
      />

      <EnquireModal
        isOpen={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        project={project}
        customMessage={enquireCustomMsg}
      />
    </div>
  );
};
