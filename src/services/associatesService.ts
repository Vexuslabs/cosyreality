import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { Associate, AssociateStatus } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errors';

const COLLECTION = 'associates';
const LOCAL_STORAGE_KEY = 'cosy_reality_associates';

function getLocalAssociates(): Associate[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAssociates(items: Associate[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export async function createAssociate(
  data: Omit<Associate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Associate> {
  const newId = 'assoc_' + Math.random().toString(36).substring(2, 9) + Date.now();
  const newAssoc: Associate = {
    ...data,
    id: newId,
    status: data.status || 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, newId);
      await setDoc(docRef, newAssoc);
    } catch (err) {
      console.warn('Public associate submission fallback:', err);
    }
  }

  const local = getLocalAssociates();
  local.unshift(newAssoc);
  saveLocalAssociates(local);

  return newAssoc;
}

export async function getAssociates(filters?: {
  status?: string;
  search?: string;
}): Promise<Associate[]> {
  let list: Associate[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION);
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Associate, 'id'>),
      }));
    } catch (err) {
      console.warn('Firestore getAssociates failed:', err);
      list = getLocalAssociates();
    }
  } else {
    list = getLocalAssociates();
  }

  if (filters?.status && filters.status !== 'all') {
    list = list.filter((a) => a.status === filters.status);
  }
  if (filters?.search && filters.search.trim() !== '') {
    const s = filters.search.trim().toLowerCase();
    list = list.filter(
      (a) =>
        a.name?.toLowerCase().includes(s) ||
        a.phone?.toLowerCase().includes(s) ||
        a.city?.toLowerCase().includes(s) ||
        a.email?.toLowerCase().includes(s) ||
        a.companyName?.toLowerCase().includes(s) ||
        a.currentProfession?.toLowerCase().includes(s)
    );
  }

  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function updateAssociate(id: string, data: Partial<Associate>): Promise<Associate> {
  const local = getLocalAssociates();
  const existing = local.find((a) => a.id === id);
  const updated: Associate = {
    ...(existing || ({} as Associate)),
    ...data,
    id,
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, updated as any);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION}/${id}`);
    }
  }

  const idx = local.findIndex((a) => a.id === id);
  if (idx !== -1) {
    local[idx] = updated;
  } else {
    local.unshift(updated);
  }
  saveLocalAssociates(local);

  return updated;
}

export async function updateAssociateStatus(id: string, status: AssociateStatus): Promise<Associate> {
  return updateAssociate(id, { status });
}

export async function deleteAssociate(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION}/${id}`);
    }
  }

  const local = getLocalAssociates();
  saveLocalAssociates(local.filter((a) => a.id !== id));
}
