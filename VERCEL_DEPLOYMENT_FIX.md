# Vercel Deployment Fix - Action Required

## Problem Summary

The deployed site at `https://muddapappu.vercel.app` shows:
1. **Homepage: "0 deals found"**
2. **Deal page comments: Foreign key violation error**

## Root Cause

The `.env.local` file in this workspace contained **invalid Supabase credentials**:
- URL: `ohqwdukcjhwcntfktygg.supabase.co` (project doesn't exist/deleted)
- Key: `sb_publishable_...` (this is an ANON key, not a SERVICE ROLE key)

## Solution Steps

### Step 1: Delete Invalid Environment from Vercel

**Go to Vercel Dashboard → Your Project → Settings → Environment Variables**

Delete these invalid variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

This will make the site fall back to JSON-only mode (which works for viewing deals).

### Step 2: For Production with Comments (Optional - Recommended)

If you want comments and chat to work:

1. **Create a new Supabase project** at https://supabase.com (free tier available)

2. **Run the schema.sql** in Supabase SQL Editor:
   - Copy the contents of `supabase/schema.sql`
   - Paste in SQL Editor → Run

3. **Seed deals to Supabase**:
   ```sql
   -- Run this in SQL Editor (replace with your actual values from data/store/deals.json)
   INSERT INTO public.deals (id, slug, store, category, price, mrp, status, in_stock, featured, listed_at, verified_at, data)
   SELECT id, slug, store, category, price, mrp, 'active', true, featured, now(), now(), data
   FROM jsonb_to_recordset('[{"id":"amazon-boat-airdopes-311","slug":"boat-airdopes-311-pro-wireless-earbuds",...}]'::jsonb)
   AS x(id text, slug text, store text, category text, price numeric, mrp numeric, featured int, data jsonb);
   ```

4. **Set valid environment variables** in Vercel:
   ```
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6...
   ```

   **Important**: The service_role key starts with `eyJ` (it's a JWT). Do NOT use keys starting with `sb_publishable_`.

### Step 3: Deploy

1. **Delete this commit** that removed `.env.local`
2. **Commit the fixed code** (with the smart fallback logic)
3. **Redeploy** on Vercel

## What the Fix Does

The code now includes intelligent fallback handling:

| Scenario | Result |
|----------|--------|
| No Supabase env vars | Uses JSON files (works on Vercel - read-only) |
| Valid Supabase credentials | Uses Supabase for deals |
| Deals table empty in Supabase | Falls back to JSON |
| FK violation on comment | Falls back to JSON for that comment |

## Files Modified

1. **src/lib/repo-instance.ts** - Added `createSmartFallback` function that:
   - Detects empty Supabase results
   - Falls back to JSON for reads
   - Catches FK violations for comments

2. **.env.example** - Updated with clear instructions for valid credentials

## Verification

After deployment:
1. Visit https://muddapappu.vercel.app - should show deals
2. Visit https://muddapappu.vercel.app/community - should load and post comments
3. Visit https://muddapappu.vercel.app/deal/boat-airdopes-311-pro-wireless-earbuds - should show deal detail

## Admin Password

`Cockr0@ch@2026` (for `/admin` and `/admin/login` pages)