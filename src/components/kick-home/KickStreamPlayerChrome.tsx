"use client";

import { useEffect, useState } from "react";
import {
  Clapperboard,
  Maximize2,
  Pause,
  PictureInPicture2,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";

const KICK_GREEN = "#53fc18";

type Props = {
  isLive?: boolean;
  className?: string;
};

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Kick-style control bar overlaid on the bottom of the video player. */
export default function KickStreamPlayerChrome({ isLive = true, className = "" }: Props) {
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0.12);

  useEffect(() => {
    if (!isLive || paused) return;
    const id = window.setInterval(() => {
      setElapsed((e) => e + 1);
      setProgress((p) => (p >= 0.98 ? 0.08 : p + 0.002));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isLive, paused]);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col ${className}`}
    >
      <div
        className="pointer-events-auto px-3 pb-2 pt-8"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)" }}
      >
        <div
          className="mb-2 h-0.5 w-full overflow-hidden rounded-full bg-white/15"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%`, backgroundColor: KICK_GREEN }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
              aria-label={paused ? "Play" : "Pause"}
            >
              {paused ? <Play size={18} fill="white" /> : <Pause size={18} fill="white" />}
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <span className="font-mono text-xs tabular-nums text-white/90">
              {formatElapsed(elapsed)}
            </span>
            {isLive ? (
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: KICK_GREEN }}
                  aria-hidden
                />
                <span style={{ color: KICK_GREEN }}>LIVE</span>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="hidden h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 sm:flex"
              aria-label="Theater mode"
              title="Theater mode"
            >
              <Maximize2 size={16} />
            </button>
            <button
              type="button"
              className="hidden h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 md:flex"
              aria-label="Clips"
              title="Clips"
            >
              <Clapperboard size={16} />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
              aria-label="Picture in picture"
              title="Picture in picture"
            >
              <PictureInPicture2 size={16} />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
              aria-label="Settings"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
