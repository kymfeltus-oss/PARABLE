-- Praises + comments for Instagram-style feed (run after `posts` exists).
-- Tables: public.post_likes, public.post_comments — enable both in Realtime (Replication).

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists post_likes_post_id_idx on public.post_likes (post_id);

alter table public.post_likes enable row level security;

drop policy if exists "Authenticated can read post_likes" on public.post_likes;
create policy "Authenticated can read post_likes"
  on public.post_likes for select to authenticated
  using (true);

drop policy if exists "Users insert own post_likes" on public.post_likes;
create policy "Users insert own post_likes"
  on public.post_likes for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own post_likes" on public.post_likes;
create policy "Users delete own post_likes"
  on public.post_likes for delete to authenticated
  using (auth.uid() = user_id);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_id_idx on public.post_comments (post_id);

alter table public.post_comments enable row level security;

drop policy if exists "Authenticated can read post_comments" on public.post_comments;
create policy "Authenticated can read post_comments"
  on public.post_comments for select to authenticated
  using (true);

drop policy if exists "Users insert own post_comments" on public.post_comments;
create policy "Users insert own post_comments"
  on public.post_comments for insert to authenticated
  with check (auth.uid() = profile_id);
