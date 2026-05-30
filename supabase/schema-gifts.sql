-- Virtual gift catalog + live stream gift events for realtime overlays.
-- Run in Supabase SQL editor after profiles and creator_ledger_entries exist.

create table if not exists public.gift_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  coin_cost integer not null check (coin_cost > 0),
  animation_manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.stream_gifts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  gift_id uuid not null references public.gift_catalog (id),
  stream_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists stream_gifts_stream_id_idx
  on public.stream_gifts (stream_id, created_at desc);

alter table public.gift_catalog enable row level security;
alter table public.stream_gifts enable row level security;

drop policy if exists "gift_catalog_public_read" on public.gift_catalog;
create policy "gift_catalog_public_read"
  on public.gift_catalog for select
  to authenticated, anon
  using (true);

drop policy if exists "stream_gifts_public_read" on public.stream_gifts;
create policy "stream_gifts_public_read"
  on public.stream_gifts for select
  to authenticated, anon
  using (true);

drop policy if exists "stream_gifts_service_role_write" on public.stream_gifts;
create policy "stream_gifts_service_role_write"
  on public.stream_gifts for insert
  to service_role
  with check (true);

insert into public.gift_catalog (name, sku, coin_cost, animation_manifest)
values
  ('Amen', 'gift_amen', 25, '{"particles":"🙏","speed":"normal","scale":1}'::jsonb),
  ('Praise', 'gift_praise', 40, '{"particles":"🙌","speed":"normal","scale":1.1}'::jsonb),
  ('Clap', 'gift_clap', 50, '{"particles":"👏","speed":"normal","scale":1}'::jsonb),
  ('Holy Fire', 'gift_fire', 75, '{"particles":"🔥","speed":"fast","scale":1.2}'::jsonb),
  ('Offering', 'gift_offering', 100, '{"particles":"💰","speed":"normal","scale":1.15}'::jsonb),
  ('Glory', 'gift_glory', 60, '{"particles":"✨","speed":"normal","scale":1.1}'::jsonb),
  ('Peace', 'gift_peace', 45, '{"particles":"🕊️","speed":"slow","scale":1}'::jsonb),
  ('The Word', 'gift_word', 55, '{"particles":"📖","speed":"normal","scale":1}'::jsonb),
  ('Love', 'gift_love', 35, '{"particles":"❤️","speed":"normal","scale":1}'::jsonb),
  ('Applause', 'gift_applause', 50, '{"particles":"👏","speed":"normal","scale":1}'::jsonb),
  ('Arcade Controller', 'gift_controller', 200, '{"particles":"📖","speed":"fast","scale":1.2}'::jsonb),
  ('Champion Trophy', 'gift_trophy', 1000, '{"particles":"✨","speed":"slow","scale":1.5}'::jsonb)
on conflict (sku) do update set
  name = excluded.name,
  coin_cost = excluded.coin_cost,
  animation_manifest = excluded.animation_manifest;

-- Enable Realtime inserts for GiftOverlayCanvas particle triggers.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'stream_gifts'
  ) then
    alter publication supabase_realtime add table public.stream_gifts;
  end if;
end $$;

comment on table public.gift_catalog is 'Seed catalog of virtual gifts and coin costs.';
comment on table public.stream_gifts is 'Live gift events broadcast to stream viewers via Realtime.';
