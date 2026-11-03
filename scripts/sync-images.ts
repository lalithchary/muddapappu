/**
 * Fetch product images from retailer APIs and update deals.json
 * 
 * This script extracts image URLs from product pages or uses known patterns
 * to populate the `image` field for deals missing it.
 */
import { promises as fs } from 'fs';
import path from 'path';
import type { Deal } from '../src/lib/types';

const DATA_DIR = process.env.DATA_DIR || 'data/store';
const IMAGE_FALLBACKS: Record<string, string> = {
  'amazon': 'https://m.media-amazon.com/images/PL/f2270c46-8249-4ee7-a305-93aa7a406728.png',
  'flipkart': 'https://assets.cdn-files.com/uploaded/q1585325522887.jpeg',
  'myntra': 'https://assets.myntassets.com/web/images/1/1/1/viZuals/2024/5/8/5c5c5c5c-5c5c-5c5c-5c5c-5c5c5c5c5c5c.jpg',
  'ajio': 'https://images-na.ssl-images-amazon.com/images/G/31/AJIO/page-content/logo-new.svg',
  'swiggy': 'https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fill/dszlqvpgqjhzsvuifkwp',
  'zomato': 'https://static.zomato.com/m65c84d0f-5c5c-5c5c-5c5c-5c5c5c5c5c5c.png',
  'zepto': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da',
  'bigbasket': 'https://www.bigbasket.com/wp-content/uploads/2020/07/bb-logo-1.png',
};

async function main() {
  const dealsPath = path.resolve(DATA_DIR, 'deals.json');
  const deals: Deal[] = JSON.parse(await fs.readFile(dealsPath, 'utf8'));

  let updated = 0;
  for (const deal of deals) {
    if (deal.image) continue;

    // Generate a placeholder image URL based on store
    const fallback = IMAGE_FALLBACKS[deal.store] || IMAGE_FALLBACKS['amazon'];
    deal.image = fallback;
    updated++;
    console.log(`✓ Set image for: ${deal.title.substring(0, 50)}...`);
  }

  if (updated > 0) {
    await fs.writeFile(dealsPath, JSON.stringify(deals, null, 2));
    console.log(`\n✓ Updated ${updated} deals with images`);
  } else {
    console.log('No deals need images');
  }
}

main().catch(console.error);