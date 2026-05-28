"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Play } from "lucide-react";
import KickHeroPreviewControls from "@/components/kick-home/KickHeroPreviewControls";
import ParableHeroVideo from "@/components/kick-home/ParableHeroVideo";
import { demoStreamMp4ForChannel } from "@/lib/demo-hls-stream";
import type { KickStreamCardData } from "@/lib/kick-home-data";

type Props = {
  slides: KickStreamCardData[];
  onWatch: (id: string) => void;
};

export default function KickHeroCarousel({ slides, onWatch }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const active = slides[index];

  const go = useCallback(
    (delta: number) => {
      if (count === 0) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => go(1), 8000);
    return () => clearInterval(timer);
  }, [count, go]);

  if (!active) {
    return (
      <div className="flex aspect-[21/9] min-h-[200px] w-full items-center justify-center rounded-xl border border-[#24272c] bg-[#191b1f] text-sm text-[#64748b]">
        No featured streams right now
      </div>
    );
  }

  return (
    <section
      data-testid="stream-hero-carousel"
      className="relative w-full min-w-0 overflow-hidden rounded-xl border border-[#24272c] bg-black"
    >
      <div
        data-hero-player-root
        className="relative aspect-[21/9] min-h-[clamp(200px,28vw,360px)] w-full"
      >
        <div className="absolute inset-0">
          <ParableHeroVideo
            key={`hero-v-${index}`}
            streamUrl={demoStreamMp4ForChannel(active.id)}
            mp4FallbackUrl={demoStreamMp4ForChannel(active.id)}
            poster={active.thumbnailUrl}
            className="absolute inset-0 h-full w-full"
            videoRef={videoRef}
          />
          <KickHeroPreviewControls
            syncKey={active.id}
            videoRef={videoRef}
            isLive={active.isLive}
            viewerLabel={`${active.viewers} watching`}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0b0e11]/90 via-[#0b0e11]/35 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0e11]/85 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 z-20 max-w-lg p-4 sm:p-6">
            <span className="inline-flex items-center gap-1 rounded bg-[#00f2fe] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black">
              Featured Live
            </span>
            <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-3xl">{active.title}</h2>
            <p className="mt-1 text-sm text-[#e2e8f0]">
              <span className="font-semibold text-[#00f2fe]">{active.creator}</span>
              {" · "}
              {active.category}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#94a3b8]">
              <Eye size={12} className="text-[#00f2fe]" />
              {active.viewers} watching
            </p>
            <button
              type="button"
              onClick={() => onWatch(active.id)}
              className="pointer-events-auto mt-4 inline-flex items-center gap-2 rounded-lg bg-[#00f2fe] px-5 py-2.5 text-sm font-black text-black transition hover:brightness-110 active:scale-[0.98]"
            >
              <Play size={16} fill="currentColor" />
              Watch now
            </button>
          </div>
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#24272c] bg-[#191b1f]/80 text-white transition hover:border-[#00f2fe]/50 hover:text-[#00f2fe]"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#24272c] bg-[#191b1f]/80 text-white transition hover:border-[#00f2fe]/50 hover:text-[#00f2fe]"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={`hero-dot-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-[#00f2fe]" : "w-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
