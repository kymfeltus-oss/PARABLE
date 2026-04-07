-- PARABLE "Vault" schema sketch: authoritative gaming + Imago metadata.
-- Review RLS policies before applying in production. Run in Supabase SQL editor when ready.
-- See also: schema-gaming-2026.sql (inventory, pro-stick analytics, world influence, shed rooms).

-- ---------------------------------------------------------------------------
-- Imago / 3D presence (extends profiles conceptually; can merge into profiles JSON)
-- ---------------------------------------------------------------------------
create table if not exists public.imago_assets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  glb_url text,                 -- Storage path or CDN URL for rigged avatar
  thumbnail_url text,
  height_scale real default 1,
  metadata jsonb default '{}',  -- blend shapes, skin tone ids, etc.
  updated_at timestamptz default now()
);

create index if not exists imago_assets_profile_id_idx on public.imago_assets (profile_id);

-- ---------------------------------------------------------------------------
-- Session / loadout snapshot (hydrate engine on join)
-- ---------------------------------------------------------------------------
create table if not exists public.game_states (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  mode text not null default 'sanctuary',  -- narrow_road, hoops, gridiron, ...
  state jsonb not null default '{}',       -- loadout, stamina snapshot, lobby id
  version int not null default 1,
  updated_at timestamptz default now(),
  unique (profile_id, mode)
);

create index if not exists game_states_profile_idx on public.game_states (profile_id);

-- ---------------------------------------------------------------------------
-- Activity stream for "Live Personnel" / sidebar (low-frequency events only)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  profile_id uuid references public.profiles (id) on delete set null,
  kind text not null,              -- online, in_match, in_studio, ...
  payload jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists activity_log_created_idx on public.activity_log (created_at desc);
create index if not exists activity_log_profile_idx on public.activity_log (profile_id);

-- ---------------------------------------------------------------------------
-- Match history + analytics (post-game sync; not per-frame)
-- ---------------------------------------------------------------------------
create table if not exists public.match_history (
  id uuid primary key default gen_random_uuid(),
  mode text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  participants uuid[] default '{}',
  result jsonb not null default '{}',  -- shot chart, pass accuracy, XP earned
  created_at timestamptz default now()
);

create index if not exists match_history_started_idx on public.match_history (started_at desc);

-- ---------------------------------------------------------------------------
-- RLS placeholders (tighten per product rules)
-- ---------------------------------------------------------------------------
alter table public.imago_assets enable row level security;
alter table public.game_states enable row level security;
alter table public.activity_log enable row level security;
alter table public.match_history enable row level security;

-- Example policies (uncomment & adjust):
-- create policy "imago_owner" on public.imago_assets for all using (auth.uid() = profile_id);
-- create policy "game_state_owner" on public.game_states for all using (auth.uid() = profile_id);
