import { createJsonRepo } from './repo-json';
import { createSupabaseRepo } from './repo-supabase';
import { withFallback } from './repo-fallback';
import type { Repo } from './repo';

let singleton: Repo | null = null;

// Track if Supabase has been detected as empty/not seeded
let supabaseHasNoDeals = false;
let supabaseErrorCount = 0;
const MAX_ERRORS = 3;

/**
 * Returns the active repository.
 *  REPO=auto (default): Try Supabase first, fall back to JSON if tables don't exist or are empty.
 *  REPO=json   : force local JSON storage (great for dev / hybrid setups).
 *  REPO=supabase: force Supabase Postgres (recommended for Vercel production with seeded data).
 *
 *  IMPORTANT for Vercel: JSON file writes WILL FAIL on Vercel serverless.
 *  To use comments/chat on Vercel, you MUST set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *  AND ensure the database is seeded (run supabase/schema.sql in Supabase SQL editor).
 *
 *  Runtime behavior:
 *  - At runtime (server-side functions, API routes): If Supabase is configured, try it first
 *  - If Supabase tables don't exist or are empty, automatically fall back to JSON for static data
 *  - Build time: Always use JSON repo to avoid network dependencies
 *
 *  Detection:
 *  - Build time: NEXT_PHASE is set during Next.js build phases
 *  - Runtime: NEXT_PHASE is not set
 */
export function repo(): Repo {
  if (singleton) return singleton;

  const mode = (process.env.REPO ?? 'auto').toLowerCase();
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const isBuildTime = Boolean(process.env.NEXT_PHASE);

  if (mode === 'supabase' && !hasSupabase) {
    throw new Error('REPO=supabase but SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY missing');
  }

  // During Next.js build phases, use JSON repo to avoid network dependencies
  // The JSON data files should be committed to the repo or pre-seeded
  if (isBuildTime && mode !== 'supabase') {
    console.log('Using JSON file repository (build mode)');
    singleton = createJsonRepo();
    return singleton;
  }

  // At runtime with Supabase configured, use a smart fallback wrapper
  if (hasSupabase || mode === 'supabase') {
    const supabaseRepo = createSupabaseRepo();
    const jsonRepo = createJsonRepo();
    console.log('Using Supabase repository with JSON fallback');
    singleton = createSmartFallback(supabaseRepo, jsonRepo);
    return singleton;
  }

  console.log('Using JSON file repository (dev mode)');
  singleton = createJsonRepo();
  return singleton;
}

/**
 * Smart fallback wrapper that:
 * 1. Falls back to JSON if Supabase returns empty results
 * 2. For deal comments, falls back to JSON if FK violation occurs
 * 3. Tracks errors and switches to secondary after multiple failures
 */
function createSmartFallback(primary: Repo, secondary: Repo): Repo {
  const fallback = withFallback(primary, secondary);

  return {
    ...fallback,

    async listDeals() {
      if (supabaseHasNoDeals) {
        return secondary.listDeals();
      }

      try {
        const deals = await primary.listDeals();
        if (deals.length === 0) {
          console.log('Primary repo returned empty deals, falling back to secondary');
          supabaseHasNoDeals = true;
        }
        return deals;
      } catch (err) {
        supabaseErrorCount++;
        if (supabaseErrorCount >= MAX_ERRORS) {
          supabaseHasNoDeals = true;
        }
        console.log('Falling back to secondary repo for listDeals');
        return secondary.listDeals();
      }
    },

    async getDeal(slug: string) {
      if (supabaseHasNoDeals) {
        return secondary.getDeal(slug);
      }

      try {
        const deal = await primary.getDeal(slug);
        if (!deal) {
          console.log(`Primary repo returned null for deal ${slug}`);
        }
        return deal ?? secondary.getDeal(slug);
      } catch (err) {
        supabaseErrorCount++;
        if (supabaseErrorCount >= MAX_ERRORS) {
          supabaseHasNoDeals = true;
        }
        console.log(`Falling back to secondary repo for getDeal(${slug})`);
        return secondary.getDeal(slug);
      }
    },

    async listCoupons() {
      if (supabaseHasNoDeals) {
        return secondary.listCoupons();
      }

      try {
        const coupons = await primary.listCoupons();
        if (coupons.length === 0) {
          console.log('Primary repo returned empty coupons');
        }
        return coupons;
      } catch (err) {
        supabaseErrorCount++;
        if (supabaseErrorCount >= MAX_ERRORS) {
          supabaseHasNoDeals = true;
        }
        console.log('Falling back to secondary repo for listCoupons');
        return secondary.listCoupons();
      }
    },

    async addComment(comment: { id: string; dealSlug?: string; author: string; message: string; createdAt: string }) {
      // Community comments (no dealSlug) - always try primary
      // They can be added even if deals table is empty (FK allows NULL)
      if (!comment.dealSlug) {
        return primary.addComment(comment);
      }

      // For deal comments, check if we know Supabase is empty
      if (supabaseHasNoDeals) {
        // Use secondary for deal comments since deals don't exist in Supabase
        try {
          return secondary.addComment(comment);
        } catch {
          // Secondary also failed - try primary anyway
          return primary.addComment(comment);
        }
      }

      // Try primary first, fall back to secondary on FK violation
      try {
        return await primary.addComment(comment);
      } catch (err: any) {
        // Check for foreign key violation
        if (err.message?.includes('foreign key') || err.message?.includes('violates constraint') || err.message?.includes('FK')) {
          console.log(`FK violation for comment on deal ${comment.dealSlug}, using secondary repo`);
          supabaseHasNoDeals = true;
          return secondary.addComment(comment);
        }
        throw err;
      }
    },

    async listComments(dealSlug?: string) {
      // When Supabase is known to have no deals, use secondary for comments
      if (supabaseHasNoDeals) {
        return secondary.listComments(dealSlug);
      }

      try {
        return await primary.listComments(dealSlug);
      } catch {
        return secondary.listComments(dealSlug);
      }
    },

    async commentCounts() {
      if (supabaseHasNoDeals) {
        return secondary.commentCounts();
      }

      try {
        return await primary.commentCounts();
      } catch {
        return secondary.commentCounts();
      }
    },
  };
}