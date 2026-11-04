import { createJsonRepo } from './repo-json';
import { createSupabaseRepo } from './repo-supabase';
import type { Repo } from './repo';

let singleton: Repo | null = null;

/**
 * Returns the active repository.
 *  REPO=auto (default): Supabase if configured, else JSON files.
 *  REPO=json   : force local JSON storage (great for dev / Raspberry Pi hybrid).
 *  REPO=supabase: force Supabase Postgres (recommended for Vercel production).
 *
 *  IMPORTANT for Vercel: JSON file writes WILL FAIL on Vercel serverless.
 *  To use comments/chat on Vercel, you MUST set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *  AND ensure the database is seeded (run supabase/schema.sql in Supabase SQL editor).
 *
 *  Runtime behavior:
 *  - At runtime (server-side functions, API routes): If Supabase is configured, use it
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

  const useSupabase = mode === 'supabase' || (mode === 'auto' && hasSupabase);

  if (useSupabase) {
    console.log('Using Supabase repository (production mode)');
    singleton = createSupabaseRepo();
  } else {
    console.log('Using JSON file repository (dev mode)');
    singleton = createJsonRepo();
  }

  return singleton;
}