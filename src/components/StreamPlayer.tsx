"use client";

import "video.js/dist/video-js.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type Player from "video.js/dist/types/player";

export type StreamPlayerProps = {
  /** HLS `.m3u8` or progressive URL (IVS, Cloudflare Stream, etc.). */
  streamUrl: string;
  className?: string;
};

export default function StreamPlayer({ streamUrl, className = "" }: StreamPlayerProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function mountPlayer() {
      if (!videoRef.current) return;

      setIsReady(false);
      setIsBuffering(true);
      setError(null);

      const videojs = (await import("video.js")).default;

      if (cancelled || !videoRef.current) return;

      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      const player = videojs(videoRef.current, {
        controls: false,
        autoplay: "muted",
        preload: "auto",
        fluid: false,
        fill: true,
        responsive: false,
        liveui: true,
        html5: {
          vhs: {
            overrideNative: true,
          },
        },
        sources: [
          {
            src: streamUrl,
            type: "application/x-mpegURL",
          },
        ],
      });

      playerRef.current = player;

      const onReady = () => {
        if (cancelled) return;
        setIsReady(true);
        setIsBuffering(false);
        setVolume(player.volume() ?? 0.85);
        setIsMuted(player.muted() ?? false);
      };

      const onPlay = () => {
        if (!cancelled) setIsPlaying(true);
      };
      const onPause = () => {
        if (!cancelled) setIsPlaying(false);
      };
      const onVolume = () => {
        if (cancelled) return;
        setVolume(player.volume() ?? 0);
        setIsMuted(player.muted() ?? false);
      };
      const onWaiting = () => {
        if (!cancelled) setIsBuffering(true);
      };
      const onPlaying = () => {
        if (!cancelled) setIsBuffering(false);
      };
      const onError = () => {
        if (cancelled) return;
        const mediaError = player.error();
        setError(mediaError?.message ?? "Unable to load stream");
        setIsBuffering(false);
      };

      player.on("ready", onReady);
      player.on("play", onPlay);
      player.on("pause", onPause);
      player.on("volumechange", onVolume);
      player.on("waiting", onWaiting);
      player.on("playing", onPlaying);
      player.on("error", onError);
    }

    void mountPlayer();

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [streamUrl]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.paused()) {
      void player.play();
    } else {
      player.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    player.muted(!player.muted());
  }, []);

  const onVolumeChange = useCallback((value: number) => {
    const player = playerRef.current;
    if (!player) return;
    const next = Math.min(1, Math.max(0, value));
    player.volume(next);
    if (next > 0 && player.muted()) player.muted(false);
    setVolume(next);
    setIsMuted(player.muted() ?? false);
  }, []);

  const enterFullscreen = useCallback(() => {
    const target = shellRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void target.requestFullscreen?.();
  }, []);

  return (
    <div
      ref={shellRef}
      className={["relative h-full w-full overflow-hidden bg-black", className].filter(Boolean).join(" ")}
    >
      {/* Dark backdrop — prevents layout shift while media initializes */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center bg-black transition-opacity duration-300 ${
          isReady && !isBuffering ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden={isReady && !isBuffering}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#00f2ff]" strokeWidth={2} />
      </div>

      <div data-vjs-player className="absolute inset-0 h-full w-full">
        <video
          ref={videoRef}
          className="video-js vjs-fill h-full w-full"
          playsInline
          muted
        />
      </div>

      {error ? (
        <p className="absolute right-4 top-4 z-30 max-w-[14rem] rounded-lg border border-red-500/40 bg-red-950/85 px-2 py-1 text-[10px] text-red-200">
          {error}
        </p>
      ) : null}

      {/* Custom Kick-style control rail */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-black/50 text-white transition-colors hover:border-white/25 hover:bg-black/70"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-black/50 text-white transition-colors hover:border-white/25 hover:bg-black/70"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-[#00f2ff]"
            aria-label="Volume"
          />

          <button
            type="button"
            onClick={enterFullscreen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-black/50 text-white transition-colors hover:border-white/25 hover:bg-black/70"
            aria-label="Fullscreen"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
