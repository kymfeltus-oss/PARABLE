-- Fix PostgREST embed: profiles:profile_id on posts (My Sanctuary feed).
-- Requires posts.profile_id -> profiles.id FK and a profiles row for each referenced author.

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists is_live boolean not null default false;
alter table public.profiles add column if not exists bio text;

update public.profiles
set full_name = coalesce(full_name, display_name)
where full_name is null and display_name is not null;

-- Backfill profile for auth user referenced by existing posts (orphan profile_id).
insert into public.profiles (id, username, display_name, full_name, avatar_url, role, is_live, updated_at)
values (
  'a8ed83de-2249-44fd-a980-3112105dd1ed',
  'kym_feltus',
  'Kym Feltus',
  'Kym Feltus',
  null,
  'Member',
  false,
  now()
)
on conflict (id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  full_name = excluded.full_name,
  updated_at = now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'posts_profile_id_fkey'
  ) then
    alter table public.posts
      add constraint posts_profile_id_fkey
      foreign key (profile_id) references public.profiles (id) on delete set null;
  end if;
end $$;

drop policy if exists "Public read profiles for feed" on public.profiles;
create policy "Public read profiles for feed"
  on public.profiles for select
  to anon, authenticated
  using (true);

notify pgrst, 'reload schema';
