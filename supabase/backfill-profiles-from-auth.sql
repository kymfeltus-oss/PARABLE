-- Run once in Supabase SQL Editor (postgres role) if users exist in auth.users but have no public.profiles row.
-- Discover / follow suggestions only read from public.profiles — Auth-only users will not appear until they have a row.

insert into public.profiles (id, username, full_name, onboarding_complete)
select
  au.id,
  coalesce(
    nullif(trim(au.raw_user_meta_data->>'username'), ''),
    split_part(au.email, '@', 1),
    'user'
  ),
  coalesce(nullif(trim(au.raw_user_meta_data->>'full_name'), ''), ''),
  true
from auth.users au
where not exists (select 1 from public.profiles p where p.id = au.id)
on conflict (id) do nothing;
