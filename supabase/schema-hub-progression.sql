-- PARABLE: Hub permissions + Kingdom Path (run after schema-profiles-and-groups.sql)
-- Extends profiles for server-driven unlocks; adds user_progression for skill nodes.

alter table public.profiles
  add column if not exists kingdom_xp integer not null default 0;

alter table public.profiles
  add column if not exists streamer_status boolean not null default false;

alter table public.profiles
  add column if not exists unlocked_hubs jsonb not null default '["sanctuary"]'::jsonb;

create table if not exists public.user_progression (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unlocked_nodes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_progression enable row level security;

create policy "Users read own progression"
  on public.user_progression for select to authenticated
  using (auth.uid() = user_id);

create policy "Users upsert own progression"
  on public.user_progression for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own progression"
  on public.user_progression for update to authenticated
  using (auth.uid() = user_id);
