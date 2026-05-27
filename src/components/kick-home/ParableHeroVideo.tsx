"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export type ParableHeroVideoProps = {
  streamUrl: string;
  className?: string;
  poster?: string;
};

/**
 * Native HTML5 hero player — HLS via hls.js where MSE is required; Safari uses native HLS.
 */
export default function ParableHeroVideo({ streamUrl, className = "", poster }: ParableHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let cancelled = false;
    setReady(false);
    setError(null);

    const onCanPlay = () => {
      if (!cancelled) setReady(true);
    };
    video.addEventListener("canplay", onCanPlay);

    async function attach() {
      const el = videoRef.current;
      if (!el) return;

      hlsRef.current?.destroy();
      hlsRef.current = null;

      const isHls = streamUrl.includes(".m3u8");

      if (isHls && el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = streamUrl;
      } else if (isHls) {
        const { default: Hls } = await import("hls.js");
        if (cancelled) return;
        if (!Hls.isSupported()) {
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
          if (data.fatal && !cancelled) setError("Stream playback failed");
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
  }, [streamUrl]);

  return (
    <div className={["relative h-full w-full overflow-hidden bg-black", className].filter(Boolean).join(" ")}>
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
        <p className="absolute right-3 top-3 z-20 rounded border border-red-500/40 bg-red-950/90 px-2 py-1 text-[10px] text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
