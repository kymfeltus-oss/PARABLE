-- Follow relationships: follower_id follows following_id (both are public.profiles.id = auth.uid() pattern).
-- Run in Supabase SQL Editor after public.profiles exists.

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create index if not exists follows_follower_id_idx on public.follows (follower_id);
create index if not exists follows_following_id_idx on public.follows (following_id);

alter table public.follows enable row level security;

drop policy if exists "Users can read follows involving them" on public.follows;
create policy "Users can read follows involving them"
  on public.follows for select
  to authenticated
  using (auth.uid() = follower_id or auth.uid() = following_id);

drop policy if exists "Users can insert own follows" on public.follows;
create policy "Users can insert own follows"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

drop policy if exists "Users can delete own follows" on public.follows;
create policy "Users can delete own follows"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- Realtime: Dashboard → Database → Replication → enable `follows`, or run once:
--   alter publication supabase_realtime add table public.follows;
