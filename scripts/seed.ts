import { promises as fs } from 'fs';
import path from 'path';
import { SAMPLE_COUPONS, SAMPLE_DEALS } from '../data/sample-data';

async function main() {
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (hasSupabase) {
    // Seed Supabase database
    console.log('[seed] Seeding Supabase database...');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      // Seed deals
      const { error: dealsError } = await supabase.from('deals').upsert(
        SAMPLE_DEALS.map(d => ({ id: d.id, slug: d.slug, data: d, listed_at: d.listedAt }))
      );
      if (dealsError) {
        console.error('[seed] Failed to seed deals:', dealsError.message);
      } else {
        console.log(`[seed] Seeded ${SAMPLE_DEALS.length} deals to Supabase`);
      }

      // Seed coupons
      const { error: couponsError } = await supabase.from('coupons').upsert(
        SAMPLE_COUPONS.map(c => ({ id: c.id, data: c }))
      );
      if (couponsError) {
        console.error('[seed] Failed to seed coupons:', couponsError.message);
      } else {
        console.log(`[seed] Seeded ${SAMPLE_COUPONS.length} coupons to Supabase`);
      }
    } catch (err) {
      console.error('[seed] Supabase seeding failed:', (err as Error).message);
      console.log('[seed] Falling back to JSON file seeding...');
    }
  }

  // Always seed JSON files (for build-time static generation)
  const dir = path.resolve(process.cwd(), process.env.DATA_DIR || 'data/store');
  await fs.mkdir(dir, { recursive: true });

  const dealsPath = path.join(dir, 'deals.json');
  const couponsPath = path.join(dir, 'coupons.json');

  // Always write JSON files to ensure build has data
  await fs.writeFile(dealsPath, JSON.stringify(SAMPLE_DEALS, null, 2), 'utf8');
  console.log(`[seed] Wrote ${SAMPLE_DEALS.length} sample deals to ${dealsPath}`);

  await fs.writeFile(couponsPath, JSON.stringify(SAMPLE_COUPONS, null, 2), 'utf8');
  console.log(`[seed] Wrote ${SAMPLE_COUPONS.length} sample coupons to ${couponsPath}`);
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});