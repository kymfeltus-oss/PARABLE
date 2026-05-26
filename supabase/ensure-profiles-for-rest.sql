-- Run in Supabase SQL Editor for THIS project only (e.g. rmerwwmamddqrqtxvkrx).
-- Fixes: "Could not find the table 'public.profiles' in the schema cache"
-- and sets RLS so Discover can list other members after sign-in.

-- 1) Table (safe to re-run)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  full_name text,
  avatar_url text,
  role text,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Table privileges for the Supabase API (JWT role = authenticated)
grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;

alter table public.profiles enable row level security;

-- 3) Policies (idempotent: drop then create)
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Authenticated can read profiles for discovery" on public.profiles;

create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id);

-- Discover / suggested follows: read peers (not only own row)
create policy "Authenticated can read profiles for discovery"
  on public.profiles for select to authenticated
  using (true);

-- 4) Refresh PostgREST schema cache so REST sees the table immediately
notify pgrst, 'reload schema';
