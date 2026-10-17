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
import { Lead, LeadStage } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errors';

const COLLECTION = 'leads';
const LOCAL_STORAGE_KEY = 'cosy_reality_leads';

function getLocalLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLeads(leads: Lead[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
}

export async function createLead(
  data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Lead> {
  const newId = 'lead_' + Math.random().toString(36).substring(2, 9) + Date.now();
  const newLead: Lead = {
    ...data,
    id: newId,
    phone: data.phone || data.mobile || '',
    mobile: data.mobile || data.phone || '',
    stage: data.stage || data.status || 'new',
    status: data.stage || data.status || 'new',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, newId);
      await setDoc(docRef, newLead);
    } catch (err) {
      console.warn('Public lead submission fallback:', err);
    }
  }

  const local = getLocalLeads();
  local.unshift(newLead);
  saveLocalLeads(local);

  return newLead;
}

export async function getLeads(filters?: {
  status?: LeadStage | 'all';
  stage?: LeadStage | 'all';
  projectId?: string;
  search?: string;
}): Promise<Lead[]> {
  let list: Lead[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION);
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      list = snap.docs.map((d) => {
        const item = d.data() as Lead;
        return {
          id: d.id,
          ...item,
          phone: item.phone || item.mobile || '',
          mobile: item.mobile || item.phone || '',
          stage: item.stage || item.status || 'new',
          status: item.stage || item.status || 'new',
        };
      });
    } catch (err) {
      console.warn('Firestore getLeads failed:', err);
      list = getLocalLeads();
    }
  } else {
    list = getLocalLeads();
  }

  const targetStatus = filters?.stage || filters?.status;
  if (targetStatus && targetStatus !== 'all') {
    list = list.filter((l) => (l.stage || l.status) === targetStatus);
  }
  if (filters?.projectId && filters.projectId !== 'all') {
    list = list.filter((l) => l.projectId === filters.projectId);
  }
  if (filters?.search && filters.search.trim() !== '') {
    const s = filters.search.trim().toLowerCase();
    list = list.filter(
      (l) =>
        l.name?.toLowerCase().includes(s) ||
        l.phone?.toLowerCase().includes(s) ||
        l.mobile?.toLowerCase().includes(s) ||
        l.email?.toLowerCase().includes(s) ||
        l.projectName?.toLowerCase().includes(s)
    );
  }

  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  const local = getLocalLeads();
  const existing = local.find((l) => l.id === id);
  const updated: Lead = {
    ...(existing || ({} as Lead)),
    ...data,
    id,
    phone: data.phone || data.mobile || existing?.phone || existing?.mobile || '',
    mobile: data.mobile || data.phone || existing?.mobile || existing?.phone || '',
    stage: data.stage || data.status || existing?.stage || existing?.status || 'new',
    status: data.stage || data.status || existing?.status || existing?.stage || 'new',
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

  const idx = local.findIndex((l) => l.id === id);
  if (idx !== -1) {
    local[idx] = updated;
  } else {
    local.unshift(updated);
  }
  saveLocalLeads(local);

  return updated;
}

export async function updateLeadStage(id: string, stage: LeadStage): Promise<Lead> {
  return updateLead(id, { stage, status: stage });
}

export async function deleteLead(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION}/${id}`);
    }
  }

  const local = getLocalLeads();
  saveLocalLeads(local.filter((l) => l.id !== id));
}
