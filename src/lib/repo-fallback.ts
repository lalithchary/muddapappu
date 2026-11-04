/**
 * Fallback repository wrapper.
 *
 * Tries the primary repo (Supabase) first, but falls back to secondary repo (JSON)
 * if the primary repo throws an error (e.g., tables don't exist in Supabase).
 *
 * NOTE: For write operations (addComment), we need to handle the fact that
 * JSON repo writes will fail on Vercel's read-only filesystem.
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
      // Try primary first (Supabase)
      try {
        await primary.addComment(comment);
        return;
      } catch {
        // Primary failed - try secondary (JSON)
        // Note: JSON writes will fail silently on Vercel's read-only filesystem
      }
      
      // Use secondary (JSON) - writes will be skipped if read-only
      const target = fallbackMode === 'secondary' ? secondary : primary;
      await target.addComment(comment);
    },
    async listComments(dealSlug) {
      if (fallbackMode === 'secondary') {
        return secondary.listComments(dealSlug);
      }
      try {
        return await primary.listComments(dealSlug);
      } catch {
        // Primary repo (Supabase) failed - tables might not exist
        // Try secondary (JSON)
        try {
          return await secondary.listComments(dealSlug);
        } catch {
          // Both failed - return empty array
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
        // Primary repo (Supabase) failed - tables might not exist
        // Try secondary (JSON)
        try {
          return await secondary.commentCounts();
        } catch {
          // Both failed - return empty counts
          return {};
        }
      }
    },
  };
}