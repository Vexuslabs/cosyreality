import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Grid,
  Plus,
  Search,
  Filter,
  History,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { InventoryItem, Project, InventoryStatus, StatusHistoryItem } from '../../types';
import {
  getInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  updateInventoryStatus,
  deleteInventoryItem,
  getInventoryStatusHistory,
} from '../../services/inventoryService';
import { getProjects } from '../../services/projectsService';
import { formatINR, formatDateTime, getInventoryStatusBadgeClasses, getInventoryStatusLabel } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useDocumentTitle } from '../../utils/seo';

export const AdminInventoryPage: React.FC = () => {
  useDocumentTitle('Live Inventory Management — Cosy Reality Admin');
  const [searchParams] = useSearchParams();
  const { userProfile, isSuperAdmin, isInventoryManager, canManageInventory } = useAuth();
  const { addToast } = useToast();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  // Status Change Dialog
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    item: InventoryItem | null;
    targetStatus: InventoryStatus;
    reason: string;
  }>({
    open: false,
    item: null,
    targetStatus: 'booking',
    reason: '',
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // History Log Modal
  const [historyModal, setHistoryModal] = useState<{
    open: boolean;
    item: InventoryItem | null;
    history: StatusHistoryItem[];
    loading: boolean;
  }>({
    open: false,
    item: null,
    history: [],
    loading: false,
  });

  // Create / Edit Modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    unitNumber: '',
    plotNumber: '',
    block: 'Block A',
    sector: 'Sector 1',
    phase: 'Phase 1',
    propertyType: 'Plot',
    size: 150,
    sizeUnit: 'Sq. Yards',
    length: 30,
    width: 45,
    facing: 'North',
    roadWidth: '30 Ft.',
    cornerPlot: false,
    baseRate: 25000,
    plc: 0,
    finalPrice: 3750000,
    bookingAmount: 100000,
    status: 'booking' as InventoryStatus,
    publicNotes: 'Ready for immediate registry with 30ft road frontage.',
    privateNotes: '',
  });

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    const defaultProj = projects[0];
    setFormData({
      projectId: defaultProj?.id || '',
      projectName: defaultProj?.projectName || '',
      unitNumber: `Plot ${inventory.length + 101}`,
      plotNumber: `${inventory.length + 101}`,
      block: 'Block A',
      sector: 'Sector 1',
      phase: 'Phase 1',
      propertyType: 'Plot',
      size: 150,
      sizeUnit: 'Sq. Yards',
      length: 30,
      width: 45,
      facing: 'North',
      roadWidth: '30 Ft.',
      cornerPlot: false,
      baseRate: 25000,
      plc: 0,
      finalPrice: 3750000,
      bookingAmount: 100000,
      status: 'booking',
      publicNotes: 'Clear title freehold plot with registry readiness.',
      privateNotes: '',
    });
    setItemModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      projectId: item.projectId,
      projectName: item.projectName,
      unitNumber: item.unitNumber || '',
      plotNumber: item.plotNumber || '',
      block: item.block || '',
      sector: item.sector || '',
      phase: item.phase || '',
      propertyType: item.propertyType || 'Plot',
      size: item.size || 0,
      sizeUnit: item.sizeUnit || 'Sq. Yards',
      length: item.length || 0,
      width: item.width || 0,
      facing: item.facing || 'North',
      roadWidth: item.roadWidth || '30 Ft.',
      cornerPlot: item.cornerPlot || false,
      baseRate: item.baseRate || 0,
      plc: item.plc || 0,
      finalPrice: item.finalPrice || 0,
      bookingAmount: item.bookingAmount || 0,
      status: item.status,
      publicNotes: item.publicNotes || '',
      privateNotes: item.privateNotes || '',
    });
    setItemModalOpen(true);
  };

  const handleProjectSelect = (projId: string) => {
    const proj = projects.find((p) => p.id === projId);
    setFormData((prev) => ({
      ...prev,
      projectId: projId,
      projectName: proj?.projectName || '',
    }));
  };

  const handleStatusChangeClick = (item: InventoryItem, newStatus: InventoryStatus) => {
    if (item.status === newStatus) return;
    setStatusChangeDialog({
      open: true,
      item,
      targetStatus: newStatus,
      reason:
        newStatus === 'sold'
          ? 'Token received and registry processed'
          : newStatus === 'waiting'
          ? 'Token under verification'
          : 'Re-opened for booking',
    });
  };

  const confirmStatusChange = async () => {
    if (!statusChangeDialog.item) return;
    try {
      setUpdatingStatus(true);
      await updateInventoryStatus(
        statusChangeDialog.item.id,
        statusChangeDialog.targetStatus,
        userProfile?.uid || 'admin',
        userProfile?.name || 'Cosy Reality Staff',
        statusChangeDialog.reason
      );
      addToast(
        'success',
        'Inventory Status Updated',
        `${statusChangeDialog.item.unitNumber || statusChangeDialog.item.plotNumber} is now marked as ${getInventoryStatusLabel(statusChangeDialog.targetStatus)}.`
      );
      setStatusChangeDialog({ open: false, item: null, targetStatus: 'booking', reason: '' });
      await loadData();
    } catch (err: any) {
      addToast('error', 'Status Update Failed', err?.message || 'Unable to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openHistoryModal = async (item: InventoryItem) => {
    setHistoryModal({
      open: true,
      item,
      history: [],
      loading: true,
    });
    try {
      const logs = await getInventoryStatusHistory(item.id);
      setHistoryModal({
        open: true,
        item,
        history: logs,
        loading: false,
      });
    } catch (err) {
      console.warn('Error loading status history:', err);
      setHistoryModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || (!formData.unitNumber && !formData.plotNumber)) {
      addToast('error', 'Missing Information', 'Please provide project and plot/unit number.');
      return;
    }

    try {
      setSavingItem(true);
      if (editingItem) {
        await updateInventoryItem(editingItem.id, formData);
        addToast('success', 'Inventory Updated', 'Plot/Unit details successfully updated.');
      } else {
        await createInventoryItem({
          ...formData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        addToast('success', 'Unit Created', 'New inventory item added to live database.');
      }
      setItemModalOpen(false);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Save Failed', err?.message || 'Unable to save unit.');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await deleteInventoryItem(itemToDelete.id);
      addToast('success', 'Unit Removed', 'Inventory item deleted.');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err?.message || 'Unable to delete item.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const num = (item.unitNumber || item.plotNumber || '').toLowerCase();
        const pName = (item.projectName || '').toLowerCase();
        if (!num.includes(q) && !pName.includes(q)) return false;
      }
      if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });
  }, [inventory, searchQuery, projectFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Real-Time Status Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#103858] mt-0.5">Live Property Inventory</h1>
          <p className="text-xs text-slate-500">
            Control plot and unit availability with the Green / Yellow / Red status system
          </p>
        </div>

        {canManageInventory && (
          <Button
            variant="gold"
            size="md"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4 text-[#103858]" />}
            className="font-bold shadow-sm"
          >
            Add Property / Plot
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Plot/Unit or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#103858] focus:bg-white"
          />
        </div>

        <div>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#103858] cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#103858] cursor-pointer font-semibold"
          >
            <option value="all">All Statuses (Green / Yellow / Red)</option>
            <option value="booking">🟢 Booking Open (Available)</option>
            <option value="waiting">🟡 Waiting / Hold (Under Review)</option>
            <option value="sold">🔴 Sold (Closed)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F3] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Plot / Unit</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Block / Sector</th>
                <th className="py-3.5 px-4">Size & Facing</th>
                <th className="py-3.5 px-4">Final Value</th>
                <th className="py-3.5 px-4">Live Status Switcher</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-extrabold text-[#103858] text-sm block">
                          {item.unitNumber || item.plotNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.propertyType || 'Plot'}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-[#103858] max-w-[140px] truncate">
                        {item.projectName}
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        <span>{[item.block, item.sector].filter(Boolean).join(', ') || '—'}</span>
                      </td>

                      <td className="py-4 px-4 text-slate-700">
                        <span className="font-semibold block">
                          {item.size} {item.sizeUnit || 'Sq. Ft.'}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.facing || '—'} Facing</span>
                      </td>

                      <td className="py-4 px-4 font-bold text-[#103858]">
                        {formatINR(item.finalPrice)}
                      </td>

                      {/* Live Status Switcher Dropdown */}
                      <td className="py-4 px-4">
                        {canManageInventory ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleStatusChangeClick(item, e.target.value as InventoryStatus)
                              }
                              className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border shadow-2xs focus:outline-none focus:ring-2 cursor-pointer transition-colors ${
                                item.status === 'booking'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-500'
                                  : item.status === 'waiting'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 focus:ring-amber-500'
                                  : 'bg-rose-50 text-rose-900 border-rose-300 focus:ring-rose-500'
                              }`}
                            >
                              <option value="booking">🟢 Booking Open</option>
                              <option value="waiting">🟡 Waiting / Hold</option>
                              <option value="sold">🔴 Sold</option>
                            </select>
                          </div>
                        ) : (
                          <StatusBadge status={item.status} size="sm" />
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openHistoryModal(item)}
                            className="p-1.5 text-slate-500 hover:text-[#103858] rounded-lg hover:bg-slate-100"
                            title="View Status Change History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          {canManageInventory && (
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                              title="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setItemToDelete(item);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                              title="Delete unit"
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
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No inventory units found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Change Reason Modal */}
      <Modal
        isOpen={statusChangeDialog.open}
        onClose={() =>
          setStatusChangeDialog({ open: false, item: null, targetStatus: 'booking', reason: '' })
        }
        size="md"
        title="Confirm Inventory Status Change"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="font-bold text-[#103858] block">
              {statusChangeDialog.item?.projectName} — {statusChangeDialog.item?.unitNumber || statusChangeDialog.item?.plotNumber}
            </span>
            <span className="mt-1 block">
              Changing status from{' '}
              <strong className="uppercase">{statusChangeDialog.item?.status}</strong> to{' '}
              <strong className="uppercase text-emerald-700">{statusChangeDialog.targetStatus}</strong>
            </span>
          </div>

          <Textarea
            label="Reason for Status Change (Audit Log)"
            placeholder="e.g. Token received from client, Cheque clearance, Customer cancelled..."
            rows={3}
            required
            value={statusChangeDialog.reason}
            onChange={(e) =>
              setStatusChangeDialog((prev) => ({ ...prev, reason: e.target.value }))
            }
          />

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setStatusChangeDialog({ open: false, item: null, targetStatus: 'booking', reason: '' })
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={updatingStatus}
              onClick={confirmStatusChange}
            >
              Confirm Status Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status History Modal */}
      <Modal
        isOpen={historyModal.open}
        onClose={() => setHistoryModal({ open: false, item: null, history: [], loading: false })}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#CCA02E]" />
            <span>
              Status Audit Trail: {historyModal.item?.unitNumber || historyModal.item?.plotNumber}
            </span>
          </div>
        }
      >
        <div className="space-y-4">
          {historyModal.loading ? (
            <p className="text-xs text-slate-500 py-6 text-center animate-pulse">
              Loading status history logs...
            </p>
          ) : historyModal.history.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {historyModal.history.map((log) => (
                <div key={log.id} className="py-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#103858]">
                      Changed by: {log.changedByName || 'Staff'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-slate-500">
                      {getInventoryStatusLabel(log.previousStatus)}
                    </span>
                    <span>→</span>
                    <span className="text-[#103858]">
                      {getInventoryStatusLabel(log.newStatus)}
                    </span>
                  </div>
                  {log.reason && (
                    <p className="text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 italic">
                      "{log.reason}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">
              No historical status changes recorded for this property.
            </p>
          )}
        </div>
      </Modal>

      {/* Create / Edit Inventory Item Modal */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        size="xl"
        title={editingItem ? `Edit: ${editingItem.unitNumber || editingItem.plotNumber}` : 'Add Property Unit / Plot'}
      >
        <form onSubmit={handleSubmitItem} className="space-y-4">
          {/* Project & Unit Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
                Belongs to Project <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                required
                className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Plot / Unit Number"
              placeholder="e.g. Plot A-12 or Villa 04"
              required
              value={formData.unitNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unitNumber: e.target.value,
                  plotNumber: e.target.value,
                })
              }
            />
          </div>

          {/* Block, Sector, Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Block"
              placeholder="e.g. Block A"
              value={formData.block}
              onChange={(e) => setFormData({ ...formData, block: e.target.value })}
            />

            <Input
              label="Sector / Pocket"
              placeholder="e.g. Sector 2"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
            />

            <Input
              label="Phase"
              placeholder="e.g. Phase 1"
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
            />
          </div>

          {/* Size & Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Size"
              type="number"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: Number(e.target.value) })}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
                Size Unit
              </label>
              <select
                value={formData.sizeUnit}
                onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value })}
                className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
              >
                <option value="Sq. Yards">Sq. Yards</option>
                <option value="Sq. Ft.">Sq. Ft.</option>
                <option value="Sq. Meters">Sq. Meters</option>
              </select>
            </div>

            <Input
              label="Length (Ft)"
              type="number"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: Number(e.target.value) })}
            />

            <Input
              label="Width (Ft)"
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
            />
          </div>

          {/* Facing, Road, Corner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
                Orientation / Facing
              </label>
              <select
                value={formData.facing}
                onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
              >
                <option value="North">North</option>
                <option value="East">East (Park Facing)</option>
                <option value="North-East">North-East</option>
                <option value="West">West</option>
                <option value="South">South</option>
              </select>
            </div>

            <Input
              label="Road Frontage Width"
              placeholder="e.g. 30 Ft. / 40 Ft."
              value={formData.roadWidth}
              onChange={(e) => setFormData({ ...formData, roadWidth: e.target.value })}
            />

            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cornerPlot}
                  onChange={(e) => setFormData({ ...formData, cornerPlot: e.target.checked })}
                  className="w-4 h-4 text-[#103858] focus:ring-[#103858] rounded"
                />
                <span className="text-xs font-bold text-[#103858]">Corner Property</span>
              </label>
            </div>
          </div>

          {/* Pricing Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Base Rate (₹)"
              type="number"
              value={formData.baseRate}
              onChange={(e) => setFormData({ ...formData, baseRate: Number(e.target.value) })}
            />

            <Input
              label="PLC (₹)"
              type="number"
              value={formData.plc}
              onChange={(e) => setFormData({ ...formData, plc: Number(e.target.value) })}
            />

            <Input
              label="Final Price (₹)"
              type="number"
              required
              value={formData.finalPrice}
              onChange={(e) => setFormData({ ...formData, finalPrice: Number(e.target.value) })}
            />

            <Input
              label="Booking Token (₹)"
              type="number"
              value={formData.bookingAmount}
              onChange={(e) => setFormData({ ...formData, bookingAmount: Number(e.target.value) })}
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
              Initial Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as InventoryStatus })}
              className="w-full bg-white text-[#172B3A] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#103858]"
            >
              <option value="booking">🟢 Booking Open</option>
              <option value="waiting">🟡 Waiting / Hold</option>
              <option value="sold">🔴 Sold</option>
            </select>
          </div>

          <Textarea
            label="Public Details & Notes (Visible on Public Website)"
            rows={2}
            value={formData.publicNotes}
            onChange={(e) => setFormData({ ...formData, publicNotes: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setItemModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={savingItem} className="font-bold">
              {editingItem ? 'Save Updates' : 'Add to Inventory'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteItem}
        loading={deleting}
        title="Delete Inventory Unit"
        message={`Are you sure you want to delete "${itemToDelete?.unitNumber || itemToDelete?.plotNumber}"? This will also remove associated status records.`}
      />
    </div>
  );
};
