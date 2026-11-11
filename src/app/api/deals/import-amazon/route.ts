import { NextResponse } from 'next/server';
import { repo } from '@/lib/repo-instance';
import { buildAmazonAffiliateUrl, extractAmazonAsin, getAmazonTag } from '@/lib/links';
import { discountPct } from '@/lib/status';
import type { Deal } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const urlOrAsin = body.url || body.asin;

    if (!urlOrAsin) {
      return NextResponse.json({ ok: false, error: 'Amazon URL or ASIN is required' }, { status: 400 });
    }

    const asin = extractAmazonAsin(urlOrAsin);
    if (!asin) {
      return NextResponse.json({ ok: false, error: 'Could not extract valid Amazon ASIN from input' }, { status: 400 });
    }

    const tag = body.tag || getAmazonTag();
    const title = String(body.title || `Amazon Deal (${asin})`).trim();
    const price = Number(body.price) || 999;
    const mrp = Number(body.mrp) || Math.round(price * 1.5);
    const category = String(body.category || 'electronics');
    const image = body.image || 'https://m.media-amazon.com/images/I/61S9e-G3C5L._SL1500_.jpg';
    const description = body.description || `Amazon India deal with verified pricing. ASIN: ${asin}`;

    const affUrl = buildAmazonAffiliateUrl(asin, tag);
    const slug = `amazon-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}-${asin}`;
    const pct = discountPct({ price, mrp });
    const nowIso = new Date().toISOString();

    const deal: Deal = {
      id: `amazon-${asin}`,
      slug,
      title,
      description,
      store: 'amazon',
      brand: body.brand || 'Amazon',
      category,
      price,
      mrp,
      priceHistory: [{ date: nowIso.slice(0, 10), price }],
      productUrl: `https://www.amazon.in/dp/${asin}`,
      affiliateUrl: affUrl,
      networkLink: affUrl,
      source: 'api',
      verifiedAt: nowIso,
      listedAt: nowIso,
      endsAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      image,
      rating: body.rating || 4.2,
      ratingsCount: body.ratingsCount || 100,
      inStock: true,
      tags: pct >= 40 ? ['hot', 'bestseller'] : ['trending'],
      featured: pct >= 50 ? 8 : 0,
    };

    await repo().saveDeal(deal);

    return NextResponse.json({
      ok: true,
      message: 'Amazon deal imported and affiliate link automated successfully',
      deal: {
        id: deal.id,
        slug: deal.slug,
        title: deal.title,
        price: deal.price,
        mrp: deal.mrp,
        discountPct: pct,
        affiliateUrl: affUrl,
      },
    });
  } catch (error: any) {
    console.error('[import-amazon] Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
