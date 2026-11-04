/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Ensure data files are available during build
  // The JSON data should be committed to the repo for Vercel builds
  turbopack: {},

  images: {
    // Remote images come from retailer CDNs (Amazon, Flipkart, Myntra, Ajio).
    // Add your own CDN here if you proxy images through Cloudflare R2 later.
    remotePatterns: [
      { protocol: 'https', hostname: '*.amazon.in' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: '*.flipkart.com' },
      { protocol: 'https', hostname: '*.fbcdn.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'assets.myntassets.com' },
      { protocol: 'https', hostname: 'cdn.d2cb541lhz527.cloudfront.net' },
      { protocol: 'https', hostname: '*.swiggy.com' },
      { protocol: 'https', hostname: '*.zomato.com' },
      { protocol: 'https', hostname: '*.bigbasket.com' },
    ],
  },
};

export default nextConfig;