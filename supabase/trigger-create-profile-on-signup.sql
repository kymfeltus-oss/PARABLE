-- Optional: auto-create public.profiles when a new auth.users row is inserted (future signups).
-- Run in Supabase SQL Editor once. Adjust columns if your profiles table differs.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, onboarding_complete)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'username'), ''),
      split_part(new.email, '@', 1),
      'user'
    ),
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), ''),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
