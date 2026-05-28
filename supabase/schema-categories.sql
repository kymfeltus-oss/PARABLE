-- Stream taxonomy + profile classification (Kick-style discovery).
-- Safe to re-run. Apply in Supabase SQL Editor before wiring Live Studio / category routes.

-- ---------------------------------------------------------------------------
-- profiles: classification + admin flag + stream title
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists category_id uuid;

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.profiles
  add column if not exists stream_title text;

comment on column public.profiles.category_id is
  'FK to public.categories — primary discovery bucket for live streams.';

comment on column public.profiles.is_admin is
  'When true, user may override broadcaster category from /watch via moderation HUD.';

comment on column public.profiles.stream_title is
  'Active live session title shown on discovery cards and watch shell.';

-- ---------------------------------------------------------------------------
-- categories: parent/child taxonomy
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_id uuid references public.categories (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_parent_id_idx on public.categories (parent_id);
create index if not exists categories_sort_order_idx on public.categories (sort_order);

alter table public.profiles
  drop constraint if exists profiles_category_id_fkey;

alter table public.profiles
  add constraint profiles_category_id_fkey
  foreign key (category_id) references public.categories (id) on delete set null;

create index if not exists profiles_category_id_is_live_idx
  on public.profiles (category_id, viewer_count desc)
  where is_live = true;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
  on public.categories for select
  using (true);

drop policy if exists "Users update own profile category" on public.profiles;
create policy "Users update own profile category"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins update any profile category" on public.profiles;
create policy "Admins update any profile category"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles admin
      where admin.id = auth.uid() and admin.is_admin = true
    )
  );

-- ---------------------------------------------------------------------------
-- Seed taxonomy (parent → child labels like "Worship (IRL)")
-- ---------------------------------------------------------------------------
insert into public.categories (id, slug, name, parent_id, sort_order)
values
  ('b1000000-0000-4000-8000-000000000001', 'irl', 'IRL', null, 1),
  ('b1000000-0000-4000-8000-000000000002', 'worship', 'Worship', null, 2),
  ('b1000000-0000-4000-8000-000000000003', 'prayer', 'Prayer', null, 3),
  ('b1000000-0000-4000-8000-000000000004', 'gaming', 'Gaming', null, 4),
  ('b1000000-0000-4000-8000-000000000005', 'just-chatting', 'Just Chatting', 'b1000000-0000-4000-8000-000000000001', 10),
  ('b1000000-0000-4000-8000-000000000006', 'revival', 'Revival', 'b1000000-0000-4000-8000-000000000002', 11),
  ('b1000000-0000-4000-8000-000000000007', 'bible-study', 'Bible Study', 'b1000000-0000-4000-8000-000000000003', 12),
  ('b1000000-0000-4000-8000-000000000008', 'faith-gaming', 'Faith Gaming', 'b1000000-0000-4000-8000-000000000004', 13)
on conflict (slug) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  sort_order = excluded.sort_order;

-- Realtime: enable in Dashboard → Database → Replication → profiles (for admin category sync).
