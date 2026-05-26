-- Your project already has public.profiles (e.g. id, email, full_name, bio, role, avatar_url).
-- PARABLE’s app expects these extra columns for sign-up, Discover ordering, and upserts.
-- Run once in Supabase SQL Editor. Safe to re-run (IF NOT EXISTS).

alter table public.profiles
  add column if not exists username text,
  add column if not exists onboarding_complete boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Optional: derive username from email for existing rows (skip if email is null)
update public.profiles
set username = lower(
  regexp_replace(
    coalesce(nullif(trim(split_part(email, '@', 1)), ''), 'member'),
    '[^a-z0-9_-]',
    '',
    'g'
  )
)
where (username is null or trim(username) = '')
  and email is not null
  and trim(email) <> '';

-- Rows still missing username (no email on file)
update public.profiles
set username = 'user-' || left(replace(id::text, '-', ''), 12)
where username is null or trim(username) = '';

notify pgrst, 'reload schema';
