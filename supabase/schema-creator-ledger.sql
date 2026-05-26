-- Creator wallet ledger for coin purchases, gifts, and payout auditing.
-- Run in Supabase SQL editor after profiles exist.

create table if not exists public.creator_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  amount_cents integer not null,
  coin_amount integer not null default 0,
  source_type text not null,
  reference_id text unique,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists creator_ledger_entries_creator_id_idx
  on public.creator_ledger_entries (creator_id, created_at desc);

alter table public.creator_ledger_entries enable row level security;

drop policy if exists "creator_ledger_read_own" on public.creator_ledger_entries;
create policy "creator_ledger_read_own"
  on public.creator_ledger_entries for select
  to authenticated
  using (auth.uid() = creator_id);

comment on table public.creator_ledger_entries is 'Audited wallet ledger for coin purchases and creator earnings.';
