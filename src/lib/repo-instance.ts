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
 *  - REPO=supabase forces Supabase always (requires data seeded)
 *  - REPO=json forces JSON always (good for hybrid setups, build override)
 *  - REPO=auto (default):
 *    - Build time (VERCEL env var set by Vercel, or NEXT_PHASE=build): Use JSON repo
 *    - Runtime with Supabase creds: Use Supabase repo
 *    - Runtime without Supabase creds: Use JSON repo
 */
export function repo(): Repo {
  if (singleton) return singleton;

  const mode = (process.env.REPO ?? 'auto').toLowerCase();
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const isVercelBuild = Boolean(process.env.VERCEL) && mode === 'auto';

  if (mode === 'supabase' && !hasSupabase) {
    throw new Error('REPO=supabase but SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY missing');
  }

  // During Vercel build with REPO=auto, use JSON repo
  // This ensures static generation works even if Supabase isn't seeded yet
  if (isVercelBuild) {
    console.log('Using JSON file repository (build mode - Vercel detected)');
    singleton = createJsonRepo();
    return singleton;
  }

  // During local production build (NODE_ENV=production, no VERCEL), use JSON repo
  const isLocalBuild = process.env.NODE_ENV === 'production' && !process.env.VERCEL && mode !== 'supabase';
  if (isLocalBuild) {
    console.log('Using JSON file repository (local build mode)');
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