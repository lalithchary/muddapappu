# Muddapappu — India's Deal Finder

A high-performance affiliate marketing portal built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. 
Aggregates live deals from Amazon, Flipkart, Myntra, Ajio, Swiggy, Zomato, Zepto, and BigBasket via the **Cuelinks V3 API**.

## Features

- **Live Deal Search** — Instant search, filtering by store/category/price/discount/tags
- **Dynamic Status Tagging** — Deals auto-derive status (Live / Expiring / Expired) based on timers
- **Cuelinks V3 API** — Pull real offers and generate tracked affiliate links
- **Community Chat** — Discuss products, request new deals, share tips
- **Admin Panel** — Manage deals/coupons at `/admin` (password: `changeme-muddapappu`)
- **PWA Ready** — Manifest, icons, offline support included

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Production build
npm start          # Start production server
```

### Configure Environment

Copy `.env.example` to `.env.local` and add your Cuelinks API key:

```env
CUELINKS_API_KEY=your_key_here
```

### Sync Live Deals

```bash
npm run sync:cuelinks        # Pull from Cuelinks
npm run sync:cuelinks -- --dry-run   # Preview only
```

### Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main

# 2. Import on https://vercel.com
# 3. Add env vars: CUELINKS_API_KEY, REPO=json|supabase
```

## Project Structure

```
deals-portal/
├── src/
│   ├── app/               # Pages & API routes
│   ├── components/        # UI components (DealCard, FilterBar, CommentModal)
│   ├── lib/               # Core logic (repo, cuelinks client, status)
│   └── styles/            # Tailwind CSS
├── scripts/               # Data sync utilities
│   └── sync-cuelinks.ts   # Pull live offers
├── supabase/              # Postgres DDL schema
├── data/                  # Local JSON storage (dev)
└── public/                # Static assets
```

## Cuelinks Integration

The sync script fetches offers and maps them to our internal `Deal` schema.

**Supported Endpoints:**
- `GET /campaigns`: Search affiliate programs
- `GET /offers`: Pull live coupons & product deals  
- `POST /links/convert`: Generate tracked affiliate links

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/deals` | GET | List all deals (admin only) |
| `/api/deals` | POST | Create/update deal |
| `/api/deals` | DELETE | Delete a deal |
| `/api/comments` | GET | List comments (use `?dealSlug=xxx` to scope) |
| `/api/comments` | POST | Add new comment |

## License

Private / Proprietary.