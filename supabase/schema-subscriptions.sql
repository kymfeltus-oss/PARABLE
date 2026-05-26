-- Subscription billing tables for Stripe Checkout + webhook sync.
-- Run in Supabase SQL editor after profiles exist.

create table if not exists public.subscription_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_price_id text not null unique,
  cost_cents integer not null check (cost_cents >= 0),
  perks jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tier_id uuid not null references public.subscription_tiers (id),
  stripe_subscription_id text not null unique,
  status text not null,
  current_period_end timestamptz not null,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists user_subscriptions_status_idx on public.user_subscriptions (status);

alter table public.subscription_tiers enable row level security;
alter table public.user_subscriptions enable row level security;

-- Public read for tier catalog; writes via service role (webhook) only.
create policy "subscription_tiers_public_read"
  on public.subscription_tiers for select
  to authenticated, anon
  using (true);

create policy "user_subscriptions_read_own"
  on public.user_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

comment on table public.subscription_tiers is 'Stripe Price catalog mapped to PARABLE perk tiers.';
comment on table public.user_subscriptions is 'Active Stripe subscription state synced from webhooks.';
