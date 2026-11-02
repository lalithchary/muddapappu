import { promises as fs } from 'fs';
import path from 'path';
import { SAMPLE_COUPONS, SAMPLE_DEALS } from '../data/sample-data';

async function main() {
  const dir = path.resolve(process.cwd(), process.env.DATA_DIR || 'data/store');
  await fs.mkdir(dir, { recursive: true });

  const dealsPath = path.join(dir, 'deals.json');
  const couponsPath = path.join(dir, 'coupons.json');

  try {
    await fs.stat(dealsPath);
    console.log(`[seed] ${dealsPath} already exists — skipping seed to preserve data.`);
  } catch {
    await fs.writeFile(dealsPath, JSON.stringify(SAMPLE_DEALS, null, 2), 'utf8');
    console.log(`[seed] Wrote ${SAMPLE_DEALS.length} sample deals to ${dealsPath}`);
  }

  try {
    await fs.stat(couponsPath);
    console.log(`[seed] ${couponsPath} already exists — skipping seed to preserve data.`);
  } catch {
    await fs.writeFile(couponsPath, JSON.stringify(SAMPLE_COUPONS, null, 2), 'utf8');
    console.log(`[seed] Wrote ${SAMPLE_COUPONS.length} sample coupons to ${couponsPath}`);
  }
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
