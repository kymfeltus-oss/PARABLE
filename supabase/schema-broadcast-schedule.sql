-- Broadcast schedule calendar + Stripe Connect profile column.
-- Run in Supabase SQL editor after profiles exist.

alter table public.profiles
  add column if not exists stripe_connect_id text;

create unique index if not exists profiles_stripe_connect_id_idx
  on public.profiles (stripe_connect_id)
  where stripe_connect_id is not null;

create table if not exists public.broadcast_schedule (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  scheduled_start timestamptz not null,
  estimated_duration_mins integer not null default 60 check (estimated_duration_mins > 0),
  created_at timestamptz not null default now()
);

create index if not exists broadcast_schedule_start_idx
  on public.broadcast_schedule (scheduled_start asc);

alter table public.broadcast_schedule enable row level security;

drop policy if exists "broadcast_schedule_public_read" on public.broadcast_schedule;
create policy "broadcast_schedule_public_read"
  on public.broadcast_schedule for select
  to authenticated, anon
  using (true);

drop policy if exists "broadcast_schedule_manage_own" on public.broadcast_schedule;
create policy "broadcast_schedule_manage_own"
  on public.broadcast_schedule for all
  to authenticated
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

comment on table public.broadcast_schedule is 'Upcoming live broadcast reservations for the shared calendar.';
comment on column public.profiles.stripe_connect_id is 'Stripe Connect Express account id for creator payouts.';
