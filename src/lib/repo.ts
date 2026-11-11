/**
 * Storage-agnostic data layer.
 *
 * The app talks to a `Repo`, and at runtime picks an implementation:
 *  - JsonRepo    (src/lib/repo-json.ts) — files under data/store/*.json
 *                → zero-setup, perfect for local dev, GitHub Pages, or a
 *                  Raspberry Pi box. Git commits = your "database".
 *  - SupabaseRepo (src/lib/repo-supabase.ts) — Postgres on Supabase
 *                → recommended for Vercel production.
 *
 * Both implement identical semantics: upsert-by-id, list, search.
 */
import type { Comment, Coupon, Deal, DealQuery, DealResult } from './types';
import { dealStatus, discountPct, endsInSeconds } from './status';

export interface Repo {
  listDeals(): Promise<DealResult[]>;
  getDeal(slug: string): Promise<DealResult | null>;
  saveDeal(deal: Deal): Promise<void>;
  deleteDeal(id: string): Promise<void>;

  listCoupons(): Promise<Coupon[]>;
  saveCoupon(coupon: Coupon): Promise<void>;
  deleteCoupon(id: string): Promise<void>;

  /** bump verifiedAt + price for a deal (called by ingest scripts) */
  touchDeal(id: string, patch: Partial<Deal>): Promise<void>;

  allSlugs(): Promise<string[]>;

  // Community ----------------------------------------------------------------
  addComment(comment: Comment): Promise<void>;
  listComments(dealSlug?: string): Promise<Comment[]>;
  /** Map of dealSlug -> comment count, used to render badges on deal tiles. */
  commentCounts(): Promise<Record<string, number>>;
}

export interface QueryOptions {
  /** include expired deals (archive view) */
  includeExpired?: boolean;
}

/** Apply filter/sort/pagination to a deal list (shared by both repos) */
export function applyQuery(
  deals: DealResult[],
  q: DealQuery,
  now: number = Date.now(),
): DealResult[] {
  let out = deals;

  if (q.status && q.status !== 'all') {
    out = out.filter((d) => d.status === q.status);
  } else if (!q.status) {
    // default: hide expired from main listings
    out = out.filter((d) => d.status !== 'expired');
  }

  if (q.stores && q.stores.length > 0) {
    const s = new Set(q.stores);
    out = out.filter((d) => s.has(d.store));
  }

  if (q.categories && q.categories.length > 0) {
    const c = new Set(q.categories);
    out = out.filter((d) => c.has(d.category));
  }

  if (q.tags && q.tags.length > 0) {
    const t = new Set(q.tags);
    out = out.filter((d) => d.tags.some((tag) => t.has(tag as any)));
  }

  if (q.minDiscount !== undefined) {
    out = out.filter((d) => d.discountPct >= q.minDiscount!);
  }
  if (q.minPrice !== undefined) {
    out = out.filter((d) => d.price >= q.minPrice!);
  }
  if (q.maxPrice !== undefined) {
    out = out.filter((d) => d.price <= q.maxPrice!);
  }

  if (q.q) {
    const needle = q.q.toLowerCase().trim();
    const terms = needle.split(/\s+/).filter(Boolean);
    if (terms.length > 0) {
      out = out.filter((d) => {
        const hay = `${d.title} ${d.brand} ${d.category} ${d.subcategory ?? ''} ${d.store}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
    }
  }

  type SortOption = NonNullable<DealQuery['sort']> | 'featured';
  const sorters: Record<SortOption, (a: DealResult, b: DealResult) => number> = {
    newest: (a, b) => +new Date(b.listedAt) - +new Date(a.listedAt),
    discount: (a, b) => b.discountPct - a.discountPct,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    ending: (a, b) => endsInSeconds(a, now) - endsInSeconds(b, now),
    featured: (a, b) => b.featured - a.featured || b.discountPct - a.discountPct,
  };
  out = [...out].sort(sorters[q.sort ?? 'newest']);

  return out;
}

/** Hydrate a raw Deal with computed fields */
export function hydrate(deal: Deal, now: number = Date.now()): DealResult {
  const priceHistory = Array.isArray(deal.priceHistory) && deal.priceHistory.length > 0
    ? deal.priceHistory
    : [{ date: new Date().toISOString().slice(0, 10), price: deal.price || 0 }];
  const verifiedAt = deal.verifiedAt || new Date().toISOString();
  const listedAt = deal.listedAt || new Date().toISOString();
  const inStock = deal.inStock ?? true;
  const status = (deal as any).status || dealStatus({ ...deal, verifiedAt, inStock }, now);
  const discount = (deal as any).discountPct ?? discountPct(deal);
  const secondsLeft = (deal as any).endsInSeconds ?? endsInSeconds(deal, now);

  return {
    ...deal,
    inStock,
    priceHistory,
    verifiedAt,
    listedAt,
    status,
    discountPct: discount,
    endsInSeconds: secondsLeft,
  };
}
