"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useMusicPlayback } from "@/providers/MusicPlaybackProvider";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type MusicMiniPlayerProps = {
  className?: string;
  showQueueControls?: boolean;
};

export default function MusicMiniPlayer({
  className = "",
  showQueueControls = true,
}: MusicMiniPlayerProps) {
  const { state, togglePlay, seek, nextTrack, prevTrack } = useMusicPlayback();
  const track = state.currentTrack;
  if (!track) return null;

  const duration = track.duration > 0 ? track.duration : undefined;
  const progressPct =
    duration && duration > 0
      ? Math.min(100, (state.playbackPosition / duration) * 100)
      : state.playbackPosition > 0
        ? 35
        : 0;

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#111118] via-[#0a0a10] to-[#111118] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
        className,
      ].join(" ")}
      data-music-mini-player
    >
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            {state.isPlaying ? "Now playing" : "Paused"}
          </p>
          <p className="truncate text-sm font-black text-white">{track.title}</p>
          <p className="truncate text-[11px] text-white/45">{track.artist}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {showQueueControls ? (
            <button
              type="button"
              onClick={prevTrack}
              className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Previous track"
            >
              <SkipBack size={18} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00f2ff] text-black shadow-[0_0_24px_rgba(0,242,255,0.4)] transition hover:scale-105 active:scale-95"
            aria-label={state.isPlaying ? "Pause" : "Play"}
          >
            {state.isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} className="ml-0.5" fill="currentColor" />
            )}
          </button>
          {showQueueControls ? (
            <button
              type="button"
              onClick={nextTrack}
              className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Next track"
            >
              <SkipForward size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] tabular-nums text-white/40">
        <span>{formatTime(state.playbackPosition)}</span>
        <input
          type="range"
          min={0}
          max={duration ?? Math.max(state.playbackPosition, 120)}
          step={0.1}
          value={state.playbackPosition}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#00f2ff]"
          aria-label="Seek"
        />
        <span>{duration ? formatTime(duration) : "—"}</span>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#00f2ff] to-violet-400 transition-[width] duration-150"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
