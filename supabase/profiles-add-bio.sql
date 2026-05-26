-- Run once if profile bio updates fail: column "bio" does not exist on profiles.
alter table public.profiles add column if not exists bio text;

notify pgrst, 'reload schema';
