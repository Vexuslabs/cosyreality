import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { Settings } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errors';

export const DEFAULT_SETTINGS: Settings = {
  companyName: 'Cosy Reality',
  tagline: 'Reality But Make It Cosy',
  experienceYears: '15+',
  phone: '',
  alternatePhone: '',
  whatsapp: '',
  email: '',
  address: '',
  workingHours: '',
  googleMapsUrl: '',
  facebook: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  logoUrl: '',
  faviconUrl: '',
  footerText: 'Cosy Reality is a trusted real estate and construction enterprise with 15+ years of experience delivering residential, commercial, and plotted developments.',
  developerCredit: 'Cosy Reality',
  defaultSeoTitle: 'Cosy Reality | Reality But Make It Cosy',
  defaultSeoDescription: 'Discover residential, commercial, and plotted developments backed by 15 years of real-estate and construction experience.',
  showAssociates: true,
  showCommissionPlan: false,
  showTestimonials: true,
  showStatistics: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const LOCAL_STORAGE_KEY = 'cosy_reality_settings';

export async function getSettings(): Promise<Settings> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', 'general');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...DEFAULT_SETTINGS, ...snap.data() } as Settings;
      }
    } catch (err) {
      console.warn('Could not fetch settings from Firestore, checking local storage:', err);
    }
  }

  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
    } catch {
      // fallback
    }
  }
  return DEFAULT_SETTINGS;
}

export async function updateSettings(newSettings: Partial<Settings>): Promise<Settings> {
  const updated: Settings = {
    ...DEFAULT_SETTINGS,
    ...newSettings,
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', 'general');
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/general');
    }
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
