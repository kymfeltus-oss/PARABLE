-- Stream discipline actions (timeouts / bans) for Live Studio moderation panel.
-- Run in Supabase SQL editor after profiles exist.

create table if not exists public.stream_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  streamer_id uuid not null references public.profiles (id) on delete cascade,
  target_user_id uuid not null references public.profiles (id) on delete cascade,
  action_type text not null check (action_type in ('TIMEOUT', 'BAN')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists stream_moderation_actions_streamer_idx
  on public.stream_moderation_actions (streamer_id, created_at desc);

alter table public.stream_moderation_actions enable row level security;

drop policy if exists "stream_moderation_insert_own" on public.stream_moderation_actions;
create policy "stream_moderation_insert_own"
  on public.stream_moderation_actions for insert
  to authenticated
  with check (streamer_id = auth.uid());

drop policy if exists "stream_moderation_read_own" on public.stream_moderation_actions;
create policy "stream_moderation_read_own"
  on public.stream_moderation_actions for select
  to authenticated
  using (streamer_id = auth.uid());

grant select, insert on public.stream_moderation_actions to authenticated;

comment on table public.stream_moderation_actions is 'Creator-issued timeouts and bans from Live Studio discipline panel.';
