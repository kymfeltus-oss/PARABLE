"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Maximize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

type Props = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  viewerLabel?: string;
  isLive?: boolean;
  /** Reset overlay state when carousel slide changes. */
  syncKey?: string;
};

/** Hero preview overlay: play/pause, volume, live metric, fullscreen. */
export default function KickHeroPreviewControls({
  videoRef,
  viewerLabel,
  isLive = true,
  syncKey,
}: Props) {
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.6);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    setPaused(v?.paused ?? false);
    setMuted(v?.muted ?? true);
    if (v && !v.muted) setVolume(v.volume);
  }, [syncKey, videoRef]);

  const syncPaused = useCallback(() => {
    const v = videoRef.current;
    if (v) setPaused(v.paused);
  }, [videoRef]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [videoRef]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
    syncPaused();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) v.volume = volume;
  };

  const onVolumeChange = (value: number) => {
    const v = videoRef.current;
    setVolume(value);
    if (v) {
      v.volume = value;
      v.muted = value === 0;
      setMuted(value === 0);
    }
  };

  const toggleFullscreen = () => {
    const target = containerRef.current?.closest("[data-hero-player-root]") ?? containerRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void (target as HTMLElement).requestFullscreen?.();
    }
  };

  return (
    <div ref={containerRef} className="pointer-events-none relative w-full shrink-0">
      <div className="pointer-events-auto border-t border-white/[0.06] bg-[#0b0e11]/95 px-3 py-2.5 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[#191b1f]/90 text-white hover:bg-[#24272c]"
              aria-label={paused ? "Play" : "Pause"}
            >
              {paused ? <Play size={16} fill="white" /> : <Pause size={16} fill="white" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[#191b1f]/90 text-white hover:bg-[#24272c]"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="h-1 w-16 min-w-0 accent-[#00f2fe] sm:w-24"
              aria-label="Volume"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {isLive ? (
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-red-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Live
              </span>
            ) : null}
            {viewerLabel ? (
              <span className="hidden text-xs font-semibold tabular-nums text-[#94a3b8] sm:inline">
                {viewerLabel}
              </span>
            ) : null}
            {viewerLabel ? (
              <span className="text-[10px] font-semibold tabular-nums text-[#94a3b8] sm:hidden">
                {viewerLabel.replace(/\s*watching$/i, "")}
              </span>
            ) : null}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#191b1f]/90 text-white hover:bg-[#24272c]"
              aria-label="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
