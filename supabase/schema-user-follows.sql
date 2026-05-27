-- Unified follow graph for live alerts + social counts (stream hybrid profile).
-- Run after public.profiles exists. Safe to re-run.

create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (sender_id, target_id),
  constraint user_follows_no_self check (sender_id <> target_id)
);

create index if not exists user_follows_sender_id_idx on public.user_follows (sender_id);
create index if not exists user_follows_target_id_idx on public.user_follows (target_id);

alter table public.user_follows enable row level security;

drop policy if exists "Follow references are readable by anyone" on public.user_follows;
create policy "Follow references are readable by anyone"
  on public.user_follows for select
  using (true);

drop policy if exists "Authenticated profiles can process follow writes" on public.user_follows;
create policy "Authenticated profiles can process follow writes"
  on public.user_follows for insert
  to authenticated
  with check (auth.uid() = sender_id);

drop policy if exists "Users can remove their own follow nodes" on public.user_follows;
create policy "Users can remove their own follow nodes"
  on public.user_follows for delete
  to authenticated
  using (auth.uid() = sender_id);

notify pgrst, 'reload schema';
