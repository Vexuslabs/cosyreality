import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface StorageManifestItem {
  id: string;
  category: 'hero_image' | 'gallery' | 'master_plan' | 'connectivity' | 'amenity' | 'branding' | 'brochure';
  entity: string;
  filename: string;
  storagePath: string;
  cloudStorageUri: string;
  sourceUrl: string;
  contentType: string;
  description: string;
  downloadedLocally: boolean;
  localPath?: string;
  fileSizeBytes?: number;
}

const STORAGE_BUCKET = process.env.VITE_FIREBASE_STORAGE_BUCKET || 'cosyproject0512.firebasestorage.app';

const ASSETS_TO_MANIFEST: Omit<StorageManifestItem, 'cloudStorageUri' | 'downloadedLocally'>[] = [
  // 1. Branding & Identity
  {
    id: 'logo-brand-icon',
    category: 'branding',
    entity: 'Cosy Reality Corporate',
    filename: 'logo.svg',
    storagePath: 'branding/logo.svg',
    sourceUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    contentType: 'image/jpeg',
    description: 'Corporate real estate icon & vector branding header logo',
  },
  {
    id: 'hero-homepage-main',
    category: 'hero_image',
    entity: 'Homepage Hero Banner',
    filename: 'homepage-hero.jpg',
    storagePath: 'banners/homepage-hero.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    contentType: 'image/jpeg',
    description: 'Cinematic plotted township development hero visual with open skies and infrastructure',
  },

  // 2. Bansuri Dham Project
  {
    id: 'bansuri-dham-hero',
    category: 'hero_image',
    entity: 'Bansuri Dham (Yamuna Expressway)',
    filename: 'bansuri-dham-hero.jpg',
    storagePath: 'projects/bansuri-dham/hero.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    contentType: 'image/jpeg',
    description: 'Main flagship showcase image: 58 KM Milestone, Yamuna Expressway near Jewar Airport',
  },
  {
    id: 'bansuri-dham-master-plan',
    category: 'master_plan',
    entity: 'Bansuri Dham (Yamuna Expressway)',
    filename: 'bansuri-dham-master-plan.jpg',
    storagePath: 'projects/bansuri-dham/master-plan.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1400&q=80',
    contentType: 'image/jpeg',
    description: 'Architectural sector layout & site planning map (79,452 sqm breakdown: 29,992 sqm plot area, 20,548 sqm roads)',
  },
  {
    id: 'bansuri-dham-gallery-01',
    category: 'gallery',
    entity: 'Bansuri Dham (Yamuna Expressway)',
    filename: 'bansuri-gallery-road-infrastructure.jpg',
    storagePath: 'projects/bansuri-dham/gallery/roads.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    contentType: 'image/jpeg',
    description: 'Wide 40-ft and 60-ft internal and arterial sector road networks and drainage execution',
  },
  {
    id: 'bansuri-dham-gallery-02',
    category: 'gallery',
    entity: 'Bansuri Dham (Yamuna Expressway)',
    filename: 'bansuri-gallery-park-greenery.jpg',
    storagePath: 'projects/bansuri-dham/gallery/park.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    contentType: 'image/jpeg',
    description: 'Central landscaped 2,878 sqm community park and green recreation reserves',
  },
  {
    id: 'bansuri-dham-gallery-03',
    category: 'gallery',
    entity: 'Bansuri Dham (Yamuna Expressway)',
    filename: 'bansuri-gallery-demarcation.jpg',
    storagePath: 'projects/bansuri-dham/gallery/demarcation.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    contentType: 'image/jpeg',
    description: 'Individual plot boundary pillars, numbered layout marking, and street frontage',
  },
  {
    id: 'bansuri-dham-connectivity-expressway',
    category: 'connectivity',
    entity: 'Bansuri Dham Regional Corridor',
    filename: 'yamuna-expressway-connectivity.jpg',
    storagePath: 'projects/bansuri-dham/connectivity/expressway.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    contentType: 'image/jpeg',
    description: 'Yamuna Expressway 6-lane access highway and interchanges',
  },
  {
    id: 'bansuri-dham-connectivity-airport',
    category: 'connectivity',
    entity: 'Bansuri Dham Regional Corridor',
    filename: 'jewar-airport-corridor.jpg',
    storagePath: 'projects/bansuri-dham/connectivity/jewar-airport.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    contentType: 'image/jpeg',
    description: 'Noida International Airport (Jewar Airport) vicinity and cargo multi-modal transport hub',
  },

  // 3. Amenity Tiles
  {
    id: 'amenity-clubhouse-gym',
    category: 'amenity',
    entity: 'Bansuri Dham Amenities',
    filename: 'amenity-clubhouse.jpg',
    storagePath: 'amenities/clubhouse.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    contentType: 'image/jpeg',
    description: 'Community clubhouse and recreation amenities',
  },
  {
    id: 'amenity-solar-lighting',
    category: 'amenity',
    entity: 'Bansuri Dham Amenities',
    filename: 'amenity-solar.jpg',
    storagePath: 'amenities/solar-lights.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    contentType: 'image/jpeg',
    description: 'Sustainable solar street illumination along all arterial pathways',
  },
  {
    id: 'amenity-cctv-surveillance',
    category: 'amenity',
    entity: 'Bansuri Dham Amenities',
    filename: 'amenity-cctv.jpg',
    storagePath: 'amenities/cctv-security.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
    contentType: 'image/jpeg',
    description: '24/7 boundary gated surveillance and security post check-ins',
  },

  // 4. Palm Meadows Project
  {
    id: 'palm-meadows-hero',
    category: 'hero_image',
    entity: 'Cosy Palm Meadows',
    filename: 'palm-meadows-hero.jpg',
    storagePath: 'projects/palm-meadows/hero.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    contentType: 'image/jpeg',
    description: 'Gated residential villa enclave & luxury residences',
  },

  // 5. Crystal Towers Project
  {
    id: 'crystal-towers-hero',
    category: 'hero_image',
    entity: 'Cosy Crystal Towers',
    filename: 'crystal-towers-hero.jpg',
    storagePath: 'projects/crystal-towers/hero.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    contentType: 'image/jpeg',
    description: 'High-rise urban residential & commercial mixed-use retail hub',
  },

  // 6. Brochure Documentation
  {
    id: 'brochure-bansuri-dham',
    category: 'brochure',
    entity: 'Bansuri Dham Official Collateral',
    filename: 'bansuri-dham-official-brochure.pdf',
    storagePath: 'documents/bansuri-dham-brochure.pdf',
    sourceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1000&q=80',
    contentType: 'application/pdf',
    description: 'Radha Rani Residency / NCR Group authorized project brochure reference',
  },
];

async function run() {
  console.log('====================================================');
  console.log('COSY REALITY — FIREBASE STORAGE MANIFEST & BACKUP');
  console.log('====================================================');
  console.log(`Cloud Storage Bucket: ${STORAGE_BUCKET}`);

  const backupDir = path.resolve(process.cwd(), 'firebase-storage-backup');
  fs.mkdirSync(backupDir, { recursive: true });

  const manifestItems: StorageManifestItem[] = [];
  let downloadedCount = 0;
  let totalBytes = 0;

  for (const item of ASSETS_TO_MANIFEST) {
    const cloudStorageUri = `gs://${STORAGE_BUCKET}/${item.storagePath}`;
    const localFilePath = path.join(backupDir, item.storagePath);
    fs.mkdirSync(path.dirname(localFilePath), { recursive: true });

    let isDownloaded = false;
    let size = 0;

    try {
      if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 0) {
        size = fs.statSync(localFilePath).size;
        isDownloaded = true;
      } else {
        execSync(`curl -s -L --max-time 15 "${item.sourceUrl}" -o "${localFilePath}"`);
        if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 0) {
          size = fs.statSync(localFilePath).size;
          isDownloaded = true;
          downloadedCount++;
        }
      }
    } catch (err: any) {
      console.warn(`Could not cache binary for ${item.id}: ${err.message}`);
    }

    totalBytes += size;

    manifestItems.push({
      ...item,
      cloudStorageUri,
      downloadedLocally: isDownloaded,
      localPath: isDownloaded ? path.relative(process.cwd(), localFilePath) : undefined,
      fileSizeBytes: size > 0 ? size : undefined,
    });
  }

  const manifestResult = {
    metadata: {
      appName: 'Cosy Reality',
      exportDate: new Date().toISOString(),
      storageBucket: STORAGE_BUCKET,
      totalAssetsCount: manifestItems.length,
      downloadedBinariesCount: manifestItems.filter((i) => i.downloadedLocally).length,
      totalBinarySizeBytes: totalBytes,
      totalBinarySizeFormatted: `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`,
    },
    assets: manifestItems,
  };

  const manifestPath = path.resolve(process.cwd(), 'firebase-storage-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifestResult, null, 2), 'utf-8');

  // Also write to public/ for web access
  const publicPath = path.resolve(process.cwd(), 'public', 'firebase-storage-manifest.json');
  fs.writeFileSync(publicPath, JSON.stringify(manifestResult, null, 2), 'utf-8');

  console.log(`\nManifest written to: ${manifestPath}`);
  console.log(`Assets Manifested: ${manifestItems.length}`);
  console.log(`Binaries Cached Locally under firebase-storage-backup/: ${manifestResult.metadata.downloadedBinariesCount}`);
  console.log(`Total Downloaded Size: ${manifestResult.metadata.totalBinarySizeFormatted}`);
  console.log('====================================================');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
