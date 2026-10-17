import React, { useState, useEffect } from 'react';
import {
  Building,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Sparkles,
  Eye,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { Project, ProjectType, ProjectStatus } from '../../types';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../../services/projectsService';
import { formatINR, getProjectStatusBadge, generateSlug } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useDocumentTitle } from '../../utils/seo';

export const AdminProjectsPage: React.FC = () => {
  useDocumentTitle('Projects Management — Cosy Reality Admin');
  const { isSuperAdmin, isSalesAdmin } = useAuth();
  const { addToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    projectName: '',
    slug: '',
    location: '',
    city: 'Noida',
    state: 'Uttar Pradesh',
    projectType: 'Plotted Development' as ProjectType,
    projectStatus: 'Ongoing' as ProjectStatus,
    startingPrice: 3500000,
    propertySizes: '100 Sq. Yards to 500 Sq. Yards',
    totalArea: '25 Acres',
    reraNumber: '',
    launchDate: '2024',
    possessionDate: 'Ready for Registry',
    heroImage: '',
    thumbnail: '',
    masterPlanUrl: '',
    videoUrl: '',
    brochureUrl: '',
    shortDescription: '',
    description: '',
    highlights: ['Freehold Land with Clear Registry', 'Wide 30ft & 40ft Internal Roads', 'Electricity & Water Supply Ready', 'Gated Sector with 24/7 Security'],
    featured: true,
  });

  const [highlightInput, setHighlightInput] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.warn('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      projectName: '',
      slug: '',
      location: '',
      city: 'Noida',
      state: 'Uttar Pradesh',
      projectType: 'Plotted Development',
      projectStatus: 'Ongoing',
      startingPrice: 3500000,
      propertySizes: '100 Sq. Yards to 500 Sq. Yards',
      totalArea: '25 Acres',
      reraNumber: '',
      launchDate: '2024',
      possessionDate: 'Ready for Registry',
      heroImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80',
      masterPlanUrl: '',
      videoUrl: '',
      brochureUrl: '',
      shortDescription: '',
      description: '',
      highlights: ['Freehold Land with Clear Registry', 'Wide 30ft & 40ft Internal Roads', 'Electricity & Water Supply Ready', 'Gated Sector with 24/7 Security'],
      featured: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setFormData({
      projectName: p.projectName,
      slug: p.slug,
      location: p.location,
      city: p.city,
      state: p.state || 'Uttar Pradesh',
      projectType: p.projectType,
      projectStatus: p.projectStatus,
      startingPrice: p.startingPrice,
      propertySizes: p.propertySizes || '',
      totalArea: p.totalArea || '',
      reraNumber: p.reraNumber || '',
      launchDate: p.launchDate || '',
      possessionDate: p.possessionDate || '',
      heroImage: p.heroImage || '',
      thumbnail: p.thumbnail || '',
      masterPlanUrl: p.masterPlanUrl || '',
      videoUrl: p.videoUrl || '',
      brochureUrl: p.brochureUrl || '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      highlights: p.highlights || [],
      featured: p.featured || false,
    });
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      projectName: name,
      slug: editingProject ? prev.slug : generateSlug(name),
    }));
  };

  const handleAddHighlight = () => {
    if (highlightInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        highlights: [...prev.highlights, highlightInput.trim()],
      }));
      setHighlightInput('');
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName.trim() || !formData.location.trim()) {
      addToast('error', 'Required Fields', 'Please provide project name and location.');
      return;
    }

    try {
      setSaving(true);
      if (editingProject) {
        await updateProject(editingProject.id, formData);
        addToast('success', 'Project Updated', `${formData.projectName} has been successfully updated.`);
      } else {
        await createProject({
          ...formData,
          slug: formData.slug || generateSlug(formData.projectName),
        });
        addToast('success', 'Project Created', `${formData.projectName} is now active.`);
      }
      setModalOpen(false);
      await loadProjects();
    } catch (err: any) {
      addToast('error', 'Save Failed', err?.message || 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleting(true);
      await deleteProject(projectToDelete.id);
      addToast('success', 'Project Deleted', `${projectToDelete.projectName} has been removed.`);
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      await loadProjects();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err?.message || 'Unable to delete project.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.projectName.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#103858]">Projects & Townships</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage residential, plotted land, and commercial developments
          </p>
        </div>

        {(isSuperAdmin || isSalesAdmin) && (
          <Button
            variant="gold"
            size="md"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4 text-[#103858]" />}
            className="font-bold shadow-sm"
          >
            Add New Project
          </Button>
        )}
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search projects by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {projects.length} projects
        </span>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F3] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Project Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Starting Price</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const statusBadge = getProjectStatusBadge(p.projectStatus);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail || p.heroImage || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=200&q=80'}
                            alt={p.projectName}
                            referrerPolicy="no-referrer"
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-[#103858] text-sm block">
                              {p.projectName}
                            </span>
                            <span className="text-[11px] text-slate-500">{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">{p.projectType}</td>
                      <td className="py-4 px-4 text-slate-600">
                        <span className="truncate block max-w-[160px]">
                          {p.location}, {p.city}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                        >
                          {p.projectStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#103858]">
                        {formatINR(p.startingPrice)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/projects/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-[#103858] rounded-lg hover:bg-slate-100"
                            title="View live page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          {(isSuperAdmin || isSalesAdmin) && (
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                              title="Edit project"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setProjectToDelete(p);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        size="xl"
        title={editingProject ? `Edit: ${editingProject.projectName}` : 'Create New Development'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Name"
              placeholder="e.g. Cosy Green Meadows"
              required
              value={formData.projectName}
              onChange={(e) => handleNameChange(e.target.value)}
            />

            <Input
              label="URL Slug"
              placeholder="e.g. cosy-green-meadows"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Location / Sector"
              placeholder="e.g. Sector 150 / Pari Chowk"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />

            <Input
              label="City"
              placeholder="e.g. Noida / Greater Noida"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
                Property Type
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
              >
                <option value="Plotted Development">Plotted Development</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Villas">Villas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
                Project Status
              </label>
              <select
                value={formData.projectStatus}
                onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value as ProjectStatus })}
                className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
              >
                <option value="Ongoing">Ongoing / Under Construction</option>
                <option value="Upcoming">Upcoming Launch</option>
                <option value="Completed">Ready to Move / Completed</option>
              </select>
            </div>

            <Input
              label="Starting Price (₹ INR)"
              type="number"
              value={formData.startingPrice}
              onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
            />

            <Input
              label="RERA Registration No."
              placeholder="e.g. UPRERAPRJ123456"
              value={formData.reraNumber}
              onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Plot / Property Sizes"
              placeholder="e.g. 100 to 500 Sq. Yards"
              value={formData.propertySizes}
              onChange={(e) => setFormData({ ...formData, propertySizes: e.target.value })}
            />

            <Input
              label="Total Land Area"
              placeholder="e.g. 25 Acres"
              value={formData.totalArea}
              onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
            />
          </div>

          {/* Media Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUploader
              label="Hero Banner Image"
              value={formData.heroImage}
              onChange={(url) => setFormData({ ...formData, heroImage: url })}
              storagePath="projects/hero"
            />

            <ImageUploader
              label="Approved Master Layout Plan"
              value={formData.masterPlanUrl}
              onChange={(url) => setFormData({ ...formData, masterPlanUrl: url })}
              storagePath="projects/masterplans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="YouTube Walkthrough Video URL"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            />

            <Input
              label="PDF Brochure Download URL"
              placeholder="https://..."
              value={formData.brochureUrl}
              onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })}
            />
          </div>

          <Textarea
            label="Short Description (Card Summary)"
            rows={2}
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          />

          <Textarea
            label="Full Detailed Description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Highlights Builder */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
              Project Highlights & Amenities
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add highlight (e.g. 24/7 Gated Security, Wide Roads)..."
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHighlight();
                  }
                }}
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddHighlight}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.highlights.map((h, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF8F3] border border-slate-200 text-[#103858]"
                >
                  <span>{h}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featuredToggle"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 rounded text-[#103858] focus:ring-[#103858] cursor-pointer"
            />
            <label htmlFor="featuredToggle" className="text-xs font-semibold text-[#103858] cursor-pointer">
              Feature this project on Homepage Prime Portfolio
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={saving} className="font-bold">
              {editingProject ? 'Save Changes' : 'Create Development'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.projectName}"? This cannot be undone.`}
      />
    </div>
  );
};
