/**
 * SupabaseRepo — Postgres-backed repository for production.
 *
 * Enable by setting SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (or Vercel env vars) and REPO=auto|supabase.
 *
 * Schema (created by running `supabase/schema.sql` in the Supabase SQL editor
 * — see docs/02-domain-hosting.md):
 *
 *   deals(
 *     id text primary key,
 *     slug text unique not null,
 *     data jsonb not null,          -- full Deal object (easy schema evolution)
 *     listed_at timestamptz not null,
 *     updated_at timestamptz not null default now()
 *   )
 *   coupons(
 *     id text primary key,
 *     data jsonb not null,
 *     updated_at timestamptz not null default now()
 *   )
 *
 * The JSONB-inside-row design is deliberate for this project: the Deal shape
 * evolves fast while you're tuning deal curation, and a single `data` column
 * means zero migrations for field additions. Filtering is done in app code
 * over a dataset that stays small (<5k rows) for a deals portal — fast and
 * simple. If you outgrow it, split hot columns (price, store, listed_at)
 * into real columns later.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Comment, Coupon, Deal } from './types';
import { hydrate, type Repo } from './repo';

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

async function fetchAll<T extends { data: unknown }>(table: 'deals' | 'coupons'): Promise<T[]> {
  const { data, error } = await db().from(table).select('*').limit(10000);
  if (error) throw new Error(`supabase ${table}: ${error.message}`);
  return (data ?? []) as T[];
}

export function createSupabaseRepo(): Repo {
  return {
    async listDeals() {
      const rows = await fetchAll<{ data: Deal }>('deals');
      return rows.map((r) => hydrate(r.data));
    },
    async getDeal(slug) {
      const rows = await fetchAll<{ slug: string; data: Deal }>('deals');
      const r = rows.find((x) => x.slug === slug);
      return r ? hydrate(r.data) : null;
    },
    async saveDeal(deal) {
      const { error } = await db()
        .from('deals')
        .upsert(
          { id: deal.id, slug: deal.slug, data: deal, listed_at: deal.listedAt, updated_at: new Date().toISOString() },
          { onConflict: 'id' },
        );
      if (error) throw new Error(`supabase upsert deal: ${error.message}`);
    },
    async deleteDeal(id) {
      const { error } = await db().from('deals').delete().eq('id', id);
      if (error) throw new Error(`supabase delete deal: ${error.message}`);
    },
    async listCoupons() {
      const rows = await fetchAll<{ data: Coupon }>('coupons');
      return rows.map((r) => r.data);
    },
    async saveCoupon(coupon) {
      const { error } = await db()
        .from('coupons')
        .upsert({ id: coupon.id, data: coupon, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) throw new Error(`supabase upsert coupon: ${error.message}`);
    },
    async deleteCoupon(id) {
      const { error } = await db().from('coupons').delete().eq('id', id);
      if (error) throw new Error(`supabase delete coupon: ${error.message}`);
    },
    async touchDeal(id, patch) {
      const rows = await fetchAll<{ id: string; data: Deal }>('deals');
      const r = rows.find((x) => x.id === id);
      if (!r) throw new Error(`deal ${id} not found`);
      const merged: Deal = { ...r.data, ...patch };
      const { error } = await db()
        .from('deals')
        .upsert({ id, slug: merged.slug, data: merged, listed_at: merged.listedAt, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) throw new Error(`supabase touch deal: ${error.message}`);
    },
    async allSlugs() {
      const { data, error } = await db().from('deals').select('slug').limit(10000);
      if (error) throw new Error(`supabase slugs: ${error.message}`);
      return (data ?? []).map((r: { slug: string }) => r.slug);
    },

    async addComment(comment) {
      const { error } = await db()
        .from('comments')
        .insert({ id: comment.id, deal_slug: comment.dealSlug ?? null, author: comment.author, message: comment.message, created_at: comment.createdAt });
      if (error) throw new Error(`supabase insert comment: ${error.message}`);
    },
    async listComments(dealSlug) {
      let q = db().from('comments').select('*').order('created_at', { ascending: false }).limit(500);
      if (dealSlug !== undefined) q = q.eq('deal_slug', dealSlug);
      else q = q.is('deal_slug', null);
      const { data, error } = await q;
      if (error) throw new Error(`supabase list comments: ${error.message}`);
      return (data ?? []).map((r: any): Comment => ({
        id: r.id,
        dealSlug: r.deal_slug ?? undefined,
        author: r.author,
        message: r.message,
        createdAt: r.created_at,
      }));
    },
    async commentCounts() {
      const { data, error } = await db().from('comments').select('deal_slug').not('deal_slug', 'is', null).limit(10000);
      if (error) throw new Error(`supabase comment counts: ${error.message}`);
      const out: Record<string, number> = {};
      for (const r of data ?? []) {
        const slug = (r as { deal_slug: string }).deal_slug;
        out[slug] = (out[slug] ?? 0) + 1;
      }
      return out;
    },
  };
}
