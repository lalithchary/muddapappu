'use client';

import { X, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { STORE_LIST } from '@/lib/stores';
import type { DealQuery, StoreId } from '@/lib/types';

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
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
        <input
          value={query.q ?? ''}
          onChange={(e) => onQuery({ q: e.target.value })}
          placeholder="Search deals, brands, stores..."
          className="search-input"
        />
      </div>

      {/* Store filters */}
      <div className="flex flex-wrap gap-2">
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

      {/* Sort and price filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort buttons */}
        <div className="flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-card p-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => onQuery({ sort: s.key })}
              className={cn(
                'category-btn',
                query.sort === s.key ? 'active' : '',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>₹</span>
          <input
            type="number"
            placeholder="Min"
            value={query.minPrice ?? ''}
            min={0}
            onChange={(e) => onQuery({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-20 rounded-lg border border-[var(--color-border)] bg-card px-2 py-1.5 text-text focus:border-accent-orange focus:outline-none"
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Max"
            value={query.maxPrice ?? ''}
            min={0}
            onChange={(e) => onQuery({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-20 rounded-lg border border-[var(--color-border)] bg-card px-2 py-1.5 text-text focus:border-accent-orange focus:outline-none"
          />
        </div>

        {/* Tags */}
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

        {/* Clear button */}
        {hasFilters && (
          <button
            onClick={onClear}
            className="ml-auto flex items-center gap-1 text-sm text-text-muted hover:text-text"
          >
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

type SortKey = 'newest' | 'discount' | 'price-asc' | 'price-desc' | 'ending';
type DealTag = 'bestseller' | 'budget' | 'trending' | 'hot';