import type { Coupon, Deal, StoreId } from './types';

/**
 * Central place for building affiliate tracking links.
 *
 * How affiliate links work (short version — full guide in docs/03-affiliate-programs.md):
 *
 *  1. Amazon Associates: every link you share gets your tag appended:
 *        https://www.amazon.in/dp/ASIN?tag=YOURTAG-21
 *     The tag is free-form; "21" is just Amazon's standard suffix.
 *
 *  2. Amazon "SiteStripe / Link Builder": paste any amazon.in product URL into
 *     the tool in your Associates dashboard and it generates a link for you.
 *
 *  3. Flipkart / Myntra / Ajio: no public self-serve link builder. You join an
 *     affiliate network (Cuelinks, Admitad, vCommission) which gives you
 *     tracking URLs or shortlinks per retailer. We store them in `networkLink`.
 *
 *  4. Food apps (Swiggy/Zomato/Zepto/BigBasket): mostly promo-code deals,
 *     "affiliates" are coupon + app deep links (swggy.co / zomato.to).
 *
 * The frontend always prefers: networkLink > affiliateUrl > productUrl,
 * so the shopper still lands on the real product page if no tracking link
 * exists yet.
 */

export function amazonLink(productUrl: string, asin?: string, tag?: string): string {
  const url = new URL(productUrl);
  if (asin && !url.searchParams.get('tag')) {
    // normalize to the /dp/ form so the tag reliably sticks
    return `https://www.amazon.in/dp/${asin}${tag ? `?tag=${tag}` : ''}`;
  }
  if (tag) {
    url.searchParams.set('tag', tag);
  }
  return url.toString();
}

export function bestClickUrl(deal: Deal): { url: string; tracked: boolean } {
  if (deal.networkLink) return { url: deal.networkLink, tracked: true };
  if (deal.affiliateUrl) return { url: deal.affiliateUrl, tracked: true };
  return { url: deal.productUrl, tracked: false };
}

/** Open the store app/website for food deals */
export function storeDeepLink(store: StoreId): string {
  const map: Record<StoreId, string> = {
    amazon: 'https://www.amazon.in',
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
