/**
 * Fallback repository wrapper.
 *
 * Tries the primary repo (Supabase) first, but falls back to secondary repo (JSON)
 * if the primary repo throws an error (e.g., tables don't exist in Supabase).
 *
 * For writes (addComment), uses primary only - writes to JSON will fail on Vercel's
 * read-only filesystem. For reads, falls back gracefully if primary fails.
 */
import type { Repo } from './repo';

let fallbackMode: 'primary' | 'secondary' = 'primary';

export function withFallback(primary: Repo, secondary: Repo): Repo {
  return {
    async listDeals() {
      if (fallbackMode === 'secondary') {
        return secondary.listDeals();
      }
      try {
        return await primary.listDeals();
      } catch {
        fallbackMode = 'secondary';
        console.log('Falling back to secondary repo for listDeals');
        return secondary.listDeals();
      }
    },
    async getDeal(slug) {
      if (fallbackMode === 'secondary') {
        return secondary.getDeal(slug);
      }
      try {
        return await primary.getDeal(slug);
      } catch {
        fallbackMode = 'secondary';
        console.log('Falling back to secondary repo for getDeal');
        return secondary.getDeal(slug);
      }
    },
    async saveDeal(deal) {
      const target = fallbackMode === 'secondary' ? secondary : primary;
      return target.saveDeal(deal);
    },
    async deleteDeal(id) {
      const target = fallbackMode === 'secondary' ? secondary : primary;
      return target.deleteDeal(id);
    },
    async listCoupons() {
      if (fallbackMode === 'secondary') {
        return secondary.listCoupons();
      }
      try {
        return await primary.listCoupons();
      } catch {
        fallbackMode = 'secondary';
        console.log('Falling back to secondary repo for listCoupons');
        return secondary.listCoupons();
      }
    },
    async saveCoupon(coupon) {
      const target = fallbackMode === 'secondary' ? secondary : primary;
      return target.saveCoupon(coupon);
    },
    async deleteCoupon(id) {
      const target = fallbackMode === 'secondary' ? secondary : primary;
      return target.deleteCoupon(id);
    },
    async touchDeal(id, patch) {
      const target = fallbackMode === 'secondary' ? secondary : primary;
      return target.touchDeal(id, patch);
    },
    async allSlugs() {
      if (fallbackMode === 'secondary') {
        return secondary.allSlugs();
      }
      try {
        return await primary.allSlugs();
      } catch {
        fallbackMode = 'secondary';
        console.log('Falling back to secondary repo for allSlugs');
        return secondary.allSlugs();
      }
    },
    async addComment(comment) {
      // Only use primary (Supabase) for comment writes
      // If Supabase tables don't exist, this will throw an error
      // which the API route will catch and return an error response
      // This is intentional - comments require a proper backend storage
      await primary.addComment(comment);
    },
    async listComments(dealSlug) {
      if (fallbackMode === 'secondary') {
        return secondary.listComments(dealSlug);
      }
      try {
        return await primary.listComments(dealSlug);
      } catch {
        // Primary repo (Supabase) failed - try secondary (JSON)
        try {
          // Also try JSON - but writes to JSON will fail on read-only filesystem
          // So we return empty array if both fail
          return await secondary.listComments(dealSlug);
        } catch {
          return [];
        }
      }
    },
    async commentCounts() {
      if (fallbackMode === 'secondary') {
        return secondary.commentCounts();
      }
      try {
        return await primary.commentCounts();
      } catch {
        // Primary repo (Supabase) failed - try secondary (JSON)
        try {
          return await secondary.commentCounts();
        } catch {
          return {};
        }
      }
    },
  };
}