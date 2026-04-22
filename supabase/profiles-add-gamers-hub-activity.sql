-- Optional: cross-app presence for Gamers Hub member list + voice channel sync.
-- Run in Supabase SQL Editor when ready.

alter table public.profiles add column if not exists playing_minecraft boolean not null default false;
alter table public.profiles add column if not exists in_gaming_vc boolean not null default false;

comment on column public.profiles.playing_minecraft is 'User marked in-game on the Parable Minecraft realm (or wired from Godlike later).';
comment on column public.profiles.in_gaming_vc is 'Set true while connected to LiveKit Gaming-Lobby from the app.';
