"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Maximize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRemoteParticipants, useRoomContext } from "@livekit/components-react";
import { debugSessionLog } from "@/lib/debug-session-log";

export type KickStreamPlayerChromeProps = {
  isLive?: boolean;
  className?: string;
  /** `html5` binds to a `<video>` ref; `livekit` must render inside `LiveKitRoom`. */
  engine?: "html5" | "livekit";
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  playerRootSelector?: string;
};

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function ChromeBar({
  paused,
  muted,
  volume,
  elapsed,
  isLive,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onFullscreen,
  showVolumeSlider = true,
}: {
  paused: boolean;
  muted: boolean;
  volume: number;
  elapsed: number;
  isLive: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (v: number) => void;
  onFullscreen: () => void;
  showVolumeSlider?: boolean;
}) {
  return (
    <div
      className="pointer-events-auto px-3 pb-2 pt-8"
      style={{ background: "linear-gradient(to top, rgba(11,14,17,0.95) 0%, transparent 100%)" }}
    >
      <div className="flex min-w-0 items-center justify-between gap-2 text-white">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#191b1f]/90 text-white hover:bg-[#24272c]"
            aria-label={paused ? "Play" : "Pause"}
          >
            {paused ? <Play size={18} fill="white" /> : <Pause size={18} fill="white" />}
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#191b1f]/90 text-white hover:bg-[#24272c]"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          {showVolumeSlider ? (
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="h-1 w-14 min-w-0 shrink accent-[#00f2fe] sm:w-20"
              aria-label="Volume"
            />
          ) : null}
          <span className="truncate font-mono text-xs tabular-nums text-white/90">
            {formatElapsed(elapsed)}
          </span>
          {isLive ? (
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Live
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onFullscreen}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#191b1f]/90 text-white hover:bg-[#24272c]"
          aria-label="Fullscreen"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}

function KickStreamPlayerChromeHtml5({
  videoRef,
  isLive,
  className,
  playerRootSelector = "[data-watch-player-root]",
}: KickStreamPlayerChromeProps) {
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.6);
  const [elapsed, setElapsed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = videoRef?.current;
    if (!v) return;
    setMuted(v.muted);
    setPaused(v.paused);
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [videoRef]);

  useEffect(() => {
    if (!isLive || paused) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [isLive, paused]);

  const togglePlay = () => {
    const v = videoRef?.current;
    // #region agent log
    debugSessionLog({
      runId: "pre-fix",
      hypothesisId: "H5",
      location: "KickStreamPlayerChrome.tsx:togglePlay",
      message: "play/pause click",
      data: { hasVideo: Boolean(v), paused: v?.paused },
    });
    // #endregion
    if (!v) return;
    if (v.paused) void v.play().catch(() => undefined);
    else v.pause();
    setPaused(v.paused);
  };

  const toggleMute = () => {
    const v = videoRef?.current;
    // #region agent log
    debugSessionLog({
      runId: "pre-fix",
      hypothesisId: "H5",
      location: "KickStreamPlayerChrome.tsx:toggleMute",
      message: "mute click",
      data: { hasVideo: Boolean(v), muted: v?.muted },
    });
    // #endregion
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    if (!next) v.volume = volume;
  };

  const onVolumeChange = (value: number) => {
    const v = videoRef?.current;
    // #region agent log
    debugSessionLog({
      runId: "pre-fix",
      hypothesisId: "H5",
      location: "KickStreamPlayerChrome.tsx:onVolumeChange",
      message: "volume change",
      data: { hasVideo: Boolean(v), value },
    });
    // #endregion
    setVolume(value);
    if (v) {
      v.volume = value;
      v.muted = value === 0;
      setMuted(value === 0);
    }
  };

  const toggleFullscreen = () => {
    const target =
      containerRef.current?.closest(playerRootSelector) ??
      containerRef.current?.closest("[data-hero-player-root]") ??
      containerRef.current;
    if (!target) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void (target as HTMLElement).requestFullscreen?.();
  };

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col ${className ?? ""}`}
    >
      <ChromeBar
        paused={paused}
        muted={muted}
        volume={volume}
        elapsed={elapsed}
        isLive={isLive ?? true}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onVolumeChange={onVolumeChange}
        onFullscreen={toggleFullscreen}
      />
    </div>
  );
}

function KickStreamPlayerChromeLiveKit({
  isLive,
  className,
  playerRootSelector = "[data-watch-player-root]",
}: KickStreamPlayerChromeProps) {
  const room = useRoomContext();
  const remotes = useRemoteParticipants();
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [elapsed, setElapsed] = useState(0);
  const [hiddenVideo, setHiddenVideo] = useState(false);

  useEffect(() => {
    if (!isLive || paused) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [isLive, paused]);

  const applyRemoteVolume = useCallback(
    (level: number) => {
      remotes.forEach((p) => {
        try {
          p.setVolume(level);
        } catch {
          /* ignore */
        }
      });
    },
    [remotes],
  );

  useEffect(() => {
    applyRemoteVolume(muted ? 0 : volume);
  }, [applyRemoteVolume, muted, volume, remotes.length]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    applyRemoteVolume(next ? 0 : volume);
  };

  const onVolumeChange = (value: number) => {
    setVolume(value);
    setMuted(value === 0);
    applyRemoteVolume(value === 0 ? 0 : value);
  };

  const togglePlay = () => {
    const next = !paused;
    setPaused(next);
    setHiddenVideo(next);
  };

  const toggleFullscreen = () => {
    const target =
      containerRef.current?.closest(playerRootSelector) ?? containerRef.current;
    if (!target) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void (target as HTMLElement).requestFullscreen?.();
  };

  useEffect(() => {
    const root = containerRef.current?.closest(playerRootSelector) as HTMLElement | null;
    if (!root) return;
    root.style.opacity = hiddenVideo ? "0.35" : "1";
    return () => {
      root.style.opacity = "";
    };
  }, [hiddenVideo, playerRootSelector]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col ${className ?? ""}`}
    >
      <ChromeBar
        paused={paused}
        muted={muted}
        volume={volume}
        elapsed={elapsed}
        isLive={isLive ?? true}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onVolumeChange={onVolumeChange}
        onFullscreen={toggleFullscreen}
      />
    </div>
  );
}

/** Kick-style control bar — HTML5 video or LiveKit room audio/video shell. */
export default function KickStreamPlayerChrome(props: KickStreamPlayerChromeProps) {
  if (props.engine === "livekit") {
    return <KickStreamPlayerChromeLiveKit {...props} />;
  }
  return <KickStreamPlayerChromeHtml5 {...props} />;
}

export { KickStreamPlayerChromeLiveKit };
