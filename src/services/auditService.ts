import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
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
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export async function logAudit(data: {
  action: string;
  collection?: string;
  docId?: string;
  performedByUid?: string;
  performedByName?: string;
  details?: any;
}): Promise<AuditLog> {
  const newId = 'audit_' + Math.random().toString(36).substring(2, 9) + Date.now();
  const entry: AuditLog = {
    id: newId,
    action: data.action,
    collection: data.collection || 'system',
    collectionName: data.collection || 'system',
    docId: data.docId,
    recordId: data.docId || '',
    performedByUid: data.performedByUid || 'admin',
    performedByName: data.performedByName || 'Staff Member',
    userId: data.performedByUid || 'admin',
    userEmail: data.performedByName || 'staff@cosyreality.com',
    details: data.details,
    timestamp: Date.now(),
    createdAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, newId);
      await setDoc(docRef, entry);
    } catch (err) {
      console.warn('Audit logging failed on Firestore:', err);
    }
  }

  const local = getLocalAuditLogs();
  local.unshift(entry);
  if (local.length > 500) local.pop();
  saveLocalAuditLogs(local);

  return entry;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION);
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AuditLog, 'id'>),
        }));
      }
    } catch (err) {
      console.warn('Firestore getAuditLogs query failed:', err);
    }
  }

  return getLocalAuditLogs();
}
