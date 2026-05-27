-- Refresh PostgREST FK cache for posts.profile_id -> profiles.id (useFeed embed).
alter table public.posts drop constraint if exists posts_profile_id_fkey;

alter table public.posts
  add constraint posts_profile_id_fkey
  foreign key (profile_id) references public.profiles (id) on delete set null;

notify pgrst, 'reload schema';
