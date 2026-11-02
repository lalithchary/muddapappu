import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SastaDeal',
    short_name: 'SastaDeal',
    description: 'Best deals & offers in India — Amazon, Flipkart, Myntra, Ajio, Swiggy, Zomato, Zepto, BigBasket.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0B',
    theme_color: '#0A0A0B',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}