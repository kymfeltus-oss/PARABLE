-- In-app notifications (praises, comments, follows). Run in Supabase SQL Editor after `profiles` / `posts` exist.
-- Dashboard → Database → Replication → enable `notifications` for Realtime (INSERT).

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  post_id uuid references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint notifications_type_check check (type in ('like', 'comment', 'follow'))
);

create index if not exists notifications_receiver_id_idx on public.notifications (receiver_id);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Receivers can read own notifications" on public.notifications;
create policy "Receivers can read own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = receiver_id);

-- App UI subscribes via Realtime; rows are typically inserted by triggers or edge functions.
-- Optional: allow senders to insert (tighten in production with triggers only):
drop policy if exists "System insert via service role only placeholder" on public.notifications;
-- Uncomment and use a SECURITY DEFINER trigger instead of direct client inserts in production.

comment on table public.notifications is 'Fan-out notification rows; client shows toast on INSERT for receiver_id = auth.uid().';

-- Example: notify post author when someone praises a post (`posts.profile_id` is the owner in PARABLE):
-- create or replace function public.notify_on_post_like()
-- returns trigger as $$
-- declare post_owner uuid;
-- begin
--   select profile_id into post_owner from public.posts where id = new.post_id;
--   if post_owner is null or post_owner = new.user_id then return new; end if;
--   insert into public.notifications (receiver_id, sender_id, type, post_id)
--   values (post_owner, new.user_id, 'like', new.post_id);
--   return new;
-- end;
-- $$ language plpgsql security definer set search_path = public;

-- alter publication supabase_realtime add table public.notifications;
