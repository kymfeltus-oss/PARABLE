-- Vertical Reels feed: dedicated table + view metrics.
-- Run once in Supabase SQL Editor.
-- Also create a public Storage bucket named `reels` (Dashboard → Storage → New bucket → Public).

create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade, -- same UUID as auth.users(id)
  video_url text not null,
  thumbnail_url text not null,
  caption text,
  audio_title text not null default 'Original Audio',
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists reels_user_id_idx on public.reels (user_id);
create index if not exists reels_created_at_idx on public.reels (created_at desc);

create table if not exists public.reel_views (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.reels (id) on delete cascade,
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  watch_ratio numeric(5, 4) not null default 0,
  viewed_at timestamptz not null default timezone('utc', now()),
  unique (reel_id, viewer_id)
);

create index if not exists reel_views_reel_id_idx on public.reel_views (reel_id);
create index if not exists reel_views_viewer_id_idx on public.reel_views (viewer_id);

alter table public.reels enable row level security;
alter table public.reel_views enable row level security;

drop policy if exists "Authenticated can read reels" on public.reels;
create policy "Authenticated can read reels"
  on public.reels for select
  to authenticated
  using (true);

drop policy if exists "Users can insert own reels" on public.reels;
create policy "Users can insert own reels"
  on public.reels for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own reels" on public.reels;
create policy "Users can update own reels"
  on public.reels for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own reels" on public.reels;
create policy "Users can delete own reels"
  on public.reels for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Authenticated can read reel views" on public.reel_views;
create policy "Authenticated can read reel views"
  on public.reel_views for select
  to authenticated
  using (auth.uid() = viewer_id);

drop policy if exists "Users can upsert own reel views" on public.reel_views;
create policy "Users can upsert own reel views"
  on public.reel_views for insert
  to authenticated
  with check (auth.uid() = viewer_id);

drop policy if exists "Users can update own reel views" on public.reel_views;
create policy "Users can update own reel views"
  on public.reel_views for update
  to authenticated
  using (auth.uid() = viewer_id);

-- Storage policies for the `reels` bucket (paths: `{uid}/reels/videos/*`, `{uid}/reels/thumbnails/*`).
drop policy if exists "Public read reels bucket" on storage.objects;
create policy "Public read reels bucket"
  on storage.objects for select
  using (bucket_id = 'reels');

drop policy if exists "Users upload reels to own folder" on storage.objects;
create policy "Users upload reels to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'reels'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Users update own reels objects" on storage.objects;
create policy "Users update own reels objects"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'reels'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Users delete own reels objects" on storage.objects;
create policy "Users delete own reels objects"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'reels'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Fallback: reels media may also live under the existing `avatars` bucket at `{uid}/reels/*`
-- (covered by storage-avatars-policies.sql).
