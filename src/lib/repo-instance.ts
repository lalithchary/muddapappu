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
 *  To use comments/chat on Vercel, you MUST set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 *  Build-time behavior:
 *  - Vercel sets VERCEL=true during build. We detect this and use JSON repo.
 *  - At runtime, if REPO=auto (default), we use Supabase when credentials are present.
 *  - This allows: JSON data for build (static pages), Supabase for runtime (comments/chat).
 */
export function repo(): Repo {
  if (singleton) return singleton;

  const mode = (process.env.REPO ?? 'auto').toLowerCase();
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const isBuildTime = Boolean(process.env.VERCEL) || process.env.NEXT_PHASE === 'build';

  if (mode === 'supabase' && !hasSupabase) {
    throw new Error('REPO=supabase but SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY missing');
  }

  // At build time (Vercel), always use JSON repo for static data
  // This ensures the build doesn't depend on network availability
  // The JSON data should be pre-seeded (e.g., via seed.ts or manually committed)
  if (isBuildTime && mode !== 'supabase') {
    console.log('Using JSON file repository (build mode - Vercel detected)');
    singleton = createJsonRepo();
    return singleton;
  }

  const useSupabase = mode === 'supabase' || (mode === 'auto' && hasSupabase);

  if (useSupabase) {
    console.log('Using Supabase repository (production mode)');
    singleton = createSupabaseRepo();
  } else {
    console.log('Using JSON file repository (dev mode - comments will fail on Vercel)');
    singleton = createJsonRepo();
  }

  return singleton;
}