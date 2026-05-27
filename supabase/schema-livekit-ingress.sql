-- OBS / RTMP ingress: map LiveKit stream key → creator profile for webhook is_live toggles.
-- Apply in Supabase SQL Editor, then configure LiveKit Cloud → Webhooks → POST /api/livekit/webhook

alter table public.profiles
  add column if not exists livekit_ingress_stream_key text;

create unique index if not exists profiles_livekit_ingress_stream_key_uidx
  on public.profiles (livekit_ingress_stream_key)
  where livekit_ingress_stream_key is not null;

comment on column public.profiles.livekit_ingress_stream_key is
  'LiveKit Ingress stream key from OBS; matched by /api/livekit/webhook on ingress_started / ingress_ended.';
