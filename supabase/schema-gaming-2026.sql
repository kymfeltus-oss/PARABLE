-- PARABLE 2026 gaming schema: Imago inventory, pro-stick analytics, world influence, shed rooms.
-- Apply in Supabase SQL Editor after profiles/auth exist. Complements schema-gaming-vault.sql.
-- owner_id / user_id use auth.users(id); in most setups this matches public.profiles(id).

-- ---------------------------------------------------------------------------
-- 1. imago_inventory — 3D asset instances (wearables, armor, instruments)
-- ---------------------------------------------------------------------------
create table if not exists public.imago_inventory (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  asset_id text not null,              -- catalog id, e.g. nike_zoom_2k, breastplate_v2
  category text not null,              -- head | torso | legs | feet | armor | instrument | accessory | ...
  metadata jsonb not null default '{}', -- wear_level, custom_colors, inscribed_verses, etc.
  is_equipped boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists imago_inventory_owner_idx on public.imago_inventory (owner_id);
create index if not exists imago_inventory_owner_equipped_idx on public.imago_inventory (owner_id) where is_equipped = true;
create index if not exists imago_inventory_asset_idx on public.imago_inventory (asset_id);

-- ---------------------------------------------------------------------------
-- 2. pro_stick_analytics — session-level skill telemetry (Hoops / Gridiron / Karaoke)
-- ---------------------------------------------------------------------------
create table if not exists public.pro_stick_analytics (
  session_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game_type text not null,             -- hoops | gridiron | karaoke | ...
  accuracy_rating double precision,    -- 0..1 green-release / quality average
  timing_delta double precision,       -- ms off perfect release (signed or absolute per product)
  rhythm_sync double precision,        -- 0..1 alignment to Musician Hub beat
  shot_chart jsonb not null default '[]', -- [{x,y,z,t,kind,outcome}, ...] in 3D/world space
  created_at timestamptz not null default now()
);

create index if not exists pro_stick_analytics_user_idx on public.pro_stick_analytics (user_id, created_at desc);
create index if not exists pro_stick_analytics_game_type_idx on public.pro_stick_analytics (game_type, created_at desc);

-- ---------------------------------------------------------------------------
-- 3. world_influence — Narrow Road + community standing (one row per user)
-- ---------------------------------------------------------------------------
create table if not exists public.world_influence (
  user_id uuid primary key references auth.users (id) on delete cascade,
  influence_points bigint not null default 0,
  aura_type text,                      -- cyan_pulse | gold_shimmer | soft_white | ...
  streak_days integer not null default 0,
  last_coord_x double precision,
  last_coord_y double precision,
  last_coord_z double precision,
  last_world_session_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists world_influence_influence_idx on public.world_influence (influence_points desc);

-- ---------------------------------------------------------------------------
-- 4. shed_room_sessions — live shed / musician rooms + ticketing
-- ---------------------------------------------------------------------------
create table if not exists public.shed_room_sessions (
  room_id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users (id) on delete cascade,
  is_ticketed boolean not null default false,
  entry_fee_seeds bigint not null default 0,
  active_musicians uuid[] not null default '{}', -- user ids currently on mic
  title text,
  is_live boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shed_room_sessions_host_idx on public.shed_room_sessions (host_id);
create index if not exists shed_room_sessions_live_idx on public.shed_room_sessions (is_live) where is_live = true;

-- ---------------------------------------------------------------------------
-- updated_at triggers (reuse if you already have set_updated_at(); else define once)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists imago_inventory_set_updated_at on public.imago_inventory;
create trigger imago_inventory_set_updated_at
  before update on public.imago_inventory
  for each row execute procedure public.set_updated_at();

drop trigger if exists shed_room_sessions_set_updated_at on public.shed_room_sessions;
create trigger shed_room_sessions_set_updated_at
  before update on public.shed_room_sessions
  for each row execute procedure public.set_updated_at();

drop trigger if exists world_influence_set_updated_at on public.world_influence;
create trigger world_influence_set_updated_at
  before update on public.world_influence
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.imago_inventory enable row level security;
alter table public.pro_stick_analytics enable row level security;
alter table public.world_influence enable row level security;
alter table public.shed_room_sessions enable row level security;

-- imago_inventory: owners only
drop policy if exists "imago_inventory_select_own" on public.imago_inventory;
drop policy if exists "imago_inventory_insert_own" on public.imago_inventory;
drop policy if exists "imago_inventory_update_own" on public.imago_inventory;
drop policy if exists "imago_inventory_delete_own" on public.imago_inventory;

create policy "imago_inventory_select_own"
  on public.imago_inventory for select to authenticated
  using (auth.uid() = owner_id);

create policy "imago_inventory_insert_own"
  on public.imago_inventory for insert to authenticated
  with check (auth.uid() = owner_id);

create policy "imago_inventory_update_own"
  on public.imago_inventory for update to authenticated
  using (auth.uid() = owner_id);

create policy "imago_inventory_delete_own"
  on public.imago_inventory for delete to authenticated
  using (auth.uid() = owner_id);

-- pro_stick_analytics: read own; insert own (service role bypasses RLS for admin jobs)
drop policy if exists "pro_stick_select_own" on public.pro_stick_analytics;
drop policy if exists "pro_stick_insert_own" on public.pro_stick_analytics;

create policy "pro_stick_select_own"
  on public.pro_stick_analytics for select to authenticated
  using (auth.uid() = user_id);

create policy "pro_stick_insert_own"
  on public.pro_stick_analytics for insert to authenticated
  with check (auth.uid() = user_id);

-- world_influence: one row per user
drop policy if exists "world_influence_select_own" on public.world_influence;
drop policy if exists "world_influence_insert_own" on public.world_influence;
drop policy if exists "world_influence_update_own" on public.world_influence;

create policy "world_influence_select_own"
  on public.world_influence for select to authenticated
  using (auth.uid() = user_id);

create policy "world_influence_insert_own"
  on public.world_influence for insert to authenticated
  with check (auth.uid() = user_id);

create policy "world_influence_update_own"
  on public.world_influence for update to authenticated
  using (auth.uid() = user_id);

-- shed_room_sessions: discover live rooms; hosts manage their rooms
drop policy if exists "shed_room_select_visible" on public.shed_room_sessions;
drop policy if exists "shed_room_insert_host" on public.shed_room_sessions;
drop policy if exists "shed_room_update_host" on public.shed_room_sessions;
drop policy if exists "shed_room_delete_host" on public.shed_room_sessions;

create policy "shed_room_select_visible"
  on public.shed_room_sessions for select to authenticated
  using (is_live = true or auth.uid() = host_id);

create policy "shed_room_insert_host"
  on public.shed_room_sessions for insert to authenticated
  with check (auth.uid() = host_id);

create policy "shed_room_update_host"
  on public.shed_room_sessions for update to authenticated
  using (auth.uid() = host_id);

create policy "shed_room_delete_host"
  on public.shed_room_sessions for delete to authenticated
  using (auth.uid() = host_id);

-- ---------------------------------------------------------------------------
-- Realtime (Dashboard → Database → Replication)
-- After tables exist, enable for channels used by the client, e.g.:
--
--   alter publication supabase_realtime add table public.pro_stick_analytics;
--   alter publication supabase_realtime add table public.world_influence;
--   alter publication supabase_realtime add table public.shed_room_sessions;
--
-- For INSERT toasts on green releases, subscribe from the client:
--   .channel('game-updates')
--   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pro_stick_analytics' }, handler)
--
-- If filters fail, set REPLICA IDENTITY FULL on hot tables (weigh WAL cost):
--   alter table public.pro_stick_analytics replica identity full;
-- ---------------------------------------------------------------------------

comment on table public.imago_inventory is 'Equipped and owned 3D catalog items for Imago; engine loads GLB by asset_id + metadata.';
comment on table public.pro_stick_analytics is 'Per-session pro-stick / rhythm telemetry; feeds AI comparison and shot charts.';
comment on table public.world_influence is 'Narrow Road influence, aura, streak, last logout position for world resume.';
comment on table public.shed_room_sessions is 'Musician shed rooms: ticketing, seeds fee, active mic roster.';
