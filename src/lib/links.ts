import type { Deal, StoreId } from './types';

/**
 * Central place for building and automating affiliate tracking links.
 * 
 * Features:
 *  1. Pure Amazon Associates link automation: Automatically extracts ASIN,
 *     strips any old/affiliate network tracking, and formats directly to
 *     https://www.amazon.in/dp/{ASIN}?tag={AMAZON_TAG}.
 *  2. Bypasses Cuelinks for Amazon as configured by the store owner.
 *  3. Dynamic tag resolution (env variable -> affiliate-config.json -> fallback).
 */

/**
 * Extracts a 10-character Amazon ASIN from any Amazon URL or raw string.
 */
export function extractAmazonAsin(urlOrAsin: string): string | null {
  if (!urlOrAsin) return null;
  const str = String(urlOrAsin).trim();

  // Direct ASIN string (10 alphanumeric characters)
  if (/^[A-Z0-9]{10}$/i.test(str)) {
    return str.toUpperCase();
  }

  // Match inside standard Amazon URL formats:
  // /dp/B0D5BNKVZ2
  // /gp/product/B0D5BNKVZ2
  // /product/B0D5BNKVZ2
  // /d/B0D5BNKVZ2
  // ?asin=B0D5BNKVZ2
  const match = str.match(/(?:\/dp\/|\/gp\/product\/|\/product\/|\/d\/|[?&]asin=)([A-Z0-9]{10})/i);
  if (match) return match[1].toUpperCase();

  // Handle amzn.in / amzn.to shortlinks if ASIN is in path
  const fallback = str.match(/([B0-9][A-Z0-9]{9})/i);
  return fallback ? fallback[1].toUpperCase() : null;
}

/**
 * Returns the active Amazon affiliate tag.
 * Priority:
 * 1. process.env.AMAZON_TAG (configured in Vercel environment variables)
 * 2. process.env.NEXT_PUBLIC_AMAZON_TAG
 * 3. Stored config in data/store/affiliate-config.json (amazon.tag)
 * 4. Fallback: 'muddapappu_21'
 */
export function getAmazonTag(): string {
  if (process.env.AMAZON_TAG) return process.env.AMAZON_TAG;
  if (process.env.NEXT_PUBLIC_AMAZON_TAG) return process.env.NEXT_PUBLIC_AMAZON_TAG;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const config = require('../../data/store/affiliate-config.json');
    if (config?.amazon?.tag) return config.amazon.tag;
  } catch {}
  return 'muddapappu_21';
}

/**
 * Automatically builds a direct Amazon affiliate link with the user's tag.
 * Strips any third-party redirects (Cuelinks, etc.) or competitor tags.
 */
export function buildAmazonAffiliateUrl(urlOrAsin: string, tag?: string): string {
  const activeTag = tag || getAmazonTag();
  const asin = extractAmazonAsin(urlOrAsin);

  if (asin) {
    return `https://www.amazon.in/dp/${asin}?tag=${activeTag}`;
  }

  // If no ASIN but is a search/category URL on Amazon
  try {
    const raw = urlOrAsin.startsWith('http') ? urlOrAsin : `https://www.amazon.in/${urlOrAsin}`;
    const url = new URL(raw);
    if (url.hostname.includes('amazon.')) {
      url.searchParams.set('tag', activeTag);
      // Clean up junk tracking params
      url.searchParams.delete('ascsubtag');
      url.searchParams.delete('ref');
      return url.toString();
    }
  } catch {}

  return `https://www.amazon.in?tag=${activeTag}`;
}

/** Legacy alias for backward compatibility */
export function amazonLink(productUrl: string, asin?: string, tag?: string): string {
  return buildAmazonAffiliateUrl(asin || productUrl, tag);
}

/**
 * Universal Outbound Link Automation Resolver:
 * - If Amazon deal: ALWAYS generates direct Amazon link with user's tag (NO Cuelinks!)
 * - If other stores: uses networkLink > affiliateUrl > productUrl
 */
export function getOutboundUrl(deal: {
  store?: string;
  productUrl?: string;
  affiliateUrl?: string;
  networkLink?: string;
}): string {
  const isAmazon =
    deal.store === 'amazon' ||
    Boolean(deal.productUrl && deal.productUrl.includes('amazon.')) ||
    Boolean(deal.affiliateUrl && deal.affiliateUrl.includes('amazon.'));

  if (isAmazon) {
    const candidate = deal.productUrl || deal.affiliateUrl || deal.networkLink || '';
    return buildAmazonAffiliateUrl(candidate);
  }

  return deal.networkLink || deal.affiliateUrl || deal.productUrl || '#';
}

export function bestClickUrl(deal: Deal): { url: string; tracked: boolean } {
  const url = getOutboundUrl(deal);
  return { url, tracked: url !== '#' };
}

/** Open the store app/website for food deals */
export function storeDeepLink(store: StoreId): string {
  const map: Record<StoreId, string> = {
    amazon: `https://www.amazon.in?tag=${getAmazonTag()}`,
    flipkart: 'https://www.flipkart.com',
    myntra: 'https://www.myntra.com',
    ajio: 'https://www.ajio.com',
    swiggy: 'https://www.swiggy.com',
    zomato: 'https://www.zomato.com',
    zepto: 'https://zepto.app',
    bigbasket: 'https://www.bigbasket.com',
  };
  return map[store];
}
