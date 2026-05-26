-- Global ticker pulse for `GlobalPulseTicker` — `supabase.rpc('get_global_pulse')`.
-- Run in SQL Editor; enable if you use strict search_path.

create or replace function public.get_global_pulse()
returns table (
  pulse_score double precision,
  recent_keywords text[]
)
language sql
stable
security definer
set search_path = public
as $$
  with recent as (
    select count(*)::bigint as c
    from public.post_likes
    where created_at > now() - interval '20 minutes'
  ),
  score_row as (
    select
      greatest(
        0::double precision,
        0.08 + (ln(greatest((select c from recent)::numeric, 1::numeric)) * 0.24)
      ) as v
  )
  select
    -- Allow values above 1.0 when activity spikes (Command Center cyan glow uses pulse_score > 1.0)
    least(1.45::double precision, (select v from score_row) * 1.22)::double precision as pulse_score,
    array['PRAISE', 'SANCTUARY', 'WORSHIP', 'AMEN', 'HOPE', 'REVIVAL']::text[] as recent_keywords;
$$;

grant execute on function public.get_global_pulse() to anon;
grant execute on function public.get_global_pulse() to authenticated;

comment on function public.get_global_pulse() is 'Single-row pulse score + keyword strip for the global header ticker.';
