import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, IndianRupee, Layers } from 'lucide-react';
import { Button } from '../ui/Button';

interface PropertySearchBarProps {
  initialLocation?: string;
  initialType?: string;
  initialBudget?: string;
  initialProject?: string;
}

export const PropertySearchBar: React.FC<PropertySearchBarProps> = ({
  initialLocation = '',
  initialType = '',
  initialBudget = '',
  initialProject = '',
}) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(initialLocation);
  const [propertyType, setPropertyType] = useState(initialType);
  const [budget, setBudget] = useState(initialBudget);
  const [mode, setMode] = useState<'projects' | 'inventory'>('projects');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append('city', location);
    if (propertyType && propertyType !== 'all') params.append('type', propertyType);
    if (budget && budget !== 'all') params.append('budget', budget);

    if (mode === 'inventory') {
      navigate(`/inventory?${params.toString()}`);
    } else {
      navigate(`/projects?${params.toString()}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-[#103858]/10 p-5 sm:p-6 transition-all">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#103858]/10">
        <button
          type="button"
          onClick={() => setMode('projects')}
          className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-all cursor-pointer ${
            mode === 'projects'
              ? 'bg-[#103858] text-white shadow-xs'
              : 'text-[#103858] hover:text-[#CCA02E] bg-[#F7F4EC]'
          }`}
        >
          Explore Projects
        </button>
        <button
          type="button"
          onClick={() => setMode('inventory')}
          className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
            mode === 'inventory'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'text-[#16A34A] hover:bg-[#16A34A]/20 bg-[#16A34A]/10'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          <span>Live Inventory (Units & Plots)</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#103858] uppercase tracking-wider">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-[#F7F4EC] border-none rounded p-2.5 text-xs text-[#172B3A] focus:ring-1 focus:ring-[#CCA02E] outline-none cursor-pointer"
          >
            <option value="">Select Location</option>
            <option value="Noida">Noida</option>
            <option value="Greater Noida">Greater Noida</option>
            <option value="Yamuna Expressway">Yamuna Expressway</option>
            <option value="Delhi NCR">Delhi NCR</option>
          </select>
        </div>

        {/* Property Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#103858] uppercase tracking-wider">
            Type
          </label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full bg-[#F7F4EC] border-none rounded p-2.5 text-xs text-[#172B3A] focus:ring-1 focus:ring-[#CCA02E] outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Plotted Development">Plotted</option>
            <option value="Villas">Villas</option>
          </select>
        </div>

        {/* Budget */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#103858] uppercase tracking-wider">
            Budget
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full bg-[#F7F4EC] border-none rounded p-2.5 text-xs text-[#172B3A] focus:ring-1 focus:ring-[#CCA02E] outline-none cursor-pointer"
          >
            <option value="all">Any Budget</option>
            <option value="under-50l">Under ₹50L</option>
            <option value="50l-1cr">₹50L - ₹1Cr</option>
            <option value="1cr-2cr">₹1Cr - ₹2Cr</option>
            <option value="above-2cr">Above ₹2Cr</option>
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-[#103858] text-white w-full py-2.5 rounded font-bold text-xs uppercase tracking-widest hover:bg-[#0a263c] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 h-9.5"
          >
            <Search className="w-3.5 h-3.5 text-[#CCA02E]" />
            <span>Search Property</span>
          </button>
        </div>
      </form>
    </div>
  );
};
