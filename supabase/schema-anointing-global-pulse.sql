-- PARABLE: anointing_level for aura UI + optional Realtime on posts for Global Pulse.
-- Run once in Supabase SQL Editor.

alter table public.profiles
  add column if not exists anointing_level integer not null default 1;

comment on column public.profiles.anointing_level is 'Spiritual progression tier; >1 enables neon aura on avatar.';

-- Realtime: allow clients to subscribe to new rows on `posts` for Global Signal / Glory Sparks.
-- In Dashboard: Database → Replication → enable `posts` for Realtime, OR:
-- alter publication supabase_realtime add table public.posts;
-- (Only if `posts` exists and you want INSERT broadcasts to all subscribers.)
