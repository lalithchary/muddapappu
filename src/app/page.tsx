import { Suspense } from 'react';
import Link from 'next/link';
import { repo } from '@/lib/repo-instance';
import { applyQuery } from '@/lib/repo';
import type { DealQuery, StoreId, SortKey, DealTag } from '@/lib/types';
import { FilterBarWrapper } from '@/components/filter-bar-wrapper';
import { DealCard } from '@/components/deal-card';
import { DealCardGallery } from '@/components/deal-card-gallery';
import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import { ViewToggle } from '@/components/view-toggle';
import { CategoryTabs } from '@/components/category-tabs';
import { StoreList } from '@/components/store-list';

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
  const view = get('view');
  if (view && (view === 'list' || view === 'gallery')) q.view = view;
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
  const viewMode = query.view ?? 'list';
  const storeFilter = query.stores;

  const all = await repo().listDeals();
  const filtered = applyQuery(all, query);
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filtered.slice(start, end);
  const counts = await repo().commentCounts();

  return (
    <>
      {/* Tab navigation */}
      <nav className="mb-6 flex border-b border-[var(--color-border)] pb-px" aria-label="Sections">
        <a
          href="/"
          className="border-b-2 border-[var(--color-accent-orange)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)]"
          aria-current="page"
        >
          Deals
        </a>
        <a
          href="/community"
          className="border-b-2 border-transparent px-4 py-2 text-sm text-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors"
        >
          Community Chat
        </a>
      </nav>

      {/* Hero section */}
      <section className="mb-12 px-4 text-center">
        <h1 className="font-display text-3xl font-bold text-text sm:text-4xl lg:text-5xl">
          Best{' '}
          <span className="text-accent-orange">Deals</span>{' '}
          in India
        </h1>
        <p className="mt-2 text-sm text-text-muted max-w-2xl mx-auto">
          Live price tracking across Amazon, Flipkart, Myntra, Ajio & food delivery apps.
          Find verified deals with real-time price drops.
        </p>
      </section>

      {/* Search section */}
      <section className="mb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <FilterBarWrapper initialQuery={query} />
        </div>
      </section>

      {/* View toggle */}
      <section className="mb-4 px-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {filtered.length} deal{filtered.length === 1 ? '' : 's'} found
          </p>
          <ViewToggle />
        </div>
      </section>

      {/* Category tabs */}
      <section className="mb-6 px-4">
        <CategoryTabs />
      </section>

      {/* Store list for multi-store deals */}
      {storeFilter && storeFilter.length > 0 && (
        <section className="mb-6 px-4">
          <StoreList stores={storeFilter} />
        </section>
      )}

      {/* Results grid */}
      <main className="pb-12">
        {pageItems.length === 0 ? (
          <EmptyState query={query} />
        ) : viewMode === 'gallery' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pageItems.map((deal) => (
              <Suspense key={deal.id} fallback={<div className="deal-card-gallery h-40 animate-pulse" />}>
                <DealCardGallery deal={deal} commentCount={counts[deal.slug] ?? 0} />
              </Suspense>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((deal) => (
              <Suspense key={deal.id} fallback={<div className="deal-card h-64 animate-pulse" />}>
                <DealCard deal={deal} commentCount={counts[deal.slug] ?? 0} />
              </Suspense>
            ))}
          </div>
        )}
      </main>

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