import Link from 'next/link';
import type { DealQuery } from '@/lib/types';

export function EmptyState({ query }: { query?: DealQuery }) {
  return (
    <div className="card flex flex-col items-center gap-4 py-16 text-center">
      <div className="grid place-items-center rounded-2xl bg-ink-800 p-5">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="text-ink-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </div>
      <div>
        <h3 className="text-base font-semibold">No deals match your filters</h3>
        <p className="mt-1 text-sm text-ink-400">
          Try broadening your search or clearing filters.
        </p>
      </div>
      <Link href="/" className="btn-primary py-2 text-xs">
        Reset filters
      </Link>
    </div>
  );
}