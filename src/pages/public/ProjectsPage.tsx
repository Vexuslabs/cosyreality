import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Search, Filter, Sparkles, MapPin } from 'lucide-react';
import { Project } from '../../types';
import { getProjects } from '../../services/projectsService';
import { ProjectCard } from '../../components/public/ProjectCard';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDocumentTitle } from '../../utils/seo';

export const ProjectsPage: React.FC = () => {
  useDocumentTitle('Explore Real Estate Projects — Cosy Reality');
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.warn('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.projectName?.toLowerCase().includes(q);
        const matchesLoc = (p.location || '').toLowerCase().includes(q) || (p.city || '').toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q) || (p.shortDescription || '').toLowerCase().includes(q);
        const matchesType = (p.projectType || '').toLowerCase().includes(q);
        const matchesComponents = p.components?.some((c) => c.toLowerCase().includes(q));
        const matchesHighlights = p.highlights?.some((h) => h.toLowerCase().includes(q));
        if (!matchesName && !matchesLoc && !matchesDesc && !matchesType && !matchesComponents && !matchesHighlights) {
          return false;
        }
      }

      // Property Type
      if (selectedType !== 'all' && p.projectType.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && p.projectStatus.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }

      // City
      if (selectedCity !== 'all' && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [projects, searchQuery, selectedType, selectedStatus, selectedCity]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 sm:py-16">
      <Container>
        {/* Header Title */}
        <SectionHeading
          badge="Property Portfolio"
          title="Explore Developments & Townships"
          subtitle="Explore prime residential apartments, freehold plotted sectors, and premium commercial projects with verified approvals."
        />

        {/* Filter / Search Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm mb-10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by project name or locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white cursor-pointer"
              >
                <option value="all">All Property Types</option>
                <option value="Plotted Development">Plotted Development</option>
                <option value="Residential">Residential Apartments</option>
                <option value="Commercial">Commercial & Retail</option>
                <option value="Villas">Villas</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white cursor-pointer"
              >
                <option value="all">All Project Statuses</option>
                <option value="Ongoing">Ongoing / Under Construction</option>
                <option value="Upcoming">Upcoming Launch</option>
                <option value="Completed">Ready to Move / Completed</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white cursor-pointer"
              >
                <option value="all">All Locations</option>
                <option value="Noida">Noida</option>
                <option value="Greater Noida">Greater Noida</option>
                <option value="Yamuna Expressway">Yamuna Expressway</option>
                <option value="Delhi NCR">Delhi NCR</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Showing {filteredProjects.length} projects</span>
            {(searchQuery || selectedType !== 'all' || selectedStatus !== 'all' || selectedCity !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setSelectedCity('all');
                }}
                className="text-[#103858] font-bold hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white h-96 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects match your selected filters"
            message="Try clearing or adjusting your search parameters to explore other projects."
            actionLabel="View All Projects"
            onAction={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedStatus('all');
              setSelectedCity('all');
            }}
          />
        )}
      </Container>
    </div>
  );
};
