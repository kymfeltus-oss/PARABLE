-- Fix: follow insert error "record \"new\" has no field \"profile_id\""
--
-- Cause: A trigger on `public.follows` runs a function that uses NEW.profile_id.
-- PARABLE's `follows` table uses follower_id + following_id only (see schema-follows.sql).
--
-- Run this in Supabase → SQL Editor (postgres). Inspect first if you rely on custom triggers.

-- 1) See what is attached to `follows` (optional; read-only)
-- select tgname, pg_get_triggerdef(t.oid) as definition
-- from pg_trigger t
-- where t.tgrelid = 'public.follows'::regclass and not t.tgisinternal;

-- 2) Drop every non-internal trigger on public.follows so broken functions stop firing.
--    Recreate only what you need from the block in section 4 below.
do $$
declare
  r record;
begin
  for r in
    select tgname
    from pg_trigger
    where tgrelid = 'public.follows'::regclass
      and not tgisinternal
  loop
    execute format('drop trigger if exists %I on public.follows', r.tgname);
  end loop;
end $$;

-- 3) If you copied a broken notify function, drop it when the name matches:
drop function if exists public.notify_on_follow() cascade;
drop function if exists public.handle_new_follow() cascade;
drop function if exists public.on_follow_insert() cascade;

-- 4) Optional: correct follow → notifications row (requires public.notifications from schema-notifications.sql)
create or replace function public.notify_on_follow_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'notifications'
  ) then
    insert into public.notifications (receiver_id, sender_id, type, post_id)
    values (new.following_id, new.follower_id, 'follow', null);
  end if;
  return new;
end;
$$;

drop trigger if exists follows_notify_after_insert on public.follows;
create trigger follows_notify_after_insert
  after insert on public.follows
  for each row
  execute procedure public.notify_on_follow_insert();
