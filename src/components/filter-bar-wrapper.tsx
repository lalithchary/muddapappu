'use client';

import { useEffect, useState } from 'react';
import { FilterBar } from './filter-bar';
import type { DealQuery } from '@/lib/types';

function parseSearch(sp: URLSearchParams): DealQuery {
  const q: DealQuery = {};
  const v = sp.get('q');
  if (v) q.q = v;
  const stores = sp.get('store');
  if (stores) q.stores = stores.split(',') as DealQuery['stores'];
  const cats = sp.get('cat');
  if (cats) q.categories = cats.split(',');
  const tags = sp.get('tag');
  if (tags) q.tags = tags.split(',') as DealQuery['tags'];
  const minD = sp.get('minDiscount');
  if (minD) q.minDiscount = Number(minD);
  const minP = sp.get('minPrice');
  if (minP) q.minPrice = Number(minP);
  const maxP = sp.get('maxPrice');
  if (maxP) q.maxPrice = Number(maxP);
  const sort = sp.get('sort');
  if (sort) q.sort = sort as DealQuery['sort'];
  return q;
}

export function FilterBarWrapper({
  initialQuery,
}: {
  initialQuery: DealQuery;
}) {
  // Use server-provided initialQuery as the initial state to avoid hydration mismatch
  const [query, setQuery] = useState<DealQuery>(initialQuery);

  useEffect(() => {
    // Update from URL on client-side mounts (for client-side navigation)
    setQuery(parseSearch(new URLSearchParams(window.location.search)));
  }, []);

  return (
    <FilterBar
      query={query}
      onQuery={(next) => {
        const params = new URLSearchParams();
        const merge = { ...query, ...next, page: 1 };
        if (merge.q) params.set('q', merge.q);
        if (merge.stores?.length) params.set('store', merge.stores.join(','));
        if (merge.categories?.length) params.set('cat', merge.categories.join(','));
        if (merge.tags?.length) params.set('tag', merge.tags.join(','));
        if (merge.minDiscount !== undefined) params.set('minDiscount', String(merge.minDiscount));
        if (merge.minPrice !== undefined) params.set('minPrice', String(merge.minPrice));
        if (merge.maxPrice !== undefined) params.set('maxPrice', String(merge.maxPrice));
        if (merge.sort) params.set('sort', merge.sort);
        window.location.href = `/?${params.toString()}`;
      }}
      onClear={() => {
        window.location.href = '/';
      }}
    />
  );
}