/**
 * Domain types for the deals portal.
 *
 * A Deal is a "live offer snapshot" of a product:
 *  - priceHistory is a rolling series of (date, price) points, used to draw
 *    the little price-trend sparkline (benzin.jetzt-style live data).
 *  - status is derived live in lib/status.ts so a deal that has ended
 *    always shows "Expired" without waiting for a re-scrape.
 */

export type StoreId =
  | 'amazon'
  | 'flipkart'
  | 'myntra'
  | 'ajio'
  | 'swiggy'
  | 'zomato'
  | 'zepto'
  | 'bigbasket';

export type DealTag = 'bestseller' | 'budget' | 'trending' | 'hot';

export interface PricePoint {
  /** ISO date (day precision) */
  date: string;
  price: number;
}

export interface Deal {
  id: string;
  slug: string;
  title: string;
  /** short, human description / highlight bullets joined by newlines */
  description: string;

  store: StoreId;
  /** brand name, e.g. boAt, Samsung, Nike */
  brand: string;
  /** top-level category, e.g. "electronics" */
  category: string;
  /** optional sub-category, e.g. "earbuds" */
  subcategory?: string;

  price: number;
  /** original / MRP price (₹) */
  mrp: number;
  priceHistory: PricePoint[];

  /** absolute product URL on the retailer (the link the shopper sees) */
  productUrl: string;
  /** affiliate URL with your tracking tag (the link actually tracked) */
  affiliateUrl?: string;
  /** optional affiliate network deep-link, e.g. Cuelinks */
  networkLink?: string;

  /** where the price was captured (api | manual | scraper) */
  source: 'api' | 'manual' | 'scraper' | 'cuelinks';
  /** ISO timestamp of the last price verification */
  verifiedAt: string;
  /** ISO date the deal was first listed */
  listedAt: string;
  /** optional explicit end date (ISO) — after this, deal is expired */
  endsAt?: string;
  /** if the deal is a price-drop deal, this is how long the price was promised */
  pricePromisedFor?: '48h' | '72h' | 'week' | 'festival' | null;

  image: string;
  /** fallback image if the primary one 404s */
  imageFallback?: string;
  rating?: number;
  ratingsCount?: number;
  inStock: boolean;

  tags: DealTag[];
  /** manual editorial pin — higher = more prominent on homepage */
  featured: number;
}

export interface Coupon {
  id: string;
  store: StoreId;
  code: string;
  title: string;
  description?: string;
  /** percentage off or flat ₹ off */
  value: number;
  valueType: 'percent' | 'flat';
  /** minimum order value in ₹ (0 = none) */
  minOrder: number;
  /** ISO date of expiry; required */
  expiresAt: string;
  active: boolean;
  /** optional URL to open after the user copies the code */
  ctaUrl?: string;
  /** where the coupon was sourced from */
  source?: 'cuelinks' | 'api' | 'manual';
  /** optional rating */
  rating?: number;
  /** optional ratings count */
  ratingsCount?: number;
}

export interface StoreInfo {
  id: StoreId;
  name: string;
  shortName: string;
  domain: string;
  /** brand accent color used for the store chip */
  color: string;
  category: 'ecommerce' | 'fashion' | 'food';
}

export type Status = 'active' | 'expiring' | 'expired';

export type SortKey = 'newest' | 'discount' | 'price-asc' | 'price-desc' | 'ending';

export interface DealQuery {
  q?: string;
  stores?: StoreId[];
  categories?: string[];
  tags?: DealTag[];
  minDiscount?: number;
  maxPrice?: number;
  minPrice?: number;
  sort?: SortKey;
  status?: 'all' | Status;
  page?: number;
  pageSize?: number;
  view?: 'list' | 'gallery';
}

export interface DealResult extends Deal {
  status: Status;
  discountPct: number;
  /** seconds until the deal's end (Infinity if no end date) */
  endsInSeconds: number;
}

export interface CouponView extends Coupon {
  expired: boolean;
}

/** Community comment attached to a deal (optional) or posted in the general feed. */
export interface Comment {
  id: string;
  /** If set, this comment is about a specific product/deal. Otherwise it's a
   *  general community post (product request, shared deal tip, etc.). */
  dealSlug?: string;
  author: string;
  message: string;
  createdAt: string; // ISO
}
