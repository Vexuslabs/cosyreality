import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { Testimonial } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errors';

const COLLECTION = 'testimonials';
const LOCAL_STORAGE_KEY = 'cosy_reality_testimonials';

function getLocalTestimonials(): Testimonial[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalTestimonials(items: Testimonial[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export async function getTestimonials(publishedOnly: boolean = true): Promise<Testimonial[]> {
  let list: Testimonial[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION);
      const q = publishedOnly
        ? query(colRef, where('published', '==', true))
        : query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Testimonial, 'id'>),
      }));
    } catch (err) {
      console.warn('Firestore getTestimonials failed:', err);
      list = getLocalTestimonials();
    }
  } else {
    list = getLocalTestimonials();
  }

  if (publishedOnly) {
    list = list.filter((t) => t.published === true);
  }

  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function createTestimonial(
  data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Testimonial> {
  const newId = 'testim_' + Math.random().toString(36).substring(2, 9) + Date.now();
  const newItem: Testimonial = {
    ...data,
    id: newId,
    published: data.published ?? true,
    rating: Number(data.rating) || 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, newId);
      await setDoc(docRef, newItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTION}/${newId}`);
    }
  }

  const local = getLocalTestimonials();
  local.unshift(newItem);
  saveLocalTestimonials(local);

  return newItem;
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Testimonial> {
  const local = getLocalTestimonials();
  const existing = local.find((t) => t.id === id);
  const updated: Testimonial = {
    ...(existing || ({} as Testimonial)),
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

  const idx = local.findIndex((t) => t.id === id);
  if (idx !== -1) {
    local[idx] = updated;
  } else {
    local.unshift(updated);
  }
  saveLocalTestimonials(local);

  return updated;
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION}/${id}`);
    }
  }

  const local = getLocalTestimonials();
  saveLocalTestimonials(local.filter((t) => t.id !== id));
}
