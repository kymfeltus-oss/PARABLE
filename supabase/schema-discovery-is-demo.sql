-- Discovery weighting: distinguish real creators from seeded demo personas.
-- Apply before weighted /api/streamers backfill (is_demo=false first, then is_demo=true).

alter table public.profiles
  add column if not exists is_demo boolean not null default false;

comment on column public.profiles.is_demo is
  'When true, profile is a seeded/demo persona used for discovery backfill only.';

create index if not exists profiles_discovery_live_idx
  on public.profiles (is_live, is_demo, viewer_count desc)
  where is_live = true;

-- Mark known simulation usernames (see supabase/seed-demo-personas.sql + src/lib/demo-personas.ts)
update public.profiles
set is_demo = true
where lower(username) in (
  'pastor_james',
  'sister_sarah',
  'gospel_vibe',
  'kingdom_gamer',
  'prophetic_voices'
);
