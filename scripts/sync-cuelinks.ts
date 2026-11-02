/**
 * Sync deals & coupons from Cuelinks V3 API into our repo (JSON or Supabase).
 *
 * Usage:
 *   npx tsx scripts/sync-cuelinks.ts                  # pull top offers across all campaigns
 *   npx tsx scripts/sync-cuelinks.ts --campaign 1     # Flipkart only
 *   npx tsx scripts/sync-cuelinks.ts --q "iphone"     # keyword search
 *   npx tsx scripts/sync-cuelinks.ts --dry-run        # print, don't write
 *
 * Prereqs:
 *   - CUELINKS_API_KEY set in .env.local (scopes: read:offers, write:links)
 *   - Run once at least to populate the local store / Supabase tables.
 */
import { repo } from '../src/lib/repo-instance';
import { cuelinksFromEnv, type OfferRaw } from '../src/lib/cuelinks';
import type { Deal, Coupon, StoreId } from '../src/lib/types';
import { discountPct } from '../src/lib/status';

interface Args {
  campaign?: number;
  q?: string;
  perPage: number;
  maxPages: number;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { perPage: 50, maxPages: 4, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--campaign') args.campaign = Number(argv[++i]);
    else if (a === '--q') args.q = argv[++i];
    else if (a === '--per-page') args.perPage = Number(argv[++i]);
    else if (a === '--max-pages') args.maxPages = Number(argv[++i]);
    else if (a === '--dry-run') args.dryRun = true;
  }
  return args;
}

/** Map Cuelinks campaign_name → our StoreId so filters work. */
function inferStore(campaignName: string): StoreId {
  const n = campaignName.toLowerCase();
  if (n.includes('amazon')) return 'amazon';
  if (n.includes('flipkart')) return 'flipkart';
  if (n.includes('myntra')) return 'myntra';
  if (n.includes('ajio')) return 'ajio';
  if (n.includes('swiggy')) return 'swiggy';
  if (n.includes('zomato')) return 'zomato';
  if (n.includes('zepto')) return 'zepto';
  if (n.includes('bigbasket')) return 'bigbasket';
  return 'amazon'; // safe default
}

/** Infer category from offer categories + title keywords. */
function inferCategory(offer: OfferRaw): string {
  const catNames = (offer.categories ?? []).map((c) => c.name.toLowerCase());
  const hay = `${catNames.join(' ')} ${offer.title}`.toLowerCase();
  if (/mobile|phone|smartphone|iphone|samsung galaxy/.test(hay)) return 'mobiles';
  if (/laptop|notebook|macbook/.test(hay)) return 'laptops';
  if (/electronics|tv|speaker|earbud|headphone|camera|watch/.test(hay)) return 'electronics';
  if (/fashion|clothing|dress|shirt|kurta|jean/.test(hay)) return 'fashion';
  if (/footwear|shoe|sneaker|sandals/.test(hay)) return 'footwear';
  if (/beauty|skincare|makeup|fragrance/.test(hay)) return 'beauty';
  if (/home|kitchen|furniture|cookware/.test(hay)) return 'home';
  if (/grocery|food|snack|staples|milk|rice/.test(hay)) return 'grocery';
  return 'electronics';
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Convert one Cuelinks offer into either a Deal or a Coupon. */
function offerToDealOrCoupon(offer: OfferRaw): { kind: 'deal'; deal: Deal } | { kind: 'coupon'; coupon: Coupon } {
  const store = inferStore(offer.campaign_name);
  const nowIso = new Date().toISOString();
  const trackingUrl = offer.tracking_url ?? '';
  const original = offer.original_price ?? offer.discount_price ?? 0;
  const discounted = offer.discount_price ?? offer.original_price ?? 0;

  if (offer.offer_type === 'coupon' && offer.coupon_code) {
    const value = offer.percent_off
      ? Math.round(offer.percent_off ?? 0)
      : original > 0 && discounted > 0
        ? Math.round(original - discounted)
        : 0;
    const coupon: Coupon = {
      id: `cl-offer-${offer.id}`,
      store,
      code: (offer.coupon_code ?? 'UNKNOWN').toUpperCase(),
      title: offer.title,
      description: offer.description ?? '',
      value,
      valueType: offer.percent_off ? 'percent' : 'flat',
      minOrder: original || 0,
      expiresAt: offer.end_date ?? '',
      active: true,
      ctaUrl: trackingUrl || undefined,
      source: 'cuelinks' as const,
      rating: 0,
      ratingsCount: 0,
    };
    return { kind: 'coupon', coupon };
  }

  // Product/deal-type offer
  const mrp = Math.max(original, discounted, 1);
  const price = Math.min(discounted, original) || mrp;
  const pct = discountPct({ price, mrp });
  const slug = `${slugify(offer.campaign_name)}-${slugify(offer.title)}-${offer.id}`;
  const deal: Deal = {
    id: `cl-deal-${offer.id}`,
    slug,
    title: offer.title,
    description: offer.description ?? offer.terms ?? '',
    store,
    brand: offer.campaign_name,
    category: inferCategory(offer),
    subcategory: offer.categories?.[0]?.name,
    price,
    mrp,
    priceHistory: [{ date: nowIso.slice(0, 10), price }],
    productUrl: trackingUrl || `https://www.${store}.in`,
    networkLink: trackingUrl || undefined,
    image: '', // Cuelinks doesn't ship product images on /offers; enrich later via PAE
    tags: pct >= 40 ? ['hot'] : pct >= 20 ? ['trending'] : [],
    featured: pct >= 50 ? 1 : 0,
    rating: 0,
    ratingsCount: 0,
    inStock: true,
    listedAt: offer.created_at ?? nowIso,
    verifiedAt: nowIso,
    endsAt: offer.end_date ?? undefined,
    source: 'cuelinks' as const,
  };
  return { kind: 'deal', deal };
}

async function main() {
  const args = parseArgs(process.argv);
  const client = cuelinksFromEnv();

  console.log(`[sync] Fetching offers from Cuelinks…`);
  console.log(`[sync]   campaign=${args.campaign ?? 'ALL'} q=${args.q ?? '-'} perPage=${args.perPage} maxPages=${args.maxPages}`);

  let page = 1;
  let totalDeals = 0;
  let totalCoupons = 0;

  while (page <= args.maxPages) {
    const res = await client.listOffers({
      campaign_id: args.campaign,
      q: args.q,
      page,
      per_page: args.perPage,
    });
    console.log(`[sync] Page ${page}/${res.meta.total_pages}: ${res.data.length} offers`);

    for (const offer of res.data) {
      const mapped = offerToDealOrCoupon(offer);
      if (mapped.kind === 'deal') {
        totalDeals++;
        if (!args.dryRun) await repo().saveDeal(mapped.deal);
      } else {
        totalCoupons++;
        if (!args.dryRun) await repo().saveCoupon(mapped.coupon);
      }
    }

    if (!res.meta.next_page) break;
    page = res.meta.next_page;
  }

  console.log(`[sync] Done. Deals: ${totalDeals}, Coupons: ${totalCoupons}${args.dryRun ? ' (DRY RUN — nothing written)' : ''}`);
}

main().catch((err) => {
  console.error('[sync] FAILED:', err.message ?? err);
  process.exit(1);
});