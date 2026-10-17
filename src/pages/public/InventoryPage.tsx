import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Grid,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Layers,
  Sparkles,
  Building2,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { InventoryItem, Project, InventoryStatus } from '../../types';
import { getInventoryItems } from '../../services/inventoryService';
import { getProjects } from '../../services/projectsService';
import { InventoryCard } from '../../components/public/InventoryCard';
import { InventoryModal } from '../../components/public/InventoryModal';
import { SiteVisitModal } from '../../components/public/SiteVisitModal';
import { EnquireModal } from '../../components/public/EnquireModal';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { useDocumentTitle } from '../../utils/seo';

export const InventoryPage: React.FC = () => {
  useDocumentTitle('Live Real Estate Inventory — Cosy Reality');
  const [searchParams, setSearchParams] = useSearchParams();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project') || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedFacing, setSelectedFacing] = useState(searchParams.get('facing') || 'all');
  const [selectedBlock, setSelectedBlock] = useState(searchParams.get('block') || 'all');
  const [priceRange, setPriceRange] = useState(searchParams.get('budget') || 'all');

  // Modals
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [customEnquiryMsg, setCustomEnquiryMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [items, projList] = await Promise.all([
          getInventoryItems(),
          getProjects(),
        ]);
        setInventory(items);
        setProjects(projList);
      } catch (err) {
        console.warn('Error loading inventory:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute Live Status Metrics
  const stats = useMemo(() => {
    let booking = 0;
    let waiting = 0;
    let sold = 0;

    inventory.forEach((item) => {
      if (item.status === 'booking') booking++;
      else if (item.status === 'waiting') waiting++;
      else if (item.status === 'sold') sold++;
    });

    return {
      total: inventory.length,
      booking,
      waiting,
      sold,
    };
  }, [inventory]);

  // Unique Blocks for filter
  const uniqueBlocks = useMemo(() => {
    const blocks = new Set<string>();
    inventory.forEach((i) => {
      if (i.block) blocks.add(i.block);
    });
    return Array.from(blocks).sort();
  }, [inventory]);

  // Filtered List
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const num = (item.unitNumber || item.plotNumber || '').toLowerCase();
        const pName = (item.projectName || '').toLowerCase();
        if (!num.includes(q) && !pName.includes(q)) return false;
      }

      // Project
      if (selectedProjectId !== 'all' && item.projectId !== selectedProjectId) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // Type
      if (selectedType !== 'all' && item.propertyType?.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }

      // Facing
      if (selectedFacing !== 'all' && item.facing?.toLowerCase() !== selectedFacing.toLowerCase()) {
        return false;
      }

      // Block
      if (selectedBlock !== 'all' && item.block !== selectedBlock) {
        return false;
      }

      // Price Range
      if (priceRange !== 'all') {
        const price = item.finalPrice || 0;
        if (priceRange === 'under-50l' && price > 5000000) return false;
        if (priceRange === '50l-1cr' && (price < 5000000 || price > 10000000)) return false;
        if (priceRange === '1cr-2cr' && (price < 10000000 || price > 20000000)) return false;
        if (priceRange === 'above-2cr' && price < 20000000) return false;
      }

      return true;
    });
  }, [
    inventory,
    searchQuery,
    selectedProjectId,
    selectedStatus,
    selectedType,
    selectedFacing,
    selectedBlock,
    priceRange,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProjectId('all');
    setSelectedStatus('all');
    setSelectedType('all');
    setSelectedFacing('all');
    setSelectedBlock('all');
    setPriceRange('all');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-10 sm:py-16">
      <Container>
        {/* Page Heading */}
        <SectionHeading
          badge="Live Property Matrix"
          title="Real-Time Property & Plot Inventory"
          subtitle="Direct live status of units and plots across all approved Cosy Reality developments. Updated in real-time."
        />

        {/* 1. Status Filter Pills Bar (Green / Yellow / Red) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
          {/* All */}
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStatus === 'all'
                ? 'bg-[#103858] text-white border-[#103858] shadow-md'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">All Properties</span>
              <Layers className={`w-4 h-4 ${selectedStatus === 'all' ? 'text-[#CCA02E]' : 'text-slate-400'}`} />
            </div>
            <span className="text-2xl font-black block mt-2">{stats.total}</span>
          </button>

          {/* Booking Open (Green) */}
          <button
            type="button"
            onClick={() => setSelectedStatus('booking')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStatus === 'booking'
                ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-md ring-2 ring-emerald-300'
                : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Booking Open
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            </div>
            <span className={`text-2xl font-black block mt-2 ${selectedStatus === 'booking' ? 'text-white' : 'text-emerald-700'}`}>
              {stats.booking}
            </span>
          </button>

          {/* Waiting / Hold (Yellow) */}
          <button
            type="button"
            onClick={() => setSelectedStatus('waiting')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStatus === 'waiting'
                ? 'bg-[#EAB308] text-[#103858] border-[#EAB308] shadow-md ring-2 ring-amber-300 font-extrabold'
                : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Waiting / Hold
              </span>
              <Clock className="w-4 h-4 text-[#EAB308]" />
            </div>
            <span className={`text-2xl font-black block mt-2 ${selectedStatus === 'waiting' ? 'text-[#103858]' : 'text-amber-700'}`}>
              {stats.waiting}
            </span>
          </button>

          {/* Sold (Red) */}
          <button
            type="button"
            onClick={() => setSelectedStatus('sold')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStatus === 'sold'
                ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-md ring-2 ring-rose-300'
                : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Sold
              </span>
              <XCircle className="w-4 h-4 text-[#DC2626]" />
            </div>
            <span className={`text-2xl font-black block mt-2 ${selectedStatus === 'sold' ? 'text-white' : 'text-rose-700'}`}>
              {stats.sold}
            </span>
          </button>
        </div>

        {/* 2. Comprehensive Filter Toolbar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="relative xl:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Plot/Unit no. or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white"
              />
            </div>

            {/* Project Filter */}
            <div>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white cursor-pointer"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="Plot">Plot / Land</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Facing */}
            <div>
              <select
                value={selectedFacing}
                onChange={(e) => setSelectedFacing(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white cursor-pointer"
              >
                <option value="all">All Facings</option>
                <option value="North">North</option>
                <option value="East">East (Park Facing)</option>
                <option value="North-East">North-East</option>
                <option value="West">West</option>
                <option value="South">South</option>
              </select>
            </div>

            {/* Budget / Price Range */}
            <div>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white cursor-pointer"
              >
                <option value="all">Any Price</option>
                <option value="under-50l">Under ₹50 Lakh</option>
                <option value="50l-1cr">₹50 Lakh - ₹1 Crore</option>
                <option value="1cr-2cr">₹1 Crore - ₹2 Crore</option>
                <option value="above-2cr">Above ₹2 Crore</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing <strong>{filteredInventory.length}</strong> of {inventory.length} total units
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[#103858] font-bold hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>

        {/* 3. Inventory Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white h-64 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredInventory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInventory.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onSelect={(selected) => {
                  setActiveItem(selected);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : inventory.length === 0 ? (
          <EmptyState
            title="No properties are currently available in the inventory."
            message="Our team is preparing new sector inventory listings. Please connect with our sales desk."
            actionLabel="Schedule Site Visit"
            onAction={() => setSiteVisitOpen(true)}
          />
        ) : (
          <EmptyState
            title="No properties match your selected filters."
            message="Try widening your price range or clearing selected blocks to view available properties."
            actionLabel="Clear Filters"
            onAction={handleResetFilters}
          />
        )}
      </Container>

      {/* Modals */}
      <InventoryModal
        item={activeItem}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onEnquire={(item, msg) => {
          setCustomEnquiryMsg(msg || '');
          setEnquireOpen(true);
        }}
        onSiteVisit={(item) => {
          setSiteVisitOpen(true);
        }}
        onFilterSimilar={(propertyType) => {
          if (propertyType) setSelectedType(propertyType);
          setSelectedStatus('booking');
        }}
      />

      <SiteVisitModal
        isOpen={siteVisitOpen}
        onClose={() => setSiteVisitOpen(false)}
        initialItem={activeItem}
      />

      <EnquireModal
        isOpen={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        item={activeItem}
        customMessage={customEnquiryMsg}
      />
    </div>
  );
};
