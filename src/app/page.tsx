import { Suspense } from 'react';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { repo } from '@/lib/repo-instance';
import { applyQuery } from '@/lib/repo';
import type { DealQuery, StoreId, SortKey, DealTag } from '@/lib/types';
import { FilterBarWrapper } from '@/components/filter-bar-wrapper';
import { DealCard } from '@/components/deal-card';
import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import { ViewToggle } from '@/components/view-toggle';
import { STORE_LIST } from '@/lib/stores';

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

const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: '⚡' },
  { id: 'mobiles', label: 'Mobiles', icon: '📱' },
  { id: 'laptops', label: 'Laptops', icon: '💻' },
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'footwear', label: 'Footwear', icon: '👟' },
  { id: 'beauty', label: 'Beauty', icon: '✨' },
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'grocery', label: 'Grocery', icon: '🛒' },
];

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
      {/* Hero Section */}
      <section className="mb-12 px-4 text-center">
        <h1 className="font-display text-3xl font-bold text-text sm:text-4xl lg:text-5xl">
          Best{' '}
          <span className="text-accent-orange">
            Deals
          </span>{' '}
          in India
        </h1>
        <p className="mt-3 text-sm text-text-muted max-w-2xl mx-auto">
          Live price tracking across Amazon, Flipkart, Myntra, Ajio & food delivery apps.
          Find verified deals with real-time price drops.
        </p>
      </section>

      {/* Search Section */}
      <section className="mb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <FilterBarWrapper initialQuery={query} />
        </div>
      </section>

      {/* Results Header */}
      <section className="mb-4 px-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {filtered.length} deal{filtered.length === 1 ? '' : 's'} found
          </p>
          <ViewToggle />
        </div>
      </section>

      {/* Categories */}
      <section className="mb-6 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="category-btn"
              style={{
                backgroundColor: query.categories?.includes(cat.id as any) ? 'var(--color-accent-orange)' : '',
                color: query.categories?.includes(cat.id as any) ? 'var(--color-bg)' : '',
              }}
              onClick={() => {
                const newCategories = query.categories
                  ? query.categories.filter(c => c !== cat.id)
                  : [cat.id];
                // Update URL
                const params = new URLSearchParams(window.location.search);
                if (newCategories.length > 0) {
                  params.set('cat', newCategories.join(','));
                } else {
                  params.delete('cat');
                }
                window.location.href = `/?${params.toString()}`;
              }}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Results Grid */}
      <main className="pb-12">
        {pageItems.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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