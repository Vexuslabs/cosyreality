import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { AuditLog } from '../types';

const COLLECTION = 'auditLogs';
const LOCAL_STORAGE_KEY = 'cosy_reality_audit_logs';

function getLocalAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAuditLogs(items: AuditLog[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items.slice(0, 200)));
}

export async function logAudit(
  data: Omit<AuditLog, 'id' | 'createdAt'>
): Promise<AuditLog> {
  const newId = 'log_' + Math.random().toString(36).substring(2, 9) + Date.now();
  const newLog: AuditLog = {
    ...data,
    id: newId,
    createdAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, newId);
      await setDoc(docRef, newLog);
    } catch (err) {
      console.warn('Audit logging fallback:', err);
    }
  }

  const local = getLocalAuditLogs();
  local.unshift(newLog);
  saveLocalAuditLogs(local);

  return newLog;
}

export async function getAuditLogs(max: number = 100): Promise<AuditLog[]> {
  let list: AuditLog[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION);
      const q = query(colRef, orderBy('createdAt', 'desc'), limit(max));
      const snap = await getDocs(q);
      list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AuditLog, 'id'>),
      }));
    } catch (err) {
      console.warn('Firestore getAuditLogs failed:', err);
      list = getLocalAuditLogs();
    }
  } else {
    list = getLocalAuditLogs();
  }

  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, max);
}
