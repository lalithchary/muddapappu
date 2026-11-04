/**
 * JsonRepo — file-based repository.
 *
 * Stores everything as JSON files under DATA_DIR (default: data/store):
 *    deals.json     array of Deal
 *    coupons.json   array of Coupon
 *
 * This is the default when no Supabase credentials are configured.
 * It's intentionally simple and git-friendly: commit the data dir and the
 * site works fully offline / on static hosts. Writes are atomic
 * (write to .tmp then rename) so a crash never corrupts the store.
 */
import { promises as fs } from 'fs';
import path from 'path';
import type { Comment, Coupon, Deal } from './types';
import { hydrate, type Repo } from './repo';

let dir: string | null = null;
let ready: Promise<string> | null = null;

async function dataDir(): Promise<string> {
  if (dir) return dir;
  if (ready) return ready;

  const base = process.env.DATA_DIR || 'data/store';
  const resolved = path.resolve(/*turbopackIgnore: true*/ process.cwd(), base);

  // During Vercel build, the data directory should already exist
  // (committed to git). Don't try to create it.
  if (process.env.VERCEL) {
    dir = resolved;
    return resolved;
  }

  ready = fs.mkdir(resolved, { recursive: true }).then(() => resolved).catch((err) => {
    // If mkdir fails (e.g., read-only filesystem), just use the path
    dir = resolved;
    return resolved;
  });
  dir = await ready;
  return dir;
}

function fileFor(name: string): string {
  return path.join(dir!, `${name}.json`);
}

async function read<T>(name: string, fallback: T[]): Promise<T[]> {
  await dataDir();
  try {
    const raw = await fs.readFile(fileFor(name), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

async function write<T>(name: string, rows: T[]): Promise<void> {
  await dataDir();
  const target = fileFor(name);
  const tmp = `${target}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2), 'utf8');
  await fs.rename(tmp, target);
}

export function createJsonRepo(): Repo {
  return {
    async listDeals() {
      const deals = await read<Deal>('deals', []);
      return deals.map((d) => hydrate(d));
    },
    async getDeal(slug) {
      const deals = await read<Deal>('deals', []);
      const d = deals.find((x) => x.slug === slug);
      return d ? hydrate(d) : null;
    },
    async saveDeal(deal) {
      const deals = await read<Deal>('deals', []);
      const i = deals.findIndex((x) => x.id === deal.id);
      if (i >= 0) deals[i] = deal;
      else deals.push(deal);
      await write('deals', deals);
    },
    async deleteDeal(id) {
      const deals = await read<Deal>('deals', []);
      await write('deals', deals.filter((x) => x.id !== id));
    },
    async listCoupons() {
      return read<Coupon>('coupons', []);
    },
    async saveCoupon(coupon) {
      const rows = await read<Coupon>('coupons', []);
      const i = rows.findIndex((x) => x.id === coupon.id);
      if (i >= 0) rows[i] = coupon;
      else rows.push(coupon);
      await write('coupons', rows);
    },
    async deleteCoupon(id) {
      const rows = await read<Coupon>('coupons', []);
      await write('coupons', rows.filter((x) => x.id !== id));
    },
    async touchDeal(id, patch) {
      const deals = await read<Deal>('deals', []);
      const i = deals.findIndex((x) => x.id === id);
      if (i < 0) throw new Error(`deal ${id} not found`);
      deals[i] = { ...deals[i], ...patch };
      await write('deals', deals);
    },
    async allSlugs() {
      const deals = await read<Deal>('deals', []);
      return deals.map((d) => d.slug);
    },

    async addComment(comment) {
      const rows = await read<Comment>('comments', []);
      if (rows.some((c) => c.id === comment.id)) return;
      rows.push(comment);
      await write('comments', rows);
    },
    async listComments(dealSlug) {
      const rows = await read<Comment>('comments', []);
      const filtered = dealSlug
        ? rows.filter((c) => c.dealSlug === dealSlug)
        : rows;
      return filtered.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    },
    async commentCounts() {
      const rows = await read<Comment>('comments', []);
      const out: Record<string, number> = {};
      for (const c of rows) {
        if (!c.dealSlug) continue;
        out[c.dealSlug] = (out[c.dealSlug] ?? 0) + 1;
      }
      return out;
    },
  };
}

export async function ensureRepoReady(): Promise<void> {
  await dataDir();
}