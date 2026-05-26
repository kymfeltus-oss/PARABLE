-- Run once if the feed select fails: column "status_text" does not exist on profiles.
alter table public.profiles add column if not exists status_text text;
