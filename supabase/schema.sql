-- ============================================================================
-- Muddapappu — Supabase / Postgres schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- After running, set in .env.local:
--   SUPABASE_URL=https://<project-ref>.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY=<service_role key from Settings → API>
--   REPO=supabase
-- ============================================================================

-- Deals table: stores normalized Deal objects as JSONB so we can evolve the
-- shape without migrations. Indexed columns are generated for fast filtering.
create table if not exists public.deals (
  id           text primary key,
  slug         text unique not null,
  store        text not null,
  category     text not null,
  price        numeric(12,2) not null,
  mrp          numeric(12,2) not null,
  discount_pct integer generated always as (
    case when mrp > 0 then least(99, round(((mrp - price) / mrp * 100)::numeric)) else 0 end
  ) stored,
  status       text not null default 'active',   -- active | expiring | expired
  in_stock     boolean not null default true,
  featured     boolean not null default false,
  listed_at    timestamptz not null default now(),
  ends_at      timestamptz,
  verified_at  timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  data         jsonb not null                    -- full Deal object
);

create index if not exists deals_store_idx      on public.deals(store);
create index if not exists deals_category_idx   on public.deals(category);
create index if not exists deals_status_idx     on public.deals(status);
create index if not exists deals_discount_idx   on public.deals(discount_pct desc);
create index if not exists deals_price_idx      on public.deals(price asc);
create index if not exists deals_listed_idx     on public.deals(listed_at desc);
create index if not exists deals_data_gin_idx   on public.deals using gin(data);

-- Coupons table: same JSONB pattern.
create table if not exists public.coupons (
  id          text primary key,
  store       text not null,
  code        text not null,
  title       text not null,
  value       numeric(12,2) not null,
  value_type  text not null,                      -- flat | percent
  active      boolean not null default true,
  expires_at  timestamptz,
  updated_at  timestamptz not null default now(),
  data        jsonb not null
);

create index if not exists coupons_store_idx    on public.coupons(store);
create index if not exists coupons_active_idx   on public.coupons(active);
create index if not exists coupons_expires_idx  on public.coupons(expires_at desc);

-- Click tracking: every outbound affiliate click gets logged here.
-- Later you can join with Cuelinks transactions to compute real EPC per deal.
create table if not exists public.clicks (
  id          bigserial primary key,
  deal_id     text,
  coupon_id   text,
  store       text not null,
  target_url  text not null,
  referrer    text,
  user_agent  text,
  ip_hash     text,                               -- anonymized IP for dedupe
  country     text,
  clicked_at  timestamptz not null default now()
);

create index if not exists clicks_deal_idx      on public.clicks(deal_id);
create index if not exists clicks_clicked_idx   on public.clicks(clicked_at desc);

-- Community comments / chat. deal_slug NULL means a general-feed post
-- (product request, shared deal tip) rather than a comment on a product.
create table if not exists public.comments (
  id          text primary key,
  deal_slug   text references public.deals(slug) on delete cascade,
  author      text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists comments_deal_idx    on public.comments(deal_slug);
create index if not exists comments_created_idx on public.comments(created_at desc);

alter table public.comments enable row level security;

drop policy if exists "anon insert comments" on public.comments;
create policy "anon insert comments" on public.comments
  for insert to anon with check (char_length(message) between 1 and 2000);

-- Public read of live comments so the chat feed works without auth.
drop policy if exists "public read comments" on public.comments;
create policy "public read comments" on public.comments
  for select to anon using (true);

-- Cuelinks campaign cache: mirrors GET /campaigns so we don't hit their API
-- more than needed. Refresh via scripts/sync-cuelinks.ts.
create table if not exists public.cuelinks_campaigns (
  campaign_id     integer primary key,
  name            text not null,
  network_name    text,
  epc_7d          numeric(12,2),
  commission_rate text,
  categories      jsonb,
  raw             jsonb not null,
  synced_at       timestamptz not null default now()
);

-- Row Level Security: locked down by default. Only the service-role key
-- (used server-side) can read/write. Anonymous visitors get nothing directly —
-- they go through Next.js API routes which use the service role.
alter table public.deals              enable row level security;
alter table public.coupons            enable row level security;
alter table public.clicks             enable row level security;
alter table public.cuelinks_campaigns enable row level security;

-- Allow anon INSERT into clicks only (for future client-side beacon if needed).
drop policy if exists "anon insert clicks" on public.clicks;
create policy "anon insert clicks" on public.clicks
  for insert to anon with check (true);

-- Public read of live deals/coupons is OPTIONAL — currently disabled because
-- the Next.js server reads everything via service role. Enable if you want
-- direct client SDK access later:
-- drop policy if exists "public read deals" on public.deals;
-- create policy "public read deals" on public.deals
--   for select to anon using (status <> 'expired');

-- Updated_at trigger
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists deals_touch on public.deals;
create trigger deals_touch before update on public.deals
  for each row execute function public.touch_updated_at();

drop trigger if exists coupons_touch on public.coupons;
create trigger coupons_touch before update on public.coupons
  for each row execute function public.touch_updated_at();
