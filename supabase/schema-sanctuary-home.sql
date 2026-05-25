-- Optional sanctuary home events catalog (run after profiles exist).
-- Logical alias: sanctuary_events in docs/SANCTUARY_HOME_FEED_SPEC.md

create table if not exists public.sanctuary_events (
  id text primary key,
  host_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text not null default '',
  cover_image_url text,
  scheduled_for timestamptz not null default now(),
  ticket_price numeric(10, 2) not null default 0,
  requires_registration boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sanctuary_events enable row level security;

drop policy if exists "Authenticated can read sanctuary_events" on public.sanctuary_events;
create policy "Authenticated can read sanctuary_events"
  on public.sanctuary_events for select to authenticated
  using (true);

-- Seed rows matching demo event ids (safe to re-run)
insert into public.sanctuary_events (id, title, description, cover_image_url, scheduled_for, ticket_price, requires_registration)
values
  (
    'demo-event-1',
    'Global Prophetic Summit 2026',
    'Immersive online live event with session token validation. Full AV processing and digital download materials included.',
    'https://picsum.photos/seed/parable-summit/600/280',
    now() + interval '6 hours',
    25.00,
    true
  ),
  (
    'demo-event-2',
    'Interactive Ministry Masterclass',
    'Strategy roundtable on media integration workflows and broadcast distribution for ministries.',
    'https://picsum.photos/seed/parable-masterclass/600/280',
    now() + interval '3 days',
    0.00,
    true
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  cover_image_url = excluded.cover_image_url,
  scheduled_for = excluded.scheduled_for,
  ticket_price = excluded.ticket_price;

notify pgrst, 'reload schema';
