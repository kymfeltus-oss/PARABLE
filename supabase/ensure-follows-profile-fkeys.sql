-- Ensure PostgREST can embed profiles from follows (KickFollowingSection / feed).
-- Run in Supabase SQL Editor, then: Settings → API → Reload schema (or wait ~1 min).

alter table public.follows
  drop constraint if exists follows_following_id_fkey,
  add constraint follows_following_id_fkey
    foreign key (following_id) references public.profiles (id) on delete cascade;

alter table public.follows
  drop constraint if exists follows_follower_id_fkey,
  add constraint follows_follower_id_fkey
    foreign key (follower_id) references public.profiles (id) on delete cascade;

notify pgrst, 'reload schema';
