-- Run this in Supabase SQL Editor to enable The Table (study groups).
-- Requires auth.users (Supabase Auth).

-- Study groups: host and metadata
create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  host_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Membership and role
create table if not exists public.study_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('host', 'member')) default 'member',
  created_at timestamptz not null default now(),
  unique(group_id, user_id)
);

-- Indexes
create index if not exists study_group_members_group_id on public.study_group_members(group_id);
create index if not exists study_group_members_user_id on public.study_group_members(user_id);
create index if not exists study_groups_host_id on public.study_groups(host_id);

-- RLS
alter table public.study_groups enable row level security;
alter table public.study_group_members enable row level security;

-- Anyone authenticated can create a group
create policy "Users can create study groups"
  on public.study_groups for insert
  to authenticated
  with check (auth.uid() = host_id);

-- Users can read groups they belong to (via members join)
create policy "Members can read their groups"
  on public.study_groups for select
  to authenticated
  using (
    exists (
      select 1 from public.study_group_members m
      where m.group_id = study_groups.id and m.user_id = auth.uid()
    )
  );

-- Host can update/delete their group
create policy "Host can update study group"
  on public.study_groups for update
  to authenticated
  using (auth.uid() = host_id);

create policy "Host can delete study group"
  on public.study_groups for delete
  to authenticated
  using (auth.uid() = host_id);

-- Members: host can add members; users can read members of their groups
create policy "Host can insert members"
  on public.study_group_members for insert
  to authenticated
  with check (
    exists (
      select 1 from public.study_groups g
      where g.id = group_id and g.host_id = auth.uid()
    )
  );

-- User can add themselves as member (e.g. join via invite link – optional)
create policy "Users can join as member"
  on public.study_group_members for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Members can read group members"
  on public.study_group_members for select
  to authenticated
  using (
    exists (
      select 1 from public.study_group_members m2
      where m2.group_id = study_group_members.group_id and m2.user_id = auth.uid()
    )
  );

create policy "Host can delete members"
  on public.study_group_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.study_groups g
      where g.id = group_id and g.host_id = auth.uid()
    )
  );
