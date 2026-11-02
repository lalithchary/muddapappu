import { cn } from '@/lib/cn';
import type { DealResult, Status } from '@/lib/types';

const LABELS: Record<Status, string> = {
  active: 'Live',
  expiring: 'Expired',
  expired: 'Expired',
};

const CLASSES: Record<Status, string> = {
  active: 'status-active',
  expiring: 'status-expiring',
  expired: 'status-expired',
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn('status-badge', CLASSES[status])}>{LABELS[status]}</span>;
}

export function formatCountdown(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return 'Expired';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  return `${h}h ${m}m`;
}

export function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}