"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { DEMO_HLS_STREAM_URL, DEMO_MP4_FALLBACK_URL } from "@/lib/demo-hls-stream";

export type ParableHeroVideoProps = {
  streamUrl?: string;
  mp4FallbackUrl?: string;
  className?: string;
  poster?: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
};

/**
 * Native HTML5 hero player — HLS via hls.js where MSE is required; Safari uses native HLS.
 * Falls back to MP4 loop when HLS is unsupported or fatally errors.
 */
export default function ParableHeroVideo({
  streamUrl = DEMO_HLS_STREAM_URL,
  mp4FallbackUrl = DEMO_MP4_FALLBACK_URL,
  className = "",
  poster,
  videoRef: externalVideoRef,
}: ParableHeroVideoProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const usedMp4Ref = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let cancelled = false;
    setReady(false);
    setError(null);
    usedMp4Ref.current = false;

    const onCanPlay = () => {
      if (!cancelled) setReady(true);
    };
    video.addEventListener("canplay", onCanPlay);

    function attachMp4(el: HTMLVideoElement) {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      usedMp4Ref.current = true;
      el.src = mp4FallbackUrl;
      void el.play().catch(() => undefined);
    }

    async function attach() {
      const el = videoRef.current;
      if (!el || cancelled) return;

      hlsRef.current?.destroy();
      hlsRef.current = null;

      const isHls = streamUrl.includes(".m3u8");

      if (isHls && el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = streamUrl;
      } else if (isHls) {
        const { default: Hls } = await import("hls.js");
        if (cancelled) return;
        if (!Hls.isSupported()) {
          if (mp4FallbackUrl) {
            attachMp4(el);
            return;
          }
          setError("HLS not supported in this browser");
          return;
        }
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(el);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!cancelled) void el.play().catch(() => undefined);
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal || cancelled) return;
          if (mp4FallbackUrl && !usedMp4Ref.current) {
            setError(null);
            attachMp4(el);
            return;
          }
          setError("Stream playback failed");
        });
        hlsRef.current = hls;
      } else {
        el.src = streamUrl;
      }

      void el.play().catch(() => undefined);
    }

    void attach();

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", onCanPlay);
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.removeAttribute("src");
      video.load();
    };
  }, [streamUrl, mp4FallbackUrl, videoRef]);

  return (
    <div className={["relative h-full w-full min-w-0 overflow-hidden bg-black", className].filter(Boolean).join(" ")}>
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center bg-[#0b0e11] transition-opacity duration-300 ${
          ready ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden={ready}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#00f2fe]" strokeWidth={2} />
      </div>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        autoPlay
        loop
        poster={poster}
      />
      {error ? (
        <p className="absolute right-3 top-3 z-20 max-w-[min(100%,14rem)] truncate rounded border border-red-500/40 bg-red-950/90 px-2 py-1 text-[10px] text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
