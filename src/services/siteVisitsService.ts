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
import { SiteVisit, SiteVisitStatus } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errors';

const COLLECTION = 'siteVisits';
const LOCAL_STORAGE_KEY = 'cosy_reality_site_visits';

function getLocalSiteVisits(): SiteVisit[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSiteVisits(visits: SiteVisit[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visits));
}

export async function createSiteVisit(
  data: Omit<SiteVisit, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: SiteVisitStatus }
): Promise<SiteVisit> {
  const newId = 'visit_' + Math.random().toString(36).substring(2, 9) + Date.now();
  const newVisit: SiteVisit = {
    ...data,
    id: newId,
    status: data.status || 'scheduled',
    numberOfVisitors: Number(data.numberOfVisitors) || 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, newId);
      await setDoc(docRef, newVisit);
    } catch (err) {
      console.warn('Public site visit submission fallback:', err);
    }
  }

  const local = getLocalSiteVisits();
  local.unshift(newVisit);
  saveLocalSiteVisits(local);

  return newVisit;
}

export async function getSiteVisits(filters?: {
  status?: SiteVisitStatus | 'all';
  search?: string;
}): Promise<SiteVisit[]> {
  let list: SiteVisit[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION);
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SiteVisit, 'id'>),
      }));
    } catch (err) {
      console.warn('Firestore getSiteVisits failed:', err);
      list = getLocalSiteVisits();
    }
  } else {
    list = getLocalSiteVisits();
  }

  if (filters?.status && filters.status !== 'all') {
    list = list.filter((v) => v.status === filters.status);
  }
  if (filters?.search && filters.search.trim() !== '') {
    const s = filters.search.trim().toLowerCase();
    list = list.filter(
      (v) =>
        v.name?.toLowerCase().includes(s) ||
        v.phone?.toLowerCase().includes(s) ||
        v.projectName?.toLowerCase().includes(s) ||
        v.email?.toLowerCase().includes(s)
    );
  }

  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function updateSiteVisit(id: string, data: Partial<SiteVisit>): Promise<SiteVisit> {
  const local = getLocalSiteVisits();
  const existing = local.find((v) => v.id === id);
  const updated: SiteVisit = {
    ...(existing || ({} as SiteVisit)),
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

  const idx = local.findIndex((v) => v.id === id);
  if (idx !== -1) {
    local[idx] = updated;
  } else {
    local.unshift(updated);
  }
  saveLocalSiteVisits(local);

  return updated;
}

export async function updateSiteVisitStatus(id: string, status: SiteVisitStatus): Promise<SiteVisit> {
  return updateSiteVisit(id, { status });
}

export async function deleteSiteVisit(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION}/${id}`);
    }
  }

  const local = getLocalSiteVisits();
  saveLocalSiteVisits(local.filter((v) => v.id !== id));
}
