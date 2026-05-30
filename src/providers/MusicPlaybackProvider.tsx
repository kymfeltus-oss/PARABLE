"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { useAudioPipeline } from "@/hooks/useAudioPipeline";
import { initialPlaybackState, musicReducer } from "@/lib/music/musicReducer";
import type { MusicAction, PlaybackState, Track } from "@/lib/music/types";

type MusicPlaybackContextValue = {
  state: PlaybackState;
  dispatch: React.Dispatch<MusicAction>;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seek: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
};

const MusicPlaybackContext = createContext<MusicPlaybackContextValue | null>(null);

export function MusicPlaybackProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(musicReducer, initialPlaybackState);
  const { seek } = useAudioPipeline(state, dispatch);

  const playTrack = useCallback((track: Track, queue?: Track[]) => {
    if (queue?.length) {
      dispatch({ type: "SET_QUEUE", payload: queue });
    }
    dispatch({ type: "SET_TRACK", payload: track });
  }, []);

  const togglePlay = useCallback(() => {
    dispatch({ type: "TOGGLE_PLAY" });
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: "SET_VOLUME", payload: volume });
  }, []);

  const nextTrack = useCallback(() => {
    dispatch({ type: "NEXT_TRACK" });
  }, []);

  const prevTrack = useCallback(() => {
    dispatch({ type: "PREV_TRACK" });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      playTrack,
      togglePlay,
      setVolume,
      seek,
      nextTrack,
      prevTrack,
    }),
    [state, playTrack, togglePlay, setVolume, seek, nextTrack, prevTrack],
  );

  return <MusicPlaybackContext.Provider value={value}>{children}</MusicPlaybackContext.Provider>;
}

export function useMusicPlayback() {
  const ctx = useContext(MusicPlaybackContext);
  if (!ctx) {
    throw new Error("useMusicPlayback must be used within MusicPlaybackProvider");
  }
  return ctx;
}
