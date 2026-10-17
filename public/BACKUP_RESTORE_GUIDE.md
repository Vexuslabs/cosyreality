# Cosy Reality — Complete Project Backup & Restoration Guide

This document provides complete instructions for unzipping, installing, configuring, and restoring the **Cosy Reality** real estate application codebase, its Cloud Firestore database, Firebase Security Rules, and Storage assets.

---

## 1. Package Deliverables Overview

The backup package consists of the following core deliverables:

| Deliverable | File / Directory | Description |
| :--- | :--- | :--- |
| **Complete Source Archive** | `cosy-reality-complete.zip` | Full application source code, Vite build configuration, Tailwind CSS, TypeScript definitions, security rules, and public assets. |
| **Database Backup** | `cosy-reality-firestore-backup.json` | Complete portable JSON export of all 15 Firestore collections (47 documents) with preserved document IDs, nested schemas, and serialized timestamps. |
| **Database Import Script** | `scripts/import-firestore-backup.ts` | Automated restoration tool supporting dry-run verification, timestamp reconstruction, and overwrite protection. |
| **Database Export Script** | `scripts/export-firestore-backup.ts` | Automated script to dump current live Firestore data back into JSON format. |
| **Auth User Reference** | `firebase-auth-users-reference.json` | Metadata and RBAC role specifications for administrative and staff accounts (zero passwords/secrets included). |
| **Storage Asset Manifest** | `firebase-storage-manifest.json` | Catalog of all project imagery, blueprints, hero banners, brochures, and regional connectivity maps. |
| **Storage Binaries** | `firebase-storage-backup/` | Local directory containing cached binary copies of hero images, gallery photographs, amenities, and document placeholders. |

---

## 2. Quickstart Installation & Local Development

### Step 2.1: Unzip the Source Code
```bash
unzip cosy-reality-complete.zip -d cosy-reality
cd cosy-reality
```

### Step 2.2: Install Node.js Dependencies
Ensure you are using **Node.js 18+** or **Node.js 20+**:
```bash
npm install
```

### Step 2.3: Environment Configuration
Create a `.env` file in the project root based on `.env.example`:
```bash
cp .env.example .env
```

Open `.env` and configure your Firebase Web App credentials (available in the Firebase Console under **Project Settings > General > Your Apps**):
```env
# Server / AI Studio Host Port
PORT=3000

# Firebase Client Configuration
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:..."
```

### Step 2.4: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Restoring the Firestore Database

The portable backup file `cosy-reality-firestore-backup.json` contains full document trees for the following 15 collections:
- `settings`: Global branding, company contact, 15-year milestone facts.
- `projects`: Flagship plotted development (*Bansuri Dham*) and master projects.
- `inventory`: Real-time unit availability grid (*Booking Open*, *Hold/Waiting*, *Sold*).
- `leads`: CRM customer pipeline inquiries.
- `siteVisits`: Scheduled on-ground site visit registrations.
- `associates`: Channel partner registry and 10-level hierarchy trees.
- `testimonials`: Verified client and homeowner reviews.
- `users`: Staff RBAC profiles (`super_admin`, `sales_admin`, `inventory_manager`, `receptionist`).
- `statusHistory`: Immutable audit history of inventory transitions.
- `auditLogs`: Administrative actions and financial change history.
- `qualifyingTransactions`: Verified customer property purchases.
- `commissionRecords`: 10-level tiered multi-tier commission ledger.
- `matchingRecords`: 1:1 dual-network matching bonus cycle statements.
- `directReferralRecords`: Direct referral records (10% rate).
- `commissionPlanConfig`: Mathematical configuration parameters.

### Step 3.1: Run a Non-Destructive Dry Run Simulation
Validate JSON parsing, document IDs, and target collections without altering the database:
```bash
npx tsx scripts/import-firestore-backup.ts --dry-run
```

### Step 3.2: Execute Live Database Import
Once verified, restore all documents into your Firestore database with the `--confirm` flag:
```bash
npx tsx scripts/import-firestore-backup.ts --confirm
```

### Optional Import Flags:
- **Prevent Overwriting Existing Documents**:
  ```bash
  npx tsx scripts/import-firestore-backup.ts --confirm --no-overwrite
  ```
- **Restore a Single Collection Only**:
  ```bash
  npx tsx scripts/import-firestore-backup.ts --confirm --collection projects
  ```
- **Custom Backup File Path**:
  ```bash
  npx tsx scripts/import-firestore-backup.ts --confirm --file /path/to/custom-backup.json
  ```

---

## 4. Recreating Admin Authentication

Firebase Authentication stores credentials in Google's managed identity system. For security, passwords cannot be exported. To establish administrative access in your new Firebase project:

### Method A: Via Firebase Console
1. Navigate to **Firebase Console > Authentication > Users**.
2. Click **Add User**.
3. Create the administrative email:
   - Email: `super_admin@cosyreality.com` (or your preferred admin email).
   - Password: Choose a strong password (minimum 8 characters).
4. In Firestore, create or verify the corresponding document under the `users` collection:
   - Collection: `users`
   - Document ID: `<firebase_user_uid>`
   - Fields:
     ```json
     {
       "uid": "<firebase_user_uid>",
       "name": "Super Administrator",
       "email": "super_admin@cosyreality.com",
       "role": "super_admin",
       "active": true,
       "createdAt": 1787312718000
     }
     ```

### Method B: One-Click Demo Mode (Local Testing)
On the `/admin/login` page, the application includes pre-configured demo access buttons (**Super Admin**, **Sales Manager**, **Inventory Manager**, and **Telecaller**) allowing immediate local inspection without manual user creation.

---

## 5. Deploying Firebase Security Rules & Indexes

### Deploy Firestore Rules
The file `firestore.rules` enforces multi-role access control (RBAC), allowing public reads on projects/inventory/settings while restricting mutations and financial ledgers to authorized staff:
```bash
firebase deploy --only firestore:rules
```

### Deploy Firestore Composite Indexes
The file `firestore.indexes.json` contains compound indexes for sorting live inventory, commissions, and dual-side matching transactions:
```bash
firebase deploy --only firestore:indexes
```

### Deploy Cloud Storage Security Rules
The file `storage.rules` permits public read access to project brochures and imagery while requiring authentication for uploads:
```bash
firebase deploy --only storage:rules
```

---

## 6. Verification Checklist

After restoring the database and starting the development server, verify the following core pages:

| Route | Feature to Verify | Expected Behavior |
| :--- | :--- | :--- |
| `/` | Public Homepage | Renders cinematic hero with Yamuna Expressway imagery, floating feature cards, Bansuri Dham spotlight, and live inventory preview. |
| `/projects` | Projects Catalog | Displays all active projects (including *Bansuri Dham*). |
| `/projects/bansuri-dham` | Project Detail Page | Shows 79,452 sqm master plan breakdown, sector road facts (20,548 sqm), amenities, and interactive site plan. |
| `/inventory` | Live Property Grid | Displays plots with filterable statuses: **Booking Open** (Green), **Hold / Waiting** (Yellow), and **Sold** (Red). |
| `/commission-plan` | Associate Business Plan | Previews 10-tier commission calculator, 10% Direct Referral breakdown, and 1:1 Matching Engine framework. |
| `/associate/dashboard` | Associate Portal | Displays 6 summary commission cards, Dual-Side Network volume cards (Side A / Side B / Matched), and ledger tables. |
| `/admin/login` | Admin Authentication | Accessible via staff credentials or one-click role buttons. |
| `/admin/dashboard` | Admin Console | Loads system metrics, inventory status management, and audit logs. |
| `/admin/commission-plan` | Commission Governance | Allows Super Admin to configure matching rates, ratios, carry-forward rules, and calculation basis. |

---

## 7. Creating a New Backup Anytime

To export a fresh snapshot of your database in the future:
```bash
npx tsx scripts/export-firestore-backup.ts
```
The script will output an updated `cosy-reality-firestore-backup.json` containing all live collections and document trees.
