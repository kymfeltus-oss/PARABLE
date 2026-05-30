"use client";

import { useEffect, useRef } from "react";
import type { MusicAction, PlaybackState } from "@/lib/music/types";

export function useAudioPipeline(
  state: PlaybackState,
  dispatch: React.Dispatch<MusicAction>,
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      dispatch({ type: "UPDATE_POSITION", payload: audio.currentTime });
    };

    const handleTrackEnded = () => {
      dispatch({ type: "NEXT_TRACK" });
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleTrackEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleTrackEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, [dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;
    audio.src = state.currentTrack.audioUrl;
    audio.load();
    if (state.isPlaying) {
      void audio.play().catch((err) => console.error("Playback block:", err));
    }
  }, [state.currentTrack?.id, state.currentTrack?.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;
    if (state.isPlaying) {
      void audio.play().catch((err) => console.error("Playback block:", err));
    } else {
      audio.pause();
    }
  }, [state.isPlaying, state.currentTrack?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = state.volume;
  }, [state.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;
    if (Math.abs(audio.currentTime - state.playbackPosition) > 0.35) {
      audio.currentTime = state.playbackPosition;
    }
  }, [state.playbackPosition, state.currentTrack?.id]);

  const seek = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    dispatch({ type: "UPDATE_POSITION", payload: seconds });
  };

  return { seek };
}
