-- REQUIRED for Discover / "People on Parable" — run in Supabase SQL Editor once per project.
-- Without this, RLS only allows SELECT where auth.uid() = id, so listing *other* profiles
-- returns zero rows (no error). Symptom: Table Editor shows multiple profiles, app shows none.

drop policy if exists "Authenticated can read profiles for discovery" on public.profiles;

create policy "Authenticated can read profiles for discovery"
  on public.profiles for select
  to authenticated
  using (true);

-- Note: This exposes id, username, full_name, avatar_url, etc. to any signed-in user.
-- For stricter privacy later, narrow columns via a view or separate public_profiles table.
