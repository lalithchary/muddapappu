'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { STORE_LIST, CATEGORIES } from '@/lib/stores';
import type { DealQuery, StoreId, SortKey, DealTag } from '@/lib/types';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'discount', label: 'Discount' },
  { key: 'price-asc', label: 'Price: Low → High' },
  { key: 'price-desc', label: 'Price: High → Low' },
  { key: 'ending', label: 'Ending Soon' },
];

const TAGS: { key: DealTag; label: string }[] = [
  { key: 'bestseller', label: 'Bestseller' },
  { key: 'budget', label: 'Budget' },
  { key: 'trending', label: 'Trending' },
  { key: 'hot', label: 'Hot' },
];

export function FilterBar({
  query,
  onQuery,
  onClear,
}: {
  query: DealQuery;
  onQuery: (next: Partial<DealQuery>) => void;
  onClear: () => void;
}) {
  const hasFilters =
    (query.stores && query.stores.length > 0) ||
    (query.categories && query.categories.length > 0) ||
    (query.tags && query.tags.length > 0) ||
    query.minDiscount !== undefined ||
    query.maxPrice !== undefined ||
    query.minPrice !== undefined ||
    query.q !== undefined;

  return (
    <div className="space-y-3">
      {/* Row 1: search + quick filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query.q ?? ''}
            onChange={(e) => onQuery({ q: e.target.value })}
            placeholder="Search deals, brands, stores…"
            className="w-full rounded-xl border border-ink-700 bg-ink-900/60 py-2.5 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-500 focus:border-deal-600 focus:outline-none focus:ring-1 focus:ring-deal-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Store pills */}
          {STORE_LIST.map((s) => {
            const active = query.stores?.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => {
                  const set = new Set(query.stores ?? []);
                  if (active) set.delete(s.id);
                  else set.add(s.id);
                  onQuery({ stores: set.size ? Array.from(set) as StoreId[] : undefined });
                }}
                className={cn('chip', active && 'chip-active')}
                style={{ borderColor: s.color + '55', color: s.color }}
              >
                {s.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: sort + price range + tags */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-ink-700 bg-ink-900/60 p-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => onQuery({ sort: s.key })}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                query.sort === s.key
                  ? 'bg-deal-600 text-ink-100'
                  : 'text-ink-500 hover:bg-ink-800 hover:text-ink-100',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span>₹</span>
          <input
            type="number"
            placeholder="Min"
            value={query.minPrice ?? ''}
            min={0}
            onChange={(e) =>
              onQuery({ minPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-20 rounded-lg border border-ink-700 bg-ink-900/60 px-2 py-1.5 text-ink-100 focus:border-deal-600 focus:outline-none"
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Max"
            value={query.maxPrice ?? ''}
            min={0}
            onChange={(e) =>
              onQuery({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-20 rounded-lg border border-ink-700 bg-ink-900/60 px-2 py-1.5 text-ink-100 focus:border-deal-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((t) => {
            const active = query.tags?.includes(t.key);
            return (
              <button
                key={t.key}
                onClick={() => {
                  const set = new Set(query.tags ?? []);
                  if (active) set.delete(t.key);
                  else set.add(t.key);
                  onQuery({ tags: set.size ? Array.from(set) as DealTag[] : undefined });
                }}
                className={cn('chip', active && 'chip-active')}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button
            onClick={onClear}
            className="ml-auto flex items-center gap-1 text-xs text-ink-500 hover:text-ink-100"
          >
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>
    </div>
  );
}