/**
 * Ingestion pipeline & normalizer.
 *
 * This script accepts raw product payloads (from Amazon PAE, Cuelinks API,
 * or custom RPi python scrapers), normalizes them to our Deal schema,
 * auto-appends affiliate tags if missing, updates price history if changed,
 * and saves to the repo.
 *
 * Usage:
 *    npx tsx scripts/ingest.ts --file sample-scrape.json
 *    npx tsx scripts/ingest.ts --demo
 */
import { promises as fs } from 'fs';
import path from 'path';
import { repo } from '../src/lib/repo-instance';
import type { Deal, StoreId } from '../src/lib/types';
import { amazonLink } from '../src/lib/links';

export interface RawInput {
  id?: string;
  title: string;
  description?: string;
  store: StoreId;
  brand?: string;
  category: string;
  subcategory?: string;
  price: number;
  mrp: number;
  productUrl: string;
  affiliateUrl?: string;
  networkLink?: string;
  image: string;
  rating?: number;
  ratingsCount?: number;
  inStock?: boolean;
  tags?: string[];
  endsAt?: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function ingestOne(raw: RawInput): Promise<Deal> {
  const amazonTag = process.env.AMAZON_TAG;

  let affiliateUrl = raw.affiliateUrl;
  if (raw.store === 'amazon' && !affiliateUrl) {
    const asinMatch = raw.productUrl.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    const asin = asinMatch ? asinMatch[1] : undefined;
    affiliateUrl = amazonLink(raw.productUrl, asin, amazonTag);
  }

  const slug = `${slugify(raw.title)}-${raw.store}`;
  const id = raw.id || `${raw.store}-${slugify(raw.title).slice(0, 40)}`;

  const r = repo();
  const existing = await r.getDeal(slug);

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();

  let priceHistory = existing?.priceHistory ?? [];
  if (!priceHistory.some((p) => p.date === today)) {
    priceHistory = [...priceHistory, { date: today, price: raw.price }];
  } else {
    priceHistory = priceHistory.map((p) => (p.date === today ? { ...p, price: raw.price } : p));
  }

  const deal: Deal = {
    id,
    slug,
    title: raw.title,
    description: raw.description || raw.title,
    store: raw.store,
    brand: raw.brand || 'Generic',
    category: raw.category,
    subcategory: raw.subcategory,
    price: raw.price,
    mrp: raw.mrp || raw.price,
    priceHistory,
    productUrl: raw.productUrl,
    affiliateUrl,
    networkLink: raw.networkLink,
    source: existing ? existing.source : 'scraper',
    verifiedAt: now,
    listedAt: existing?.listedAt ?? now,
    endsAt: raw.endsAt ?? existing?.endsAt,
    image: raw.image,
    rating: raw.rating ?? existing?.rating,
    ratingsCount: raw.ratingsCount ?? existing?.ratingsCount,
    inStock: raw.inStock ?? true,
    tags: (raw.tags as Deal['tags']) || existing?.tags || ['hot'],
    featured: existing?.featured ?? 0,
  };

  await r.saveDeal(deal);
  return deal;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--demo')) {
    console.log('[ingest] Running demo ingestion...');
    const demo: RawInput = {
      title: 'Realme Buds Wireless 3 in-Ear Bluetooth Neckband with 30dB ANC',
      store: 'amazon',
      brand: 'Realme',
      category: 'electronics',
      subcategory: 'neckbands',
      price: 1699,
      mrp: 2999,
      productUrl: 'https://www.amazon.in/dp/B0C9R78Q11',
      image: 'https://m.media-amazon.com/images/I/61S9e-G3C5L._SL1500_.jpg',
      rating: 4.3,
      ratingsCount: 22100,
    };
    const saved = await ingestOne(demo);
    console.log(`[ingest] Saved demo deal: ${saved.slug} (₹${saved.price}, tag: ${saved.affiliateUrl})`);
    return;
  }

  const fileIdx = args.indexOf('--file');
  if (fileIdx >= 0 && args[fileIdx + 1]) {
    const file = path.resolve(process.cwd(), args[fileIdx + 1]);
    console.log(`[ingest] Reading ${file}...`);
    const content = await fs.readFile(file, 'utf8');
    const items: RawInput[] = JSON.parse(content);
    let count = 0;
    for (const item of items) {
      await ingestOne(item);
      count++;
    }
    console.log(`[ingest] Ingested ${count} deals successfully.`);
    return;
  }

  console.log('Usage:\n  npx tsx scripts/ingest.ts --demo\n  npx tsx scripts/ingest.ts --file payload.json');
}

if (require.main === module || process.argv[1]?.endsWith('ingest.ts')) {
  main().catch((err) => {
    console.error('[ingest] Error:', err);
    process.exit(1);
  });
}
