-- Run once if selects fail: column "is_live" does not exist on profiles.
alter table public.profiles add column if not exists is_live boolean not null default false;
