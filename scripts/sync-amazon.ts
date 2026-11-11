/**
 * Amazon Deals Sync Script (CLI runner)
 * Usage:
 *   npx tsx scripts/sync-amazon.ts
 *   npx tsx scripts/sync-amazon.ts --tag yourtag-21
 */

import { syncAmazonDeals } from '../src/lib/amazon-sync';

function parseTag(argv: string[]): string | undefined {
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--tag' && argv[i + 1]) {
      return argv[i + 1];
    }
  }
  return undefined;
}

async function main() {
  const customTag = parseTag(process.argv);
  console.log('[sync-amazon] Starting Amazon deals automation...');
  const res = await syncAmazonDeals(customTag);

  console.log('───────────────────────────────────────────────────────');
  console.log(`Amazon Sync Result:`);
  console.log(`  Synced new:  ${res.synced}`);
  console.log(`  Updated:     ${res.updated}`);
  console.log(`  Total deals: ${res.deals.length}`);
  if (res.errors.length > 0) {
    console.warn(`  Errors (${res.errors.length}):`, res.errors);
  }
  console.log('───────────────────────────────────────────────────────');
  res.deals.forEach((d) => {
    console.log(`✓ [${d.discount}% OFF] ${d.title.slice(0, 45)}... -> ₹${d.price}`);
    console.log(`  Affiliate: ${d.affiliateUrl}`);
  });
}

main().catch((err) => {
  console.error('[sync-amazon] Fatal:', err);
  process.exit(1);
});
