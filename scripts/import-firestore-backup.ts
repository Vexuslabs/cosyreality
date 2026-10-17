import * as fs from 'fs';
import * as path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

interface ImportOptions {
  filePath: string;
  dryRun: boolean;
  confirmed: boolean;
  overwrite: boolean;
  collectionFilter?: string;
}

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const options: ImportOptions = {
    filePath: path.resolve(process.cwd(), 'cosy-reality-firestore-backup.json'),
    dryRun: false,
    confirmed: false,
    overwrite: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run' || arg === '-d') {
      options.dryRun = true;
    } else if (arg === '--confirm' || arg === '-y') {
      options.confirmed = true;
    } else if (arg === '--no-overwrite') {
      options.overwrite = false;
    } else if (arg === '--file' || arg === '-f') {
      if (args[i + 1]) {
        options.filePath = path.resolve(process.cwd(), args[i + 1]);
        i++;
      }
    } else if (arg === '--collection' || arg === '-c') {
      if (args[i + 1]) {
        options.collectionFilter = args[i + 1];
        i++;
      }
    }
  }

  return options;
}

function deserializeValue(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object') {
    if (val._type === 'timestamp') {
      if (typeof val.seconds === 'number' && typeof val.nanoseconds === 'number') {
        return new Timestamp(val.seconds, val.nanoseconds);
      }
      if (val.iso) {
        return Timestamp.fromDate(new Date(val.iso));
      }
    }
    if (Array.isArray(val)) {
      return val.map(deserializeValue);
    }
    const res: Record<string, any> = {};
    for (const k of Object.keys(val)) {
      res[k] = deserializeValue(val[k]);
    }
    return res;
  }
  return val;
}

async function runImport() {
  const options = parseArgs();

  console.log('====================================================');
  console.log('COSY REALITY — FIRESTORE DATABASE RESTORATION');
  console.log('====================================================');
  console.log(`Source File: ${options.filePath}`);
  console.log(`Dry Run Mode: ${options.dryRun ? 'YES (Simulated only)' : 'NO'}`);
  console.log(`Overwrite Existing Docs: ${options.overwrite ? 'YES' : 'NO'}`);
  if (options.collectionFilter) {
    console.log(`Collection Filter: ${options.collectionFilter}`);
  }
  console.log('----------------------------------------------------');

  if (!fs.existsSync(options.filePath)) {
    console.error(`ERROR: Backup file not found at: ${options.filePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(options.filePath, 'utf-8');
  let backupData: any;
  try {
    backupData = JSON.parse(fileContent);
  } catch (err: any) {
    console.error(`ERROR: Invalid JSON in backup file: ${err.message}`);
    process.exit(1);
  }

  if (!backupData.collections || typeof backupData.collections !== 'object') {
    console.error('ERROR: Backup file format invalid. Missing "collections" map.');
    process.exit(1);
  }

  if (!options.dryRun && !options.confirmed) {
    console.warn('SAFETY ABORT:');
    console.warn('Writing to Firestore requires explicit confirmation.');
    console.warn('To proceed with the import, rerun with the --confirm flag:');
    console.warn('  npx tsx scripts/import-firestore-backup.ts --confirm');
    console.warn('To perform a non-destructive simulation run first:');
    console.warn('  npx tsx scripts/import-firestore-backup.ts --dry-run');
    process.exit(0);
  }

  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const collections = Object.keys(backupData.collections);
  const importSummary: Record<string, { total: number; imported: number; skipped: number; failed: number }> = {};

  for (const colName of collections) {
    if (options.collectionFilter && options.collectionFilter !== colName) {
      continue;
    }

    const docsMap = backupData.collections[colName];
    const docIds = Object.keys(docsMap);
    importSummary[colName] = { total: docIds.length, imported: 0, skipped: 0, failed: 0 };

    console.log(`\nProcessing collection '${colName}' (${docIds.length} documents)...`);

    for (const docId of docIds) {
      const rawData = docsMap[docId];
      const deserializedData = deserializeValue(rawData);

      if (options.dryRun) {
        console.log(`  [DRY RUN] Would write doc '${docId}' into '${colName}'`);
        importSummary[colName].imported++;
        continue;
      }

      try {
        const docRef = doc(db, colName, docId);

        if (!options.overwrite) {
          const existingSnap = await getDoc(docRef);
          if (existingSnap.exists()) {
            console.log(`  [SKIP] Doc '${docId}' exists in '${colName}' (overwrite disabled)`);
            importSummary[colName].skipped++;
            continue;
          }
        }

        await setDoc(docRef, deserializedData, { merge: true });
        console.log(`  [WRITTEN] Doc '${docId}' imported into '${colName}'`);
        importSummary[colName].imported++;
      } catch (err: any) {
        console.error(`  [FAILED] Doc '${docId}' in '${colName}': ${err.message}`);
        importSummary[colName].failed++;
      }
    }
  }

  console.log('\n====================================================');
  console.log(options.dryRun ? 'DRY-RUN SIMULATION COMPLETE' : 'DATABASE RESTORATION COMPLETED');
  console.log('====================================================');
  console.table(importSummary);
  process.exit(0);
}

runImport().catch((err) => {
  console.error('Import script failed:', err);
  process.exit(1);
});
