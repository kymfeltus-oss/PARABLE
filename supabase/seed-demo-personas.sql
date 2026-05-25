-- Optional: enrich demo personas in Supabase when matching auth users exist.
-- Static demo profiles work without this — see src/lib/demo-personas.ts.
-- Run in Supabase SQL Editor (postgres role). Safe to re-run.

-- Ensure columns exist
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists is_live boolean not null default false;

-- Persona metadata (updates rows where username matches)
-- Avatars use local SVG initials served from /public/demo/avatars — not real photos.
update public.profiles set
  full_name = 'Pastor James Ruiz',
  bio = 'Lead pastor · Dallas · Worship nights every Thursday.',
  role = 'Pastor',
  avatar_url = null,
  is_live = true
where lower(username) = 'pastor_james';

update public.profiles set
  full_name = 'Sarah Mitchell',
  bio = 'Voice · keys · prayer room host.',
  role = 'Worship Leader',
  avatar_url = null,
  is_live = false
where lower(username) = 'sister_sarah';

update public.profiles set
  full_name = 'Gospel Vibe Collective',
  bio = 'Live sessions · new singles · choir collabs.',
  role = 'Gospel Artist',
  avatar_url = null,
  is_live = true
where lower(username) = 'gospel_vibe';

update public.profiles set
  full_name = 'Kingdom Gamer',
  bio = 'Biblical history breakdowns · co-op streams.',
  role = 'Gamer & Creator',
  avatar_url = null,
  is_live = false
where lower(username) = 'kingdom_gamer';

update public.profiles set
  full_name = 'Prophetic Voices',
  bio = 'Intercession · teaching · global prayer rooms.',
  role = 'Clergy',
  avatar_url = null,
  is_live = false
where lower(username) = 'prophetic_voices';

-- Clear stale real-photo or placeholder URLs on known demo handles
update public.profiles set avatar_url = null
where lower(username) in ('pastor_james', 'sister_sarah', 'gospel_vibe', 'kingdom_gamer', 'prophetic_voices')
  and (
    avatar_url ilike '%picsum.photos%'
    or avatar_url ilike '%unsplash%'
    or avatar_url ilike '%supabase.co/storage%'
  );

-- Sample posts for pastor_james (skip if post id already exists)
insert into public.posts (id, profile_id, content, media_url, post_type, created_at)
select
  gen_random_uuid(),
  p.id,
  'Worshipping live tonight in Dallas! Join the feed or grab a pass below. 🙌',
  'https://picsum.photos/seed/parable-pastor_james-1/800/600',
  'image',
  now() - interval '2 hours'
from public.profiles p
where lower(p.username) = 'pastor_james'
  and not exists (
    select 1 from public.posts x
    where x.profile_id = p.id
      and x.content like 'Worshipping live tonight%'
  );

insert into public.posts (id, profile_id, content, media_url, post_type, created_at)
select
  gen_random_uuid(),
  p.id,
  'Late night stream — breaking down Biblical history in HD graphics.',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'video',
  now() - interval '4 hours'
from public.profiles p
where lower(p.username) = 'kingdom_gamer'
  and not exists (
    select 1 from public.posts x
    where x.profile_id = p.id
      and x.content like 'Late night stream%'
  );

notify pgrst, 'reload schema';
