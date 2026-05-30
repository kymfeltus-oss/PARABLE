export interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  duration: number;
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  playbackPosition: number;
  queue: Track[];
}

export type MusicAction =
  | { type: "SET_TRACK"; payload: Track }
  | { type: "TOGGLE_PLAY" }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "UPDATE_POSITION"; payload: number }
  | { type: "SET_QUEUE"; payload: Track[] }
  | { type: "NEXT_TRACK" }
  | { type: "PREV_TRACK" };
