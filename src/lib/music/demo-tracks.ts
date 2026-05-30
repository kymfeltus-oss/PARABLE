import type { PostAudioTrack } from "@/lib/sanctuary-post-interactions";
import type { Track } from "@/lib/music/types";

/** Short CC0 sample for demo playback when no asset URL is on the post. */
const DEFAULT_DEMO_AUDIO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=256&h=256&fit=crop";

export const MUSIC_HUB_DEMO_TRACK: Track = {
  id: "sanctuary-session",
  title: "Sanctuary session (demo)",
  artist: "PARABLE Residency",
  audioUrl: DEFAULT_DEMO_AUDIO_URL,
  coverUrl: DEFAULT_COVER,
  duration: 2,
};

const TRACK_BY_AUDIO_ID: Record<string, Track> = {
  "audio-worship-1": {
    id: "audio-worship-1",
    title: "Worship loop — demo",
    artist: "Voices of Praise",
    audioUrl: DEFAULT_DEMO_AUDIO_URL,
    coverUrl: DEFAULT_COVER,
    duration: 2,
  },
};

export function trackFromPostAudio(audio: PostAudioTrack): Track {
  return (
    TRACK_BY_AUDIO_ID[audio.id] ?? {
      id: audio.id,
      title: audio.title,
      artist: "PARABLE",
      audioUrl: DEFAULT_DEMO_AUDIO_URL,
      coverUrl: DEFAULT_COVER,
      duration: 0,
    }
  );
}
