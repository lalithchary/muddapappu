import { createJsonRepo } from './repo-json';
import { createSupabaseRepo } from './repo-supabase';
import { withFallback } from './repo-fallback';
import type { Repo } from './repo';

let singleton: Repo | null = null;

/**
 * Returns the active repository.
 *  REPO=auto (default): Try Supabase first, fall back to JSON if tables don't exist.
 *  REPO=json   : force local JSON storage (great for dev / hybrid setups).
 *  REPO=supabase: force Supabase Postgres (recommended for Vercel production with seeded data).
 *
 *  IMPORTANT for Vercel: JSON file writes WILL FAIL on Vercel serverless.
 *  To use comments/chat on Vercel, you MUST set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *  AND ensure the database is seeded (run supabase/schema.sql in Supabase SQL editor).
 *
 *  Runtime behavior:
 *  - At runtime (server-side functions, API routes): If Supabase is configured, try it first
 *  - If Supabase tables don't exist, automatically fall back to JSON for static data
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

  // At runtime with Supabase configured, use a fallback wrapper
  // Primary: Supabase, Secondary: JSON
  // This handles the case where Supabase is configured but tables don't exist yet
  if (hasSupabase || mode === 'supabase') {
    const supabaseRepo = createSupabaseRepo();
    const jsonRepo = createJsonRepo();
    console.log('Using Supabase repository with JSON fallback');
    singleton = withFallback(supabaseRepo, jsonRepo);
    return singleton;
  }

  console.log('Using JSON file repository (dev mode)');
  singleton = createJsonRepo();
  return singleton;
}