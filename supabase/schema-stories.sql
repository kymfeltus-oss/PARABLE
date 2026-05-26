-- Instagram-style Stories: dedicated tables (isolated from public.posts).
-- Run once in Supabase SQL Editor.

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists stories_user_id_idx on public.stories (user_id);
create index if not exists stories_expires_at_idx on public.stories (expires_at desc);
create index if not exists stories_created_at_idx on public.stories (created_at desc);

create table if not exists public.story_views (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (story_id, viewer_id)
);

create index if not exists story_views_story_id_idx on public.story_views (story_id);
create index if not exists story_views_viewer_id_idx on public.story_views (viewer_id);

alter table public.stories enable row level security;
alter table public.story_views enable row level security;

-- Active stories readable by any signed-in user.
drop policy if exists "Authenticated can read active stories" on public.stories;
create policy "Authenticated can read active stories"
  on public.stories for select
  to authenticated
  using (expires_at > now());

drop policy if exists "Users can insert own stories" on public.stories;
create policy "Users can insert own stories"
  on public.stories for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own stories" on public.stories;
create policy "Users can delete own stories"
  on public.stories for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read own story views" on public.story_views;
create policy "Users can read own story views"
  on public.story_views for select
  to authenticated
  using (auth.uid() = viewer_id);

drop policy if exists "Users can insert own story views" on public.story_views;
create policy "Users can insert own story views"
  on public.story_views for insert
  to authenticated
  with check (auth.uid() = viewer_id);

-- Optional: purge expired rows daily via pg_cron (run manually if extension unavailable):
-- delete from public.stories where expires_at <= now();

-- Story media uploads use the existing `avatars` storage bucket at `{user_id}/stories/*`.
-- Ensure `supabase/storage-avatars-policies.sql` is applied (insert allowed under own uid folder).
