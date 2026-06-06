-- Granbury Home Board — Phase 1 schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- TRADES (the 15 service categories)
-- ============================================================
create table public.trades (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

insert into public.trades (name, slug) values
  ('Handyman',            'handyman'),
  ('Plumbing',            'plumbing'),
  ('Electrical',          'electrical'),
  ('HVAC',                'hvac'),
  ('Lawn & Landscaping',  'lawn-landscaping'),
  ('Painting',            'painting'),
  ('House Cleaning',      'house-cleaning'),
  ('Roofing',             'roofing'),
  ('Flooring',            'flooring'),
  ('Fencing',             'fencing'),
  ('Pool Service',        'pool-service'),
  ('Pest Control',        'pest-control'),
  ('Appliance Repair',    'appliance-repair'),
  ('Junk Removal',        'junk-removal'),
  ('Pressure Washing',    'pressure-washing');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- role: 'homeowner' | 'provider' | 'admin'
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('homeowner', 'provider', 'admin')),
  full_name   text not null,
  phone       text,
  zip         text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- PROVIDERS (one row per provider account)
-- ============================================================
create table public.providers (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null unique references public.profiles(id) on delete cascade,
  business_name   text not null,
  description     text,
  phone           text,
  email           text,
  website         text,
  zip             text not null,
  service_area    text[] not null default '{}',
  verified        boolean not null default false,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Many-to-many: which trades a provider offers
create table public.provider_trades (
  provider_id  uuid not null references public.providers(id) on delete cascade,
  trade_id     bigint not null references public.trades(id) on delete cascade,
  primary key (provider_id, trade_id)
);

-- ============================================================
-- REQUESTS (homeowner job posts)
-- status: 'open' | 'quoted' | 'closed'
-- ============================================================
create table public.requests (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  trade_id    bigint not null references public.trades(id),
  title       text not null,
  description text not null,
  zip         text not null,
  status      text not null default 'open' check (status in ('open', 'quoted', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Photos attached to a request
create table public.request_photos (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.requests(id) on delete cascade,
  storage_path text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- QUOTES (provider responses to a request)
-- ============================================================
create table public.quotes (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.requests(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  amount      numeric(10,2) not null,
  message     text,
  created_at  timestamptz not null default now(),
  unique (request_id, provider_id)
);

-- ============================================================
-- SUBSCRIPTIONS (provider paid tier — Phase 6, seam only)
-- status: 'active' | 'canceled' | 'past_due'
-- ============================================================
create table public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  provider_id           uuid not null unique references public.providers(id) on delete cascade,
  stripe_customer_id    text,
  stripe_subscription_id text,
  status                text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  current_period_end    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.trades enable row level security;
alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.provider_trades enable row level security;
alter table public.requests enable row level security;
alter table public.request_photos enable row level security;
alter table public.quotes enable row level security;
alter table public.subscriptions enable row level security;

-- Trades: anyone can read
create policy "trades_read" on public.trades for select using (true);

-- Profiles: users can read all, update own
create policy "profiles_read" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());

-- Providers: anyone can read active, owner can update
create policy "providers_read" on public.providers for select using (active = true);
create policy "providers_insert_own" on public.providers for insert with check (profile_id = auth.uid());
create policy "providers_update_own" on public.providers for update using (profile_id = auth.uid());

-- Provider trades: anyone can read, owner can manage
create policy "provider_trades_read" on public.provider_trades for select using (true);
create policy "provider_trades_insert" on public.provider_trades for insert
  with check (provider_id in (select id from public.providers where profile_id = auth.uid()));
create policy "provider_trades_delete" on public.provider_trades for delete
  using (provider_id in (select id from public.providers where profile_id = auth.uid()));

-- Requests: anyone can read open, owner can manage
create policy "requests_read" on public.requests for select using (true);
create policy "requests_insert_own" on public.requests for insert with check (profile_id = auth.uid());
create policy "requests_update_own" on public.requests for update using (profile_id = auth.uid());

-- Request photos: anyone can read, request owner can insert
create policy "request_photos_read" on public.request_photos for select using (true);
create policy "request_photos_insert" on public.request_photos for insert
  with check (request_id in (select id from public.requests where profile_id = auth.uid()));

-- Quotes: request owner and quote provider can read, provider can insert
create policy "quotes_read" on public.quotes for select using (
  provider_id in (select id from public.providers where profile_id = auth.uid())
  or request_id in (select id from public.requests where profile_id = auth.uid())
);
create policy "quotes_insert" on public.quotes for insert
  with check (provider_id in (select id from public.providers where profile_id = auth.uid()));

-- Subscriptions: owner can read
create policy "subscriptions_read" on public.subscriptions for select
  using (provider_id in (select id from public.providers where profile_id = auth.uid()));

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_requests_trade on public.requests(trade_id);
create index idx_requests_zip on public.requests(zip);
create index idx_requests_status on public.requests(status);
create index idx_quotes_request on public.quotes(request_id);
create index idx_providers_zip on public.providers(zip);
