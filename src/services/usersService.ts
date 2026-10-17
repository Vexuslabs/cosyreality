import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { UserProfile, AdminRole } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errors';

const COLLECTION = 'users';
const LOCAL_STORAGE_KEY = 'cosy_reality_users';

function getLocalUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(items: UserProfile[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const d = snap.data() as UserProfile;
        return { uid: snap.id, ...d, active: d.active ?? d.isActive ?? true, isActive: d.active ?? d.isActive ?? true };
      }
    } catch (err) {
      console.warn('Firestore getUserProfile failed:', err);
    }
  }

  const local = getLocalUsers();
  const found = local.find((u) => u.uid === uid);
  return found ? { ...found, active: found.active ?? found.isActive ?? true, isActive: found.active ?? found.isActive ?? true } : null;
}

export async function getUsers(): Promise<UserProfile[]> {
  let list: UserProfile[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION);
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      list = snap.docs.map((d) => {
        const u = d.data() as UserProfile;
        return {
          uid: d.id,
          ...u,
          active: u.active ?? u.isActive ?? true,
          isActive: u.active ?? u.isActive ?? true,
        };
      });
    } catch (err) {
      console.warn('Firestore getUsers failed:', err);
      list = getLocalUsers();
    }
  } else {
    list = getLocalUsers();
  }

  return list.map(u => ({ ...u, active: u.active ?? u.isActive ?? true, isActive: u.active ?? u.isActive ?? true }));
}

export async function saveUserProfile(user: UserProfile): Promise<UserProfile> {
  const normUser: UserProfile = {
    ...user,
    active: user.active ?? user.isActive ?? true,
    isActive: user.active ?? user.isActive ?? true,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, user.uid);
      await setDoc(docRef, normUser, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${COLLECTION}/${user.uid}`);
    }
  }

  const local = getLocalUsers();
  const idx = local.findIndex((u) => u.uid === user.uid);
  if (idx !== -1) {
    local[idx] = normUser;
  } else {
    local.unshift(normUser);
  }
  saveLocalUsers(local);

  return normUser;
}

export async function createUser(data: Omit<UserProfile, 'createdAt' | 'updatedAt'> & { createdAt?: number }): Promise<UserProfile> {
  const newUser: UserProfile = {
    ...data,
    active: data.active ?? data.isActive ?? true,
    isActive: data.active ?? data.isActive ?? true,
    createdAt: data.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  return saveUserProfile(newUser);
}

export async function updateUser(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  const updated: UserProfile = {
    ...(existing || ({ uid, email: '', name: '', role: 'sales_admin' } as UserProfile)),
    ...data,
    uid,
    active: data.active ?? data.isActive ?? existing?.active ?? true,
    isActive: data.active ?? data.isActive ?? existing?.isActive ?? true,
    updatedAt: Date.now(),
  };
  return saveUserProfile(updated);
}

export async function updateUserRole(uid: string, role: AdminRole, active: boolean = true): Promise<void> {
  await updateUser(uid, { role, active, isActive: active });
}

export async function deleteUser(uid: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, uid);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION}/${uid}`);
    }
  }

  const local = getLocalUsers();
  saveLocalUsers(local.filter((u) => u.uid !== uid));
}
