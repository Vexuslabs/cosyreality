import { InventoryStatus, ProjectStatus, LeadStage } from '../types';

export function parseDateSafe(val: any): Date | null {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val?.toDate === 'function') {
    try {
      const d = val.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch {
      // ignore
    }
  }
  if (typeof val === 'object' && typeof val?.seconds === 'number') {
    const d = new Date(val.seconds * 1000);
    if (!isNaN(d.getTime())) return d;
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  const parsed = typeof val === 'number' ? new Date(val) : new Date(String(val));
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRShort(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹${cr} Cr`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${lk} Lakh`;
  }
  if (amount >= 1000) {
    const k = (amount / 1000).toFixed(1).replace(/\.0$/, '');
    return `₹${k} K`;
  }
  return `₹${amount}`;
}

export function formatDate(timestamp: any): string {
  const d = parseDateSafe(timestamp);
  if (!d) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(timestamp: any): string {
  const d = parseDateSafe(timestamp);
  if (!d) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getInventoryStatusLabel(status: InventoryStatus | string | undefined): string {
  switch (status) {
    case 'booking':
      return 'Booking Open';
    case 'waiting':
      return 'Waiting / Hold';
    case 'sold':
      return 'Sold';
    default:
      return 'Available';
  }
}

export function getInventoryStatusBadgeClasses(status: InventoryStatus | string | undefined): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'booking':
      return {
        bg: 'bg-emerald-50 text-emerald-800',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-[#16A34A]',
      };
    case 'waiting':
      return {
        bg: 'bg-amber-50 text-amber-800',
        text: 'text-amber-900',
        border: 'border-amber-200',
        dot: 'bg-[#EAB308]',
      };
    case 'sold':
      return {
        bg: 'bg-rose-50 text-rose-800',
        text: 'text-rose-800',
        border: 'border-rose-200',
        dot: 'bg-[#DC2626]',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getProjectStatusBadge(status: ProjectStatus | string | undefined): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'Ongoing':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
      };
    case 'Upcoming':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
      };
    case 'Completed':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-200',
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-200',
      };
  }
}

export function getLeadStageLabel(stage: LeadStage | string | undefined): string {
  switch (stage) {
    case 'new':
      return 'New Lead';
    case 'contacted':
      return 'Contacted';
    case 'interested':
      return 'Interested';
    case 'site_visit':
    case 'site_visit_scheduled':
      return 'Site Visit Scheduled';
    case 'negotiation':
      return 'In Negotiation';
    case 'booking':
    case 'booking_done':
      return 'Booking Done';
    case 'closed_won':
      return 'Closed Won';
    case 'closed_lost':
      return 'Closed Lost';
    default:
      return 'Active Lead';
  }
}

export function getLeadStageBadge(stage: LeadStage | string | undefined): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  const label = getLeadStageLabel(stage);
  switch (stage) {
    case 'new':
      return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', label };
    case 'contacted':
      return { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', label };
    case 'interested':
      return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', label };
    case 'site_visit':
    case 'site_visit_scheduled':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label };
    case 'negotiation':
      return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', label };
    case 'booking':
    case 'booking_done':
    case 'closed_won':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label };
    case 'closed_lost':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', label };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', label };
  }
}
