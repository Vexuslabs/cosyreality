import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building, ArrowRight, ShieldCheck, Maximize2 } from 'lucide-react';
import { Project } from '../../types';
import { formatINR, formatINRShort, getProjectStatusBadge } from '../../utils/formatters';
import { Button } from '../ui/Button';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Ongoing':
        return {
          dotColor: 'text-[#16A34A]',
          label: '● ONGOING',
          bg: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
        };
      case 'Upcoming':
        return {
          dotColor: 'text-[#EAB308]',
          label: '● UPCOMING',
          bg: 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/20',
        };
      case 'Completed':
        return {
          dotColor: 'text-[#103858]',
          label: '● COMPLETED',
          bg: 'bg-[#103858]/10 text-[#103858] border-[#103858]/20',
        };
      default:
        return {
          dotColor: 'text-[#103858]',
          label: `● ${status.toUpperCase()}`,
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const statusInfo = getStatusDisplay(project.projectStatus);

  return (
    <div className="group bg-white rounded-xl border border-[#103858]/10 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Thumbnail / Hero Image */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#F7F4EC]">
        <img
          src={project.heroImage || project.thumbnail || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'}
          alt={project.projectName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#103858]/80 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span
            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border shadow-xs ${statusInfo.bg}`}
          >
            {statusInfo.label}
          </span>
          {project.featured && (
            <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#CCA02E] text-[#103858] shadow-xs">
              Featured
            </span>
          )}
        </div>

        {/* Property Type Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-[#103858] shadow-xs">
            {project.projectType}
          </span>
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-medium text-slate-100 flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#CCA02E] shrink-0" />
            <span>{project.location}, {project.city}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#103858] group-hover:text-[#CCA02E] transition-colors line-clamp-1">
            {project.projectName}
          </h3>

          <p className="text-xs text-[#172B3A]/70 line-clamp-2 mt-1.5 leading-relaxed">
            {project.shortDescription || project.description}
          </p>

          {/* Key Specs */}
          <div className="grid grid-cols-2 gap-2 pt-3.5 mt-3.5 border-t border-[#103858]/10 text-xs">
            {project.propertySizes && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Maximize2 className="w-3.5 h-3.5 text-[#CCA02E] shrink-0" />
                <span className="truncate">{project.propertySizes}</span>
              </div>
            )}
            {project.totalArea && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Building className="w-3.5 h-3.5 text-[#CCA02E] shrink-0" />
                <span className="truncate">{project.totalArea} Land</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3.5 border-t border-[#103858]/10 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] font-bold text-[#103858]/60 uppercase tracking-wider">
              {project.startingPrice && project.startingPrice > 0 ? 'Starting From' : 'Pricing'}
            </span>
            <span className="text-sm font-bold text-[#CCA02E]">
              {project.startingPrice && project.startingPrice > 0
                ? formatINR(project.startingPrice)
                : 'Price on Request'}
            </span>
          </div>

          <Link to={`/projects/${project.slug}`}>
            <button className="bg-[#103858] text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider hover:bg-[#0a263c] transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5">
              <span>View Details</span>
              <ArrowRight className="w-3 h-3 text-[#CCA02E]" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
