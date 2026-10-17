# Cosy Reality — Enterprise Real Estate Management Platform

Cosy Reality is a modern, production-grade real estate web application featuring live plotted inventory management, project showcases (featuring flagship plotted development *Bansuri Dham* on the Yamuna Expressway corridor), associate channel partner networks, multi-tiered 10-level commission calculation engine, 10% Direct Referral payouts, 1:1 Matching Bonus matrix, and full administrative CRM operations.

## Key Features

- **Public Real Estate Experience**:
  - Image-led homepage with cinematic hero, floating feature cards, and 15-year milestone storytelling.
  - Dedicated **Bansuri Dham** spotlight section (58 KM Milestone, Yamuna Expressway, near Jewar Airport).
  - Comprehensive project catalog with master plan area breakdowns (79,452 sqm total area, 29,992 sqm plot area, 20,548 sqm roads).
  - Live Inventory availability matrix with real-time green/yellow/red status indicators (**Booking Open**, **Hold / Waiting**, **Sold**).

- **Associate & Commission Business Plan**:
  - 10-tier commission configuration (20% total pool with 25% upfront clearance).
  - **Direct Referral Commission**: 10% default rate on qualifying plot value.
  - **1:1 Matching Bonus**: Dual-network matching engine balancing Side A (Left) and Side B (Right) volume with carry-forward rules.
  - Comprehensive Channel Partner Portal (`/associate/dashboard`).

- **Internal Staff Operations (`/admin`)**:
  - Role-Based Access Control (`super_admin`, `sales_admin`, `inventory_manager`, `receptionist`).
  - Unit inventory management, lead intake triage, site visit bookings dispatch, and full audit logs.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Backup & Database Restoration

For complete database import and restoration instructions, refer to [BACKUP_RESTORE_GUIDE.md](./BACKUP_RESTORE_GUIDE.md).

```bash
# Dry run database restoration
npx tsx scripts/import-firestore-backup.ts --dry-run

# Execute full Firestore database restoration
npx tsx scripts/import-firestore-backup.ts --confirm
```

## Security Rules Deployment

```bash
# Deploy Firestore rules & composite indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Storage security rules
firebase deploy --only storage:rules
```
# cosyreality
