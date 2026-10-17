import React, { useState, useEffect } from 'react';
import {
  Quote,
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { Testimonial } from '../../types';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../../services/testimonialsService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useDocumentTitle } from '../../utils/seo';

export const AdminTestimonialsPage: React.FC = () => {
  useDocumentTitle('Testimonials & Reviews — Cosy Reality Admin');
  const { isSuperAdmin } = useAuth();
  const { addToast } = useToast();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    projectName: '',
    rating: 5,
    review: '',
    featured: true,
  });

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.warn('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      designation: 'Property Owner / Investor',
      projectName: 'Cosy Green Meadows',
      rating: 5,
      review: '',
      featured: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingItem(t);
    setFormData({
      name: t.name,
      designation: t.designation || '',
      projectName: t.projectName || '',
      rating: t.rating || 5,
      review: t.review,
      featured: t.featured || false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.review.trim()) {
      addToast('error', 'Required Fields', 'Please enter client name and review text.');
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        await updateTestimonial(editingItem.id, formData);
        addToast('success', 'Updated', 'Testimonial has been updated.');
      } else {
        await createTestimonial(formData);
        addToast('success', 'Created', 'New client testimonial added.');
      }
      setModalOpen(false);
      await loadReviews();
    } catch (err: any) {
      addToast('error', 'Save Failed', err?.message || 'Unable to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await deleteTestimonial(itemToDelete.id);
      addToast('success', 'Deleted', 'Testimonial removed.');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      await loadReviews();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err?.message || 'Unable to delete review.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#103858]">Client Reviews & Trust Testimonials</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showcase verified buyer experiences across 15 years of construction & plotted developments
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4 text-[#103858]" />}
          className="font-bold shadow-sm"
        >
          Add Client Review
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-[#CCA02E]">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#CCA02E]" />
                  ))}
                </div>
                {t.featured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#CCA02E]/20 text-[#103858] border border-[#CCA02E]/40 uppercase">
                    Featured
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "{t.review}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
              <div>
                <h4 className="font-extrabold text-sm text-[#103858]">{t.name}</h4>
                <p className="text-[11px] text-slate-500">
                  {t.designation} • {t.projectName}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setItemToDelete(t);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        size="md"
        title={editingItem ? 'Edit Review' : 'Add Client Review'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Client Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Designation / Occupation"
              placeholder="e.g. Senior Tech Lead / Investor"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />

            <Input
              label="Purchased Project"
              placeholder="e.g. Cosy Green Meadows"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
              Rating
            </label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
            >
              <option value={5}>5 Stars (Exceptional)</option>
              <option value={4}>4 Stars (Good)</option>
              <option value={3}>3 Stars (Average)</option>
            </select>
          </div>

          <Textarea
            label="Review Text"
            rows={4}
            required
            value={formData.review}
            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="revFeatured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 rounded text-[#103858] focus:ring-[#103858]"
            />
            <label htmlFor="revFeatured" className="text-xs font-bold text-[#103858] cursor-pointer">
              Feature on Homepage Carousel
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={saving} className="font-bold">
              Save Review
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Testimonial"
        message="Are you sure you want to remove this client review?"
      />
    </div>
  );
};
