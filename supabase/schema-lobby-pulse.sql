-- Lobby Pulse: aggregate “energy” from recent praises for Streamer Command Center.
-- Optional: scope to a creator’s posts (their `posts.profile_id`).
-- Run after `posts` and `post_likes` exist (`schema-post-likes-comments.sql`).

create or replace function public.get_lobby_pulse(p_creator_id uuid default null)
returns table (
  sentiment double precision,
  recent_praises bigint,
  energy_label text
)
language sql
stable
security definer
set search_path = public
as $$
  with recent as (
    select count(*)::bigint as c
    from public.post_likes pl
    inner join public.posts po on po.id = pl.post_id
    where pl.created_at > now() - interval '15 minutes'
      and (p_creator_id is null or po.profile_id = p_creator_id)
  ),
  raw as (
    select
      (select c from recent) as cnt,
      -- Map count → 0..1: calm when few praises, asymptotic cap for spikes
      least(
        1::double precision,
        greatest(
          0::double precision,
          0.08 + (ln(greatest((select c from recent)::numeric, 1::numeric)) * 0.22)
        )
      ) as sentiment_val
  )
  select
    raw.sentiment_val::double precision as sentiment,
    (select c from recent) as recent_praises,
    case
      when raw.sentiment_val < 0.28 then 'Calm'
      when raw.sentiment_val < 0.55 then 'Warming'
      when raw.sentiment_val < 0.78 then 'Elevated'
      else 'High energy'
    end::text as energy_label
  from raw;
$$;

grant execute on function public.get_lobby_pulse(uuid) to authenticated;

comment on function public.get_lobby_pulse(uuid) is
  'Returns sentiment 0..1 + label for lobby pulse UI; pass creator profile id to scope to their posts.';
