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
 *  Build-time behavior:
 *  - REPO=supabase forces Supabase always (requires data seeded)
 *  - REPO=json forces JSON always (good for hybrid setups, build override)
 *  - REPO=auto (default):
 *    - Build time (VERCEL && !NEXT_PUBLIC_SITE_URL): Use JSON repo
 *    - Runtime with Supabase creds: Use Supabase repo
 *    - Runtime without Supabase creds: Use JSON repo
 *
 *  Note: Vercel sets VERCEL=1 during both build and runtime.
 *  During build, NEXT_PUBLIC_SITE_URL is not set. At runtime, it is set.
 */
export function repo(): Repo {
  if (singleton) return singleton;

  const mode = (process.env.REPO ?? 'auto').toLowerCase();
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const isBuildTime = Boolean(process.env.VERCEL) && !process.env.NEXT_PUBLIC_SITE_URL;

  if (mode === 'supabase' && !hasSupabase) {
    throw new Error('REPO=supabase but SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY missing');
  }

  // During Vercel build (no NEXT_PUBLIC_SITE_URL), use JSON repo
  // This ensures static generation works even if Supabase isn't seeded yet
  if (isBuildTime && mode !== 'supabase') {
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