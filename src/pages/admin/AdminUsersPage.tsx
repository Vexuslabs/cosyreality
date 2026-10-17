import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Mail,
  UserCheck,
} from 'lucide-react';
import { UserProfile, AdminRole } from '../../types';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/usersService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';
import { useDocumentTitle } from '../../utils/seo';

export const AdminUsersPage: React.FC = () => {
  useDocumentTitle('Staff & Access Roles — Cosy Reality Admin');
  const { userProfile, isSuperAdmin } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'sales_admin' as AdminRole,
    isActive: true,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.warn('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'sales_admin',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      isActive: u.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast('error', 'Required Fields', 'Please provide name and email.');
      return;
    }

    try {
      setSaving(true);
      if (editingUser) {
        await updateUser(editingUser.uid, formData);
        addToast('success', 'User Updated', 'Staff account details saved.');
      } else {
        await createUser({
          ...formData,
          uid: 'user_' + Date.now(),
          createdAt: Date.now(),
        });
        addToast('success', 'Staff Member Added', 'New staff profile has been registered.');
      }
      setModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      addToast('error', 'Save Failed', err?.message || 'Unable to save user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    if (userToDelete.uid === userProfile?.uid) {
      addToast('error', 'Action Blocked', 'You cannot delete your own active account.');
      return;
    }

    try {
      setDeleting(true);
      await deleteUser(userToDelete.uid);
      addToast('success', 'Deleted', 'User account removed.');
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      await loadUsers();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err?.message || 'Unable to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'sales_admin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'inventory_manager':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#103858]">Staff & Role-Based Access Control</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage administrative personnel, sales executives, and inventory controllers
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant="gold"
            size="md"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4 text-[#103858]" />}
            className="font-bold shadow-sm"
          >
            Add Staff Member
          </Button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F3] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Name & Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <span className="font-extrabold text-[#103858] text-sm block">{u.name}</span>
                    <span className="text-[11px] text-slate-500">{u.email}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getRoleBadge(
                        u.role
                      )}`}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-slate-500 text-xs">
                    {formatDateTime(u.createdAt)}
                  </td>

                  <td className="py-4 px-4 text-right">
                    {isSuperAdmin && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setUserToDelete(u);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        size="md"
        title={editingUser ? 'Edit Staff Profile' : 'Add Staff Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Staff Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Contact Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
              Role & Permissions
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
              className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
            >
              <option value="super_admin">Super Administrator (Full System Access)</option>
              <option value="sales_admin">Sales Admin (CRM, Leads & Visits)</option>
              <option value="inventory_manager">Inventory Manager (Plot & Status Controls)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeToggle"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-[#103858] focus:ring-[#103858]"
            />
            <label htmlFor="activeToggle" className="text-xs font-bold text-[#103858] cursor-pointer">
              Account is Active
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={saving} className="font-bold">
              Save Account
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Staff Account"
        message={`Are you sure you want to remove account "${userToDelete?.name}"?`}
      />
    </div>
  );
};
