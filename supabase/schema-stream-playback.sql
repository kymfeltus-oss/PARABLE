-- Optional Amazon IVS playback URL for high-scale CDN watch (LiveKit remains failover).
-- Run in Supabase SQL editor after profiles exist.

alter table public.profiles
  add column if not exists amazon_ivs_playback_url text;

comment on column public.profiles.amazon_ivs_playback_url is
  'Amazon IVS playback URL (HLS). When set, /watch uses IVS first; LiveKit WebRTC is failover.';
