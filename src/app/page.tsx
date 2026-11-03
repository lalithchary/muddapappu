import { Suspense } from 'react';
import { repo } from '@/lib/repo-instance';
import { applyQuery } from '@/lib/repo';
import type { DealQuery, StoreId, SortKey, DealTag } from '@/lib/types';
import { FilterBarWrapper } from '@/components/filter-bar-wrapper';
import { DealCard } from '@/components/deal-card';
import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';

function parseQuery(searchParams: Record<string, string | string[] | undefined>): DealQuery {
  const get = (k: string): string | undefined => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const arr = (k: string): string[] | undefined => {
    const v = searchParams[k];
    if (!v) return undefined;
    return Array.isArray(v) ? v : [v];
  };

  const q: DealQuery = {};
  const qv = get('q');
  if (qv) q.q = qv;
  const stores = arr('store');
  if (stores) q.stores = stores as StoreId[];
  const cats = arr('cat');
  if (cats) q.categories = cats;
  const tags = arr('tag');
  if (tags) q.tags = tags as DealTag[];
  const minD = get('minDiscount');
  if (minD) q.minDiscount = Number(minD);
  const minP = get('minPrice');
  if (minP) q.minPrice = Number(minP);
  const maxP = get('maxPrice');
  if (maxP) q.maxPrice = Number(maxP);
  const sort = get('sort');
  if (sort) q.sort = sort as SortKey;
  const page = get('page');
  if (page) q.page = Number(page);
  return q;
}

const PAGE_SIZE = 12;

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const query = parseQuery(sp);
  const page = query.page ?? 1;

  const all = await repo().listDeals();
  const filtered = applyQuery(all, query);
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filtered.slice(start, end);
  const counts = await repo().commentCounts();

  return (
    <>
      {/* Tab navigation */}
      <nav className="mb-6 flex border-b border-ink-800 pb-px" aria-label="Sections">
        <a
          href="/"
          className="border-b-2 border-deal-600 px-4 py-2 text-sm font-semibold text-white"
          aria-current="page"
        >
          Deals
        </a>
        <a
          href="/community"
          className="border-b-2 border-transparent px-4 py-2 text-sm text-ink-500 hover:text-white transition-colors"
        >
          Community Chat
        </a>
      </nav>

      {/* Hero section */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Best <span className="text-deal-600">Deals</span> in India
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Live price tracking across Amazon, Flipkart, Myntra, Ajio & food delivery apps.
        </p>
      </div>

      <FilterBarWrapper initialQuery={query} />

      {/* Results section */}
      <div className="mt-6">
        <p className="mb-3 text-xs text-ink-600">
          {filtered.length} deal{filtered.length === 1 ? '' : 's'} found
        </p>
        {pageItems.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((deal) => (
              <Suspense key={deal.id} fallback={<div className="deal-card h-64 animate-pulse" />}>
                <DealCard deal={deal} commentCount={counts[deal.slug] ?? 0} />
              </Suspense>
            ))}
          </div>
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <Pagination
          current={page}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          href={(p: number) => {
            const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
            params.set('page', String(p));
            return `/?${params.toString()}`;
          }}
        />
      )}
    </>
  );
}