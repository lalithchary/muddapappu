import { MetadataRoute } from 'next';
import { repo } from '@/lib/repo-instance';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const slugs = await repo().allSlugs();
  const entries: MetadataRoute.Sitemap = [
    { url: base + '/', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: base + '/coupons', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: base + '/categories', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];
  for (const slug of slugs) {
    entries.push({ url: base + `/deal/${slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
  }
  return entries;
}