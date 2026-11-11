# Firebase Deployment & Amazon Deal Automation Guide (`muddapappu.web.app`)

This guide explains how to deploy **Muddapappu** (`muddapappu.web.app`) on Google Firebase and set up automated real-time deal syncs (including Amazon deals).

---

## 1. Is it possible to move the app from Vercel to Firebase?

**Yes! Absolutely.**
Muddapappu is built with Next.js and has been pre-configured for **Firebase App Hosting** and **Firebase Cloud Functions**.

### Key Features on Firebase:
- **Hosting**: Direct deployment to `muddapappu.web.app` or custom domain via Firebase App Hosting / Cloud Run.
- **Data & Comments**: Works with **Supabase Postgres** (for live comments & storage) or embedded JSON files.
- **Automated Deals**: **Firebase Cloud Scheduler (Scheduled Functions)** or **GitHub Actions Cron** runs every 30 minutes to fetch live Amazon & Cuelinks deals automatically.

---

## 2. Deploying to Firebase (`muddapappu.web.app`)

### Option A: Firebase App Hosting (Recommended - Zero Config SSR)
Firebase App Hosting connects directly to your GitHub repository (`muddapappu`).

1. Install Firebase CLI (if not installed):
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Go to [Firebase Console](https://console.firebase.google.com/) and create a project named **`muddapappu`**.
3. In Firebase Console, navigate to **Build → App Hosting**.
4. Click **Get Started** and link your GitHub repository (`lalithchary/muddapappu`).
5. Select branch `main` and root directory `deals-portal`.
6. Set Environment Variables in Firebase App Hosting:
   - `REPO`: `auto` (or `supabase`)
   - `CUELINKS_API_KEY`: `your_cuelinks_api_key`
   - `AMAZON_TAG`: `muddapappu-21` (or your Amazon tag)
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_service_role_key`
7. Click **Deploy**. Firebase will deploy your app to `muddapappu.web.app`!

---

## 3. Realtime Updates & Cron Jobs for Deals

We have set up **2 Automated Cron Systems** for real-time deals:

### System 1: Firebase Cloud Scheduler (Cloud Functions)
Scheduled functions in `functions/src/index.ts` run periodically:
- `syncDeals`: Runs **every 30 minutes** to fetch Cuelinks deals.
- `syncAmazonDeals`: Runs **every 6 hours** to fetch and update Amazon deals.

To deploy Firebase Cloud Functions:
```bash
cd deals-portal/functions
npm install
npm run deploy
```

### System 2: GitHub Actions Automated Workflow (Zero Cloud Cost)
We created a GitHub Action workflow `.github/workflows/sync-deals.yml`.
- Runs automatically **every 30 minutes** via GitHub Runners.
- Runs `npm run sync:cuelinks` and `npm run sync:amazon`.
- Automatically commits updated deals back to your repo or database.

#### Adding Secrets to GitHub:
Go to your **GitHub Repository → Settings → Secrets and variables → Actions**, and add:
- `CUELINKS_API_KEY`
- `AMAZON_TAG`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 4. Manual Deal Synchronization

You can also trigger real-time updates manually at any time:

### Sync Amazon Deals manually:
```bash
npm run sync:amazon
```

### Sync Cuelinks Deals manually:
```bash
npm run sync:cuelinks
```

### API Endpoint Trigger:
Send a POST request to:
`https://muddapappu.web.app/api/cron/amazon-sync`
Header: `Authorization: Bearer muddapappu-secret`

---

## Summary of Config Files Created:
- `firebase.json` - Firebase Hosting configuration
- `.firebaserc` - Project binding (`muddapappu`)
- `apphosting.yaml` - Firebase App Hosting Next.js configuration
- `functions/src/index.ts` - Scheduled cron triggers (30 min deal sync)
- `scripts/sync-amazon.ts` - Amazon deal fetching & tag verification
- `src/app/api/cron/amazon-sync/route.ts` - Webhook for Amazon sync
- `.github/workflows/sync-deals.yml` - Automated GitHub Actions sync
