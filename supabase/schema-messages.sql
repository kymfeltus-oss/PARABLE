-- Direct messaging: conversations, participants, messages, reactions.
-- Enable tables in Supabase Dashboard → Database → Replication (Realtime).
-- Applied to Supabase project rmerwwmamddqrqtxvkrx (migration: direct_messages_conversations).
-- If upgrading from legacy public.messages (sender_id/receiver_id), run:
--   DROP TABLE IF EXISTS public.messages CASCADE;
-- before this script on fresh databases that still have the old table.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_participants_user_id_idx
  on public.conversation_participants (user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  post_id uuid references public.posts (id) on delete set null,
  client_temp_id text,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at desc);

create index if not exists messages_sender_id_idx on public.messages (sender_id);

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;

-- Membership check bypasses RLS to avoid circular policies on conversation_participants.
create or replace function public.is_conversation_member(conv_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conv_id
      and cp.user_id = auth.uid()
  );
$$;

revoke all on function public.is_conversation_member(uuid) from public;
grant execute on function public.is_conversation_member(uuid) to authenticated;

-- Participants can read their conversations
drop policy if exists "Participants read conversations" on public.conversations;
create policy "Participants read conversations"
  on public.conversations for select to authenticated
  using (public.is_conversation_member(id));

drop policy if exists "Authenticated create conversations" on public.conversations;
create policy "Authenticated create conversations"
  on public.conversations for insert to authenticated
  with check (true);

drop policy if exists "Participants read conversation_participants" on public.conversation_participants;
create policy "Participants read conversation_participants"
  on public.conversation_participants for select to authenticated
  using (public.is_conversation_member(conversation_id));

drop policy if exists "Authenticated insert conversation_participants" on public.conversation_participants;
create policy "Authenticated insert conversation_participants"
  on public.conversation_participants for insert to authenticated
  with check (true);

drop policy if exists "Users update own participant row" on public.conversation_participants;
create policy "Users update own participant row"
  on public.conversation_participants for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Participants read messages" on public.messages;
create policy "Participants read messages"
  on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id));

drop policy if exists "Participants insert own messages" on public.messages;
create policy "Participants insert own messages"
  on public.messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and public.is_conversation_member(conversation_id)
  );

drop policy if exists "Senders delete own messages" on public.messages;
create policy "Senders delete own messages"
  on public.messages for delete to authenticated
  using (auth.uid() = sender_id);

drop policy if exists "Participants read message_reactions" on public.message_reactions;
create policy "Participants read message_reactions"
  on public.message_reactions for select to authenticated
  using (
    exists (
      select 1
      from public.messages m
      where m.id = message_reactions.message_id
        and public.is_conversation_member(m.conversation_id)
    )
  );

drop policy if exists "Users upsert own reactions" on public.message_reactions;
create policy "Users upsert own reactions"
  on public.message_reactions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own reactions" on public.message_reactions;
create policy "Users update own reactions"
  on public.message_reactions for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own reactions" on public.message_reactions;
create policy "Users delete own reactions"
  on public.message_reactions for delete to authenticated
  using (auth.uid() = user_id);

create or replace function public.touch_conversation_updated_at()
returns trigger
language plpgsql
as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_updated_at();

create or replace function public.find_or_create_dm_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  conv_id uuid;
  me uuid := auth.uid();
begin
  if me is null or other_user_id is null or me = other_user_id then
    raise exception 'invalid participants';
  end if;

  select cp1.conversation_id into conv_id
  from public.conversation_participants cp1
  join public.conversation_participants cp2
    on cp1.conversation_id = cp2.conversation_id
  where cp1.user_id = me and cp2.user_id = other_user_id
  limit 1;

  if conv_id is not null then
    return conv_id;
  end if;

  insert into public.conversations default values returning id into conv_id;
  insert into public.conversation_participants (conversation_id, user_id)
  values (conv_id, me), (conv_id, other_user_id);
  return conv_id;
end;
$$;

revoke all on function public.find_or_create_dm_conversation(uuid) from public;
grant execute on function public.find_or_create_dm_conversation(uuid) to authenticated;

create or replace function public.mark_dm_delivered(message_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.messages
  set delivered_at = coalesce(delivered_at, now())
  where id = message_id
    and sender_id <> auth.uid()
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    );
end;
$$;

grant execute on function public.mark_dm_delivered(uuid) to authenticated;

create or replace function public.mark_dm_conversation_read(conv_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id and user_id = auth.uid()
  ) then
    return;
  end if;

  update public.messages
  set read_at = coalesce(read_at, now())
  where conversation_id = conv_id
    and sender_id <> auth.uid()
    and read_at is null;

  update public.conversation_participants
  set last_read_at = now()
  where conversation_id = conv_id and user_id = auth.uid();
end;
$$;

grant execute on function public.mark_dm_conversation_read(uuid) to authenticated;

-- alter publication supabase_realtime add table public.messages;
-- alter publication supabase_realtime add table public.message_reactions;
