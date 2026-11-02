import { createJsonRepo } from './repo-json';
import { createSupabaseRepo } from './repo-supabase';
import type { Repo } from './repo';

let singleton: Repo | null = null;

/**
 * Returns the active repository.
 *  REPO=auto (default): Supabase if credentials exist, else JSON files.
 *  REPO=json | REPO=supabase: force one.
 */
export function repo(): Repo {
  if (singleton) return singleton;
  const mode = (process.env.REPO ?? 'json').toLowerCase();
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const useSupabase = mode === 'supabase' || (mode === 'auto' && hasSupabase);
  if (mode === 'supabase' && !hasSupabase) {
    throw new Error('REPO=supabase but SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY missing');
  }
  singleton = useSupabase ? createSupabaseRepo() : createJsonRepo();
  return singleton;
}
