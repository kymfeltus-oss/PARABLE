"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ReelsAudioContextValue = {
  muted: boolean;
  toggleMuted: () => void;
  setMuted: (value: boolean) => void;
  flashMuteIndicator: boolean;
  triggerMuteFlash: () => void;
};

const ReelsAudioContext = createContext<ReelsAudioContextValue | null>(null);

export function ReelsAudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(true);
  const [flashMuteIndicator, setFlashMuteIndicator] = useState(false);

  const triggerMuteFlash = useCallback(() => {
    setFlashMuteIndicator(true);
    window.setTimeout(() => setFlashMuteIndicator(false), 900);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => !prev);
    triggerMuteFlash();
  }, [triggerMuteFlash]);

  const value = useMemo(
    () => ({
      muted,
      toggleMuted,
      setMuted,
      flashMuteIndicator,
      triggerMuteFlash,
    }),
    [muted, toggleMuted, flashMuteIndicator, triggerMuteFlash],
  );

  return <ReelsAudioContext.Provider value={value}>{children}</ReelsAudioContext.Provider>;
}

export function useReelsAudio() {
  const ctx = useContext(ReelsAudioContext);
  if (!ctx) {
    throw new Error("useReelsAudio must be used within ReelsAudioProvider");
  }
  return ctx;
}
