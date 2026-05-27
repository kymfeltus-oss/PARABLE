-- Live discovery columns for Kick-style home directory (profiles table).
-- Safe to re-run. Apply before wiring /streamers live directory queries.

alter table public.profiles
  add column if not exists is_live boolean not null default false;

alter table public.profiles
  add column if not exists current_category text;

alter table public.profiles
  add column if not exists viewer_count integer not null default 0;

comment on column public.profiles.current_category is
  'Display category on discovery hub (e.g. Just Chatting, Worship).';

comment on column public.profiles.viewer_count is
  'Approximate concurrent viewers; updated by edge worker or periodic poll.';

create index if not exists profiles_is_live_viewer_count_idx
  on public.profiles (is_live, viewer_count desc)
  where is_live = true;

-- Optional: enable Realtime on profiles for LIVE ring updates (Dashboard → Replication).
-- alter publication supabase_realtime add table public.profiles;
