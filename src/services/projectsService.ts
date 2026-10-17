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
import { Project } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { generateSlug } from '../utils/formatters';

const COLLECTION = 'projects';
const LOCAL_STORAGE_KEY = 'cosy_reality_projects';

export const DEFAULT_BANSURI_DHAM_PROJECT: Project = {
  id: 'bansuri-dham-project',
  projectName: 'Bansuri Dham',
  slug: 'bansuri-dham',
  location: '58 KM Milestone, Yamuna Expressway, Near Jewar Airport',
  city: 'Yamuna Expressway',
  state: 'Uttar Pradesh',
  pincode: '202140',
  projectType: 'Plotted Development',
  projectStatus: 'Ongoing',
  startingPrice: 0,
  totalArea: '79,452 sqm',
  projectArea: '79,452 sqm',
  shortDescription: 'A thoughtfully planned plotted development along the Yamuna Expressway corridor.',
  description: 'Bansuri Dham is a plotted development positioned along the Yamuna Expressway corridor, near Jewar Airport. The project combines residential and commercial components with open areas, road infrastructure and planned amenities.',
  featured: true,
  active: true,
  isDemo: false,
  heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
  thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  ],
  siteAreaBreakdown: {
    totalArea: '79,452 sqm',
    farmArea: '25,783 sqm',
    plotArea: '29,992 sqm',
    parkArea: '2,878 sqm',
    roadArea: '20,548 sqm',
    additionalRoadArea: '250.2 sqm',
  },
  components: [
    'Commercial Plots',
    'Residential Plots',
    'Farm Area',
    'Apartments',
    'Recreation',
    'Education',
    'Shopping',
    'Sports',
  ],
  highlights: [
    'Strategic location at 58 KM Milestone on Yamuna Expressway corridor',
    'Positioned in the Jewar Airport (Noida International Airport) development corridor',
    'Comprehensive master planning across 79,452 sqm total site area',
    'Dedicated 20,548 sqm wide arterial and internal road network',
    '2,878 sqm landscaped central park and green belts',
    'Balanced development mix comprising residential plots, commercial zones & farm spaces',
  ],
  locationAdvantages: [
    'Yamuna Expressway strategic regional corridor',
    'Direct access to Jewar Airport (Noida International Airport)',
    'Connected via Bajna-Chandaus Highway & Aligarh-Palwal Highway',
    'Close proximity to designated Film City, Defence Corridor & Tech Zones',
    'Easy accessibility to Vrindavan, Mathura, and Agra',
  ],
  amenities: [
    'Parks / Walking Tracks',
    'Club House & Gym',
    'Solar Lights / Panels',
    'CCTV Surveillance',
    'Road & Infrastructure (20,548 sqm)',
    'Drainage / Sewerage Systems',
    'Educational & Recreation Provisions',
    'Devotional & Cultural Harmony Spaces',
  ],
  developerInfo: 'The supplied project brochure presents Bansuri Dham under Radha Rani Residency Pvt. Ltd. / NCR Group branding.',
  associatedProjects: [
    'Sudha Enclave',
    'Shri Radha Rani Farms',
    'Dronagiri Apartments',
    'Shiv Shakti Vihar',
    'Shiv Shakti Vatika',
  ],
  showAssociatedProjects: true,
  seoTitle: 'Bansuri Dham Yamuna Expressway | Cosy Reality',
  seoDescription: 'Explore Bansuri Dham, a plotted development at 58 KM Milestone, Yamuna Expressway near Jewar Airport. View project details, site plan, connectivity and live availability.',
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

function getLocalProjects(): Project[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed: Project[] = raw ? JSON.parse(raw) : [];
    if (!parsed.some((p) => p.slug === 'bansuri-dham')) {
      parsed.unshift(DEFAULT_BANSURI_DHAM_PROJECT);
    }
    return parsed;
  } catch {
    return [DEFAULT_BANSURI_DHAM_PROJECT];
  }
}

function saveLocalProjects(projects: Project[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

export async function getProjects(options?: {
  activeOnly?: boolean;
  featuredOnly?: boolean;
  city?: string;
  projectType?: string;
  projectStatus?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Project[]> {
  let list: Project[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION);
      const constraints: any[] = [];

      if (options?.activeOnly) {
        constraints.push(where('active', '==', true));
      }
      if (options?.featuredOnly) {
        constraints.push(where('featured', '==', true));
      }

      const q = constraints.length > 0 ? query(colRef, ...constraints) : query(colRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Project, 'id'>),
      }));
    } catch (err) {
      console.warn('Firestore getProjects failed, checking local:', err);
      list = getLocalProjects();
    }
  } else {
    list = getLocalProjects();
  }

  // Ensure Bansuri Dham is always available in the portfolio
  if (!list.some((p) => p.slug === 'bansuri-dham')) {
    list.unshift(DEFAULT_BANSURI_DHAM_PROJECT);
  }

  // In-memory filters
  if (options?.activeOnly) {
    list = list.filter((p) => p.active !== false);
  }
  if (options?.featuredOnly) {
    list = list.filter((p) => p.featured === true);
  }
  if (options?.city && options.city.trim() !== '') {
    list = list.filter((p) => p.city?.toLowerCase() === options.city?.toLowerCase());
  }
  if (options?.projectType && options.projectType.trim() !== '') {
    list = list.filter((p) => p.projectType?.toLowerCase() === options.projectType?.toLowerCase());
  }
  if (options?.projectStatus && options.projectStatus.trim() !== '') {
    list = list.filter((p) => p.projectStatus?.toLowerCase() === options.projectStatus?.toLowerCase());
  }
  if (options?.minPrice && options.minPrice > 0) {
    list = list.filter((p) => p.startingPrice >= options.minPrice!);
  }
  if (options?.maxPrice && options.maxPrice > 0) {
    list = list.filter((p) => p.startingPrice <= options.maxPrice!);
  }

  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return getProjects({ activeOnly: true, featuredOnly: true });
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION);
      const q = query(colRef, where('slug', '==', cleanSlug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...(d.data() as Omit<Project, 'id'>) };
      }
    } catch (err) {
      console.warn('Firestore getProjectBySlug query failed, checking local:', err);
    }
  }

  const local = getLocalProjects();
  const found = local.find((p) => p.slug?.toLowerCase() === cleanSlug);
  return found || null;
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as Omit<Project, 'id'>) };
      }
    } catch (err) {
      console.warn('Firestore getProjectById failed:', err);
    }
  }

  const local = getLocalProjects();
  return local.find((p) => p.id === id) || null;
}

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const newId = 'proj_' + Math.random().toString(36).substring(2, 9) + Date.now();
  const slug = data.slug && data.slug.trim() !== '' ? generateSlug(data.slug) : generateSlug(data.projectName);

  const newProject: Project = {
    ...data,
    id: newId,
    slug,
    active: data.active ?? true,
    featured: data.featured ?? false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, newId);
      await setDoc(docRef, newProject);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTION}/${newId}`);
    }
  }

  const local = getLocalProjects();
  local.unshift(newProject);
  saveLocalProjects(local);

  return newProject;
}

export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<Project> {
  const existing = await getProjectById(id);
  if (!existing) {
    throw new Error('Project not found');
  }

  const updated: Project = {
    ...existing,
    ...data,
    slug: data.slug ? generateSlug(data.slug) : (data.projectName ? generateSlug(data.projectName) : existing.slug),
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

  const local = getLocalProjects();
  const idx = local.findIndex((p) => p.id === id);
  if (idx !== -1) {
    local[idx] = updated;
  } else {
    local.unshift(updated);
  }
  saveLocalProjects(local);

  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION}/${id}`);
    }
  }

  const local = getLocalProjects();
  saveLocalProjects(local.filter((p) => p.id !== id));
}
