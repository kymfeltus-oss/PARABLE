-- PARABLE: Run this once in Supabase SQL Editor after creating your project.
-- Sets up: profiles (for sign-in/account), study_groups + study_group_members (for The Table).

-- ========== PROFILES (for auth / create account) ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  full_name text,
  avatar_url text,
  role text,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

-- Users can insert their own profile (e.g. on signup)
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id);

-- ========== STUDY GROUPS (The Table) ==========
create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  host_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.study_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('host', 'member')) default 'member',
  created_at timestamptz not null default now(),
  unique(group_id, user_id)
);

create index if not exists study_group_members_group_id on public.study_group_members(group_id);
create index if not exists study_group_members_user_id on public.study_group_members(user_id);
create index if not exists study_groups_host_id on public.study_groups(host_id);

alter table public.study_groups enable row level security;
alter table public.study_group_members enable row level security;

create policy "Users can create study groups"
  on public.study_groups for insert to authenticated
  with check (auth.uid() = host_id);

create policy "Members can read their groups"
  on public.study_groups for select to authenticated
  using (
    exists (
      select 1 from public.study_group_members m
      where m.group_id = study_groups.id and m.user_id = auth.uid()
    )
  );

create policy "Host can update study group"
  on public.study_groups for update to authenticated
  using (auth.uid() = host_id);

create policy "Host can delete study group"
  on public.study_groups for delete to authenticated
  using (auth.uid() = host_id);

create policy "Host can insert members"
  on public.study_group_members for insert to authenticated
  with check (
    exists (
      select 1 from public.study_groups g
      where g.id = group_id and g.host_id = auth.uid()
    )
  );

create policy "Users can join as member"
  on public.study_group_members for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Members can read group members"
  on public.study_group_members for select to authenticated
  using (
    exists (
      select 1 from public.study_group_members m2
      where m2.group_id = study_group_members.group_id and m2.user_id = auth.uid()
    )
  );

create policy "Host can delete members"
  on public.study_group_members for delete to authenticated
  using (
    exists (
      select 1 from public.study_groups g
      where g.id = group_id and g.host_id = auth.uid()
    )
  );
