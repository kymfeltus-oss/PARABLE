-- Per-stream live chat log (Kick-style right rail persistence).
-- Enable table in Supabase Dashboard → Database → Replication (Realtime) after apply.

create table if not exists public.stream_chat_messages (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null references public.profiles (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  display_name text not null,
  body text not null,
  client_temp_id text,
  created_at timestamptz not null default now()
);

create index if not exists stream_chat_messages_stream_created_idx
  on public.stream_chat_messages (stream_id, created_at desc);

create index if not exists stream_chat_messages_sender_idx
  on public.stream_chat_messages (sender_id);

alter table public.stream_chat_messages enable row level security;

-- Anyone authenticated can read messages for a stream (public watch rooms).
drop policy if exists "Authenticated read stream chat" on public.stream_chat_messages;
create policy "Authenticated read stream chat"
  on public.stream_chat_messages for select to authenticated
  using (true);

-- Send only as self; stream_id must reference an existing profile.
drop policy if exists "Authenticated insert own stream chat" on public.stream_chat_messages;
create policy "Authenticated insert own stream chat"
  on public.stream_chat_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = stream_id)
  );

-- Service role / moderators: add DELETE policy separately if needed.

grant select, insert on public.stream_chat_messages to authenticated;
