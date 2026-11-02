/**
 * Cuelinks V3 Monetization API client.
 *
 * Base: https://developers.cuelinks.com/pub_api/v3
 * Auth: Authorization: Token <api-key>
 * Docs: https://developers.cuelinks.com/docs/reference
 *
 * Scopes needed (get these from https://www.cuelinks.com/api-key):
 *   - read:campaigns   → search campaigns (Flipkart, Amazon, Myntra, Ajio…)
 *   - read:offers      → pull live coupons/deals across all campaigns
 *   - write:links      → convert any merchant URL into a tracked clnk.in link
 *   - read:transactions→ pull earnings/conversions (later, for analytics)
 *
 * Rate limits: generous for approved publishers. Still, we cache aggressively
 * in-memory + optionally in the `cuelinks_campaigns` table.
 */

const BASE = 'https://developers.cuelinks.com/pub_api/v3';

export interface CuelinksConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface CampaignSummary {
  id: number;
  name: string;
  networkName?: string;
  epc7d?: number | null;
  commissionRate?: string;
  categories?: { id: number; name: string }[];
  logoUrl?: string;
  landingPageUrl?: string;
}

export interface OfferRaw {
  id: number;
  title: string;
  description?: string;
  terms?: string;
  coupon_code?: string | null;
  offer_type: 'coupon' | 'deal';
  campaign_id: number;
  campaign_name: string;
  categories?: { id: number; name: string }[];
  tracking_url?: string | null;
  status: 'live';
  start_date?: string;
  end_date?: string;
  original_price?: number | null;
  discount_price?: number | null;
  percent_off?: number | null;
  shipping_charge?: number | null;
  created_at?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; per_page: number; total: number; total_pages: number; next_page: number | null; prev_page: number | null };
}

export class CuelinksClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(cfg: CuelinksConfig) {
    if (!cfg.apiKey) throw new Error('Cuelinks API key required');
    this.apiKey = cfg.apiKey;
    this.baseUrl = (cfg.baseUrl ?? BASE).replace(/\/$/, '');
    this.timeoutMs = cfg.timeoutMs ?? 15_000;
  }

  /** Health-check: verifies the key works and returns publisher identity. */
  async ping(): Promise<{ ok: true; publisher?: unknown }> {
    const res = await this.request<{ data?: unknown }>('GET', '/ping');
    return { ok: true, publisher: res.data };
  }

  /** Search campaigns by keyword, category, country. Returns paginated list. */
  async listCampaigns(params: {
    q?: string;
    category_ids?: number[];
    country_ids?: number[];
    sort?: 'epc_7d' | 'name' | 'commission_rate' | 'created_at';
    order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  } = {}): Promise<Paginated<CampaignSummary>> {
    const qs = buildQuery({
      q: params.q,
      category_ids: params.category_ids,
      country_ids: params.country_ids,
      sort: params.sort,
      order: params.order,
      page: params.page,
      per_page: params.per_page,
    });
    const res = await this.request<any>('GET', `/campaigns${qs}`);
    return normalizePaginated(res, (row: any) => ({
      id: row.id,
      name: row.name,
      networkName: row.network_name ?? row.affiliate_network?.name,
      epc7d: numOrNull(row.epc_7d ?? row.epc7d),
      commissionRate: row.commission_rate ?? row.payout_summary?.rate_text,
      categories: row.categories,
      logoUrl: row.logo_url ?? row.image_url,
      landingPageUrl: row.landing_page_url ?? row.url,
    }));
  }

  async getCampaign(id: number): Promise<CampaignSummary & { raw: unknown }> {
    const res = await this.request<any>('GET', `/campaigns/${id}`);
    const row = res.data ?? res;
    return {
      id: row.id,
      name: row.name,
      networkName: row.network_name,
      epc7d: numOrNull(row.epc_7d),
      commissionRate: row.commission_rate,
      categories: row.categories,
      logoUrl: row.logo_url,
      landingPageUrl: row.landing_page_url ?? row.url,
      raw: row,
    };
  }

  /**
   * List live offers (coupons + product deals) across all campaigns.
   * Filter by campaign, category, offer type, or validity date.
   */
  async listOffers(params: {
    q?: string;
    campaign_id?: number;
    category_ids?: number[];
    offer_type?: 'coupon' | 'deal';
    valid_on?: string; // YYYY-MM-DD
    page?: number;
    per_page?: number;
  } = {}): Promise<Paginated<OfferRaw>> {
    const qs = buildQuery({
      q: params.q,
      campaign_id: params.campaign_id,
      category_ids: params.category_ids,
      offer_type: params.offer_type,
      valid_on: params.valid_on,
      page: params.page,
      per_page: params.per_page,
    });
    const res = await this.request<any>('GET', `/offers${qs}`);
    return normalizePaginated(res, (row: any) => row as OfferRaw);
  }

  /**
   * Convert ANY merchant URL into a tracked affiliate link.
   * This is the money-maker: send it a Flipkart/Myntra/Ajio/Amazon product URL
   * and get back a clnk.in short link that pays you commission.
   *
   * @param url       The plain merchant URL.
   * @param opts.shorten  Return a clnk.in short URL instead of the long one.
   * @param opts.subId    Track source (e.g. "homepage", "category-electronics").
   * @returns `{ tracking_url, affiliated }`. `affiliated=false` means the URL
   *           wasn't recognised as belonging to a campaign you're part of —
   *           still safe to share, just won't earn commission.
   */
  async convertLink(url: string, opts: { shorten?: boolean; subId?: string; subId2?: string } = {}) {
    if (!url || !/^https?:\/\//i.test(url)) throw new Error(`convertLink: invalid URL "${url}"`);
    const body: Record<string, unknown> = { url };
    if (opts.shorten) body.shorten = true;
    if (opts.subId) body.subid = opts.subId;
    if (opts.subId2) body.subid2 = opts.subId2;
    const res = await this.request<any>('POST', '/links/convert', body);
    const d = res.data ?? res;
    return {
      trackingUrl: String(d.tracking_url ?? d.shortened_url ?? ''),
      affiliated: Boolean(d.affiliated ?? true),
      raw: d,
    };
  }

  /** Fetch transactions (earnings) — useful for reconciling your P&L. */
  async listTransactions(params: {
    start_date?: string;
    end_date?: string;
    status?: 'pending' | 'validated' | 'payable' | 'claimed' | 'rejected';
    campaign_id?: number;
    updated_since?: string;
    page?: number;
    per_page?: number;
  } = {}) {
    const qs = buildQuery({ ...params });
    const res = await this.request<any>('GET', `/transactions${qs}`);
    return normalizePaginated(res, (row: any) => row);
  }

  // ── internals ─────────────────────────────────────────────────────────────

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const init: RequestInit = {
        method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${this.apiKey}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      };
      const res = await fetch(this.baseUrl + path, init);
      const text = await res.text();
      let parsed: any = null;
      try { parsed = text ? JSON.parse(text) : null; } catch { /* keep raw */ }
      if (!res.ok) {
        const msg = parsed?.error?.message ?? parsed?.message ?? text.slice(0, 200) ?? res.statusText;
        throw new CuelinksApiError(res.status, msg, parsed);
      }
      return (parsed ?? {}) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class CuelinksApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(`Cuelinks API ${status}: ${message}`);
    this.name = 'CuelinksApiError';
  }
}

function buildQuery(obj: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      for (const item of v) parts.push(`${encodeURIComponent(k)}[]=${encodeURIComponent(String(item))}`);
    } else {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}

function normalizePaginated<T>(raw: any, map: (row: any) => T): Paginated<T> {
  const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  const meta = raw?.meta ?? {};
  return {
    data: rows.map(map),
    meta: {
      page: meta.page ?? 1,
      per_page: meta.per_page ?? rows.length,
      total: meta.total ?? rows.length,
      total_pages: meta.total_pages ?? 1,
      next_page: meta.next_page ?? null,
      prev_page: meta.prev_page ?? null,
    },
  };
}

function numOrNull(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Singleton factory reading from env. Throws if key missing. */
export function cuelinksFromEnv(): CuelinksClient {
  const key = process.env.CUELINKS_API_KEY;
  if (!key) {
    throw new Error('CUELINKS_API_KEY not set — grab one at https://www.cuelinks.com/api-key');
  }
  return new CuelinksClient({ apiKey: key, baseUrl: process.env.CUELINKS_BASE_URL });
}
