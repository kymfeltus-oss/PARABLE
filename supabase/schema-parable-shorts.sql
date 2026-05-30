-- Parable AI Film Studio catalogue (optional — client falls back to demo reels if empty).
create table if not exists public.parable_shorts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text default '',
  video_url text not null,
  likes_count integer not null default 0,
  views_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists parable_shorts_created_idx
  on public.parable_shorts (created_at desc);

alter table public.parable_shorts enable row level security;

drop policy if exists "Public read parable shorts" on public.parable_shorts;
create policy "Public read parable shorts"
  on public.parable_shorts for select to authenticated, anon
  using (true);

grant select on public.parable_shorts to authenticated, anon;
