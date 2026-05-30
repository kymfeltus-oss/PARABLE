import type { MusicAction, PlaybackState } from "@/lib/music/types";

export const initialPlaybackState: PlaybackState = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.85,
  playbackPosition: 0,
  queue: [],
};

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function trackIndex(queue: PlaybackState["queue"], trackId: string | undefined): number {
  if (!trackId) return -1;
  return queue.findIndex((t) => t.id === trackId);
}

export function musicReducer(state: PlaybackState, action: MusicAction): PlaybackState {
  switch (action.type) {
    case "SET_TRACK":
      return {
        ...state,
        currentTrack: action.payload,
        playbackPosition: 0,
        isPlaying: true,
      };
    case "TOGGLE_PLAY":
      if (!state.currentTrack) return state;
      return { ...state, isPlaying: !state.isPlaying };
    case "SET_VOLUME":
      return { ...state, volume: clampVolume(action.payload) };
    case "UPDATE_POSITION":
      return { ...state, playbackPosition: action.payload };
    case "SET_QUEUE":
      return { ...state, queue: action.payload };
    case "NEXT_TRACK": {
      if (!state.queue.length) {
        return { ...state, isPlaying: false, playbackPosition: 0 };
      }
      const idx = trackIndex(state.queue, state.currentTrack?.id);
      const nextIdx = idx < 0 ? 0 : (idx + 1) % state.queue.length;
      const next = state.queue[nextIdx];
      return {
        ...state,
        currentTrack: next,
        playbackPosition: 0,
        isPlaying: true,
      };
    }
    case "PREV_TRACK": {
      if (!state.currentTrack) return state;
      if (state.playbackPosition > 3) {
        return { ...state, playbackPosition: 0 };
      }
      if (!state.queue.length) {
        return { ...state, playbackPosition: 0 };
      }
      const idx = trackIndex(state.queue, state.currentTrack.id);
      const prevIdx = idx <= 0 ? state.queue.length - 1 : idx - 1;
      const prev = state.queue[prevIdx];
      return {
        ...state,
        currentTrack: prev,
        playbackPosition: 0,
        isPlaying: true,
      };
    }
    default:
      return state;
  }
}
