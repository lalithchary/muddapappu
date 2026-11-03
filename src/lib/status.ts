import type { Deal, Status } from './types';

/**
 * A deal is "expiring soon" within this window — shows the urgency countdown.
 */
export const EXPIRY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Derive live status from the deal's timestamps.
 *  - expired: explicit endsAt passed, or price older than `maxAge` without re-verification
 *  - expiring: endsAt within the next 24h
 *  - active: everything else
 */
export function dealStatus(
  deal: Pick<Deal, 'endsAt' | 'verifiedAt' | 'inStock'>,
  now: number = Date.now(),
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000, // 7 days — deals can last a week or more
): Status {
  if (!deal.inStock) return 'expired';

  if (deal.endsAt && new Date(deal.endsAt).getTime() <= now) return 'expired';

  const verified = new Date(deal.verifiedAt).getTime();
  if (Number.isFinite(verified) && now - verified > maxAgeMs) return 'expired';

  if (deal.endsAt) {
    const ends = new Date(deal.endsAt).getTime();
    if (ends - now <= EXPIRY_WINDOW_MS) return 'expiring';
  }

  return 'active';
}

export function endsInSeconds(deal: Pick<Deal, 'endsAt'>, now: number = Date.now()): number {
  if (!deal.endsAt) return Infinity;
  const t = new Date(deal.endsAt).getTime() - now;
  return Math.max(0, t);
}

/** ₹ saved compared to MRP */
export function savings(deal: Pick<Deal, 'price' | 'mrp'>): number {
  return Math.max(0, deal.mrp - deal.price);
}

/** discount percentage 0–99 */
export function discountPct(deal: Pick<Deal, 'price' | 'mrp'>): number {
  if (deal.mrp <= 0) return 0;
  return Math.min(99, Math.round(((deal.mrp - deal.price) / deal.mrp) * 100));
}

/** True when the latest price is at or below the best historical price */
export function isBestPrice(deal: Pick<Deal, 'price' | 'priceHistory'>): boolean {
  if (deal.priceHistory.length === 0) return true;
  return deal.price <= Math.min(...deal.priceHistory.map((p) => p.price));
}

/** simple 0..1 momentum: 1 = trending down (good) */
export function priceTrend(deal: Pick<Deal, 'price' | 'priceHistory'>): number {
  const h = deal.priceHistory;
  if (h.length < 2) return 0;
  const start = h[0].price;
  const end = deal.price;
  if (start === end) return 0;
  return (start - end) / start; // >0 means price dropped
}
