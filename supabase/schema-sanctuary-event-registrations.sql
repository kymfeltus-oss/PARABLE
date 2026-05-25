-- Ticketed sanctuary events — run in Supabase SQL Editor after auth.users exists.
create table if not exists public.sanctuary_event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  ticket_price numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists sanctuary_event_registrations_user_idx
  on public.sanctuary_event_registrations (user_id);

alter table public.sanctuary_event_registrations enable row level security;

drop policy if exists "Users read own event registrations" on public.sanctuary_event_registrations;
create policy "Users read own event registrations"
  on public.sanctuary_event_registrations for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own event registrations" on public.sanctuary_event_registrations;
create policy "Users insert own event registrations"
  on public.sanctuary_event_registrations for insert to authenticated
  with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
