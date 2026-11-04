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
 *  - Detects Vercel build phase via NEXT_PHASE=build
 *  - Uses JSON repo during build for static generation
 *  - At runtime with REPO=auto, uses Supabase when credentials are present
 */
export function repo(): Repo {
  if (singleton) return singleton;

  const mode = (process.env.REPO ?? 'auto').toLowerCase();
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const isBuild = process.env.NEXT_PHASE === 'build';

  if (mode === 'supabase' && !hasSupabase) {
    throw new Error('REPO=supabase but SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY missing');
  }

  // During Vercel build phase, use JSON repo for static data generation
  // This avoids network dependencies and EROFS errors on read-only filesystem
  if (isBuild) {
    console.log('Using JSON file repository (build mode)');
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