-- Run once if your `profiles` table was created from schema-profiles-and-groups.sql
-- without a `role` column. The app stores signup callings here.

alter table public.profiles add column if not exists role text;
