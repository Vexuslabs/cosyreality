import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { InventoryItem, InventoryStatus, StatusHistory } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errors';

const COLLECTION = 'inventory';
const STATUS_HISTORY_COLLECTION = 'statusHistory';
const LOCAL_STORAGE_KEY = 'cosy_reality_inventory';
const LOCAL_HISTORY_KEY = 'cosy_reality_status_history';

function getLocalInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalInventory(items: InventoryItem[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

function getLocalHistory(): StatusHistory[] {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(items: StatusHistory[]) {
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(items));
}

export async function logStatusHistory(historyData: {
  inventoryId: string;
  projectId?: string;
  unitNumber?: string;
  previousStatus?: InventoryStatus;
  oldStatus?: InventoryStatus;
  newStatus: InventoryStatus;
  changedBy?: string;
  changedByUid?: string;
  changedByName?: string;
  reason?: string;
}): Promise<StatusHistory> {
  const newId = 'hist_' + Math.random().toString(36).substring(2, 9) + Date.now();
  const entry: StatusHistory = {
    ...historyData,
    id: newId,
    timestamp: Date.now(),
    createdAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, STATUS_HISTORY_COLLECTION, newId);
      await setDoc(docRef, entry);
    } catch (err) {
      console.warn('Status history logging failed on Firestore:', err);
    }
  }

  const localHist = getLocalHistory();
  localHist.unshift(entry);
  saveLocalHistory(localHist);

  return entry;
}

export async function getInventory(filters?: {
  projectId?: string;
  status?: InventoryStatus | 'all';
  propertyType?: string;
  block?: string;
  sector?: string;
  phase?: string;
  facing?: string;
  cornerPlot?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  search?: string;
}): Promise<InventoryItem[]> {
  let list: InventoryItem[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION);
      const constraints: any[] = [];

      if (filters?.projectId && filters.projectId !== 'all') {
        constraints.push(where('projectId', '==', filters.projectId));
      }
      if (filters?.status && filters.status !== 'all') {
        constraints.push(where('status', '==', filters.status));
      }

      const q = constraints.length > 0 ? query(colRef, ...constraints) : query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<InventoryItem, 'id'>),
      }));
    } catch (err) {
      console.warn('Firestore getInventory failed, checking local:', err);
      list = getLocalInventory();
    }
  } else {
    list = getLocalInventory();
  }

  // In-memory filters
  if (filters?.projectId && filters.projectId !== 'all') {
    list = list.filter((item) => item.projectId === filters.projectId);
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((item) => item.status === filters.status);
  }
  if (filters?.propertyType && filters.propertyType !== 'all') {
    list = list.filter((item) => item.propertyType?.toLowerCase() === filters.propertyType?.toLowerCase());
  }
  if (filters?.block && filters.block !== 'all') {
    list = list.filter((item) => item.block?.toLowerCase() === filters.block?.toLowerCase());
  }
  if (filters?.sector && filters.sector !== 'all') {
    list = list.filter((item) => item.sector?.toLowerCase() === filters.sector?.toLowerCase());
  }
  if (filters?.phase && filters.phase !== 'all') {
    list = list.filter((item) => item.phase?.toLowerCase() === filters.phase?.toLowerCase());
  }
  if (filters?.facing && filters.facing !== 'all') {
    list = list.filter((item) => item.facing?.toLowerCase() === filters.facing?.toLowerCase());
  }
  if (filters?.cornerPlot !== undefined) {
    list = list.filter((item) => Boolean(item.cornerPlot) === filters.cornerPlot);
  }
  if (filters?.minPrice && filters.minPrice > 0) {
    list = list.filter((item) => (item.finalPrice || 0) >= filters.minPrice!);
  }
  if (filters?.maxPrice && filters.maxPrice > 0) {
    list = list.filter((item) => (item.finalPrice || 0) <= filters.maxPrice!);
  }
  if (filters?.minSize && filters.minSize > 0) {
    list = list.filter((item) => (item.size || 0) >= filters.minSize!);
  }
  if (filters?.maxSize && filters.maxSize > 0) {
    list = list.filter((item) => (item.size || 0) <= filters.maxSize!);
  }
  if (filters?.search && filters.search.trim() !== '') {
    const s = filters.search.trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.unitNumber?.toLowerCase().includes(s) ||
        item.plotNumber?.toLowerCase().includes(s) ||
        item.projectName?.toLowerCase().includes(s) ||
        item.block?.toLowerCase().includes(s) ||
        item.sector?.toLowerCase().includes(s)
    );
  }

  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export const getInventoryItems = getInventory;

export async function getInventoryByProject(projectId: string): Promise<InventoryItem[]> {
  return getInventory({ projectId });
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as Omit<InventoryItem, 'id'>) };
      }
    } catch (err) {
      console.warn('Firestore getInventoryItemById failed:', err);
    }
  }

  const local = getLocalInventory();
  return local.find((i) => i.id === id) || null;
}

export async function createInventoryItem(
  data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: number; updatedAt?: number }
): Promise<InventoryItem> {
  const newId = 'inv_' + Math.random().toString(36).substring(2, 9) + Date.now();
  const newItem: InventoryItem = {
    ...data,
    id: newId,
    cornerPlot: Boolean(data.cornerPlot),
    createdAt: data.createdAt || Date.now(),
    updatedAt: data.updatedAt || Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, newId);
      await setDoc(docRef, newItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTION}/${newId}`);
    }
  }

  const local = getLocalInventory();
  local.unshift(newItem);
  saveLocalInventory(local);

  await logStatusHistory({
    inventoryId: newId,
    projectId: newItem.projectId,
    unitNumber: newItem.unitNumber || newItem.plotNumber,
    previousStatus: newItem.status,
    oldStatus: newItem.status,
    newStatus: newItem.status,
    changedByName: newItem.updatedBy || 'Cosy Reality Staff',
    reason: 'Initial creation',
  });

  return newItem;
}

export async function updateInventoryItem(
  id: string,
  data: Partial<InventoryItem>,
  changedBy: string = 'admin',
  reason?: string
): Promise<InventoryItem> {
  const existing = await getInventoryItemById(id);
  if (!existing) throw new Error('Inventory unit not found');

  const statusChanged = data.status && data.status !== existing.status;
  const oldStatus = existing.status;

  const updated: InventoryItem = {
    ...existing,
    ...data,
    updatedAt: Date.now(),
    updatedBy: changedBy,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, updated as any);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION}/${id}`);
    }
  }

  const local = getLocalInventory();
  const idx = local.findIndex((i) => i.id === id);
  if (idx !== -1) {
    local[idx] = updated;
  } else {
    local.unshift(updated);
  }
  saveLocalInventory(local);

  if (statusChanged && data.status) {
    await logStatusHistory({
      inventoryId: id,
      projectId: updated.projectId,
      unitNumber: updated.unitNumber || updated.plotNumber,
      previousStatus: oldStatus,
      oldStatus,
      newStatus: data.status,
      changedByName: changedBy,
      reason: reason || 'Status updated in management matrix',
    });
  }

  return updated;
}

export async function updateInventoryStatus(
  id: string,
  newStatus: InventoryStatus,
  changedByUid: string,
  changedByName: string,
  reason: string = 'Status updated'
): Promise<InventoryItem> {
  return updateInventoryItem(id, { status: newStatus }, changedByName, reason);
}

export async function getInventoryStatusHistory(inventoryId: string): Promise<StatusHistory[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, STATUS_HISTORY_COLLECTION);
      const q = query(colRef, where('inventoryId', '==', inventoryId), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StatusHistory, 'id'>) }));
      }
    } catch (err) {
      console.warn('Firestore getInventoryStatusHistory query failed:', err);
    }
  }

  const local = getLocalHistory();
  return local.filter((h) => h.inventoryId === inventoryId);
}

export async function getAllStatusHistory(limitCount: number = 50): Promise<StatusHistory[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, STATUS_HISTORY_COLLECTION);
      const q = query(colRef, orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.slice(0, limitCount).map((d) => ({ id: d.id, ...(d.data() as Omit<StatusHistory, 'id'>) }));
      }
    } catch (err) {
      console.warn('Firestore getAllStatusHistory query failed:', err);
    }
  }

  const local = getLocalHistory();
  return local.slice(0, limitCount);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION}/${id}`);
    }
  }

  const local = getLocalInventory();
  saveLocalInventory(local.filter((i) => i.id !== id));
}

export async function getInventoryCounts(projectId?: string): Promise<{
  total: number;
  booking: number;
  waiting: number;
  sold: number;
}> {
  const all = await getInventory({ projectId });
  const booking = all.filter((i) => i.status === 'booking').length;
  const waiting = all.filter((i) => i.status === 'waiting').length;
  const sold = all.filter((i) => i.status === 'sold').length;

  return {
    total: all.length,
    booking,
    waiting,
    sold,
  };
}

export const getInventoryStats = getInventoryCounts;
