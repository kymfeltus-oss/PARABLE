"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Radio, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

export type LiveStreamCardItem = {
  id: string;
  title: string;
  creator: string;
  tag: string;
  live: boolean;
  /** Rough baseline for the pulsing praise counter (simulated live engagement). */
  praiseSeed: number;
  hot?: boolean;
  previewUrl?: string | null;
};

type Props = {
  items: LiveStreamCardItem[];
  className?: string;
};

function formatPraise(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 100) / 10}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.max(0, Math.floor(n)));
}

/**
 * Twitch-style live cards with a large preview, LIVE pill, and a praise counter
 * that ticks occasionally while `live` is true (lightweight “real-time” feel).
 */
export default function StreamersLiveGrid({ items, className = "" }: Props) {
  const [praises, setPraises] = useState<Record<string, number>>({});

  const seedMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of items) m[it.id] = it.praiseSeed;
    return m;
  }, [items]);

  useEffect(() => {
    setPraises(seedMap);
  }, [seedMap]);

  const tick = useCallback(() => {
    setPraises((prev) => {
      const next = { ...prev };
      for (const it of items) {
        if (!it.live) continue;
        const base = it.praiseSeed;
        const cur = next[it.id] ?? base;
        const delta = Math.floor(Math.random() * 5) - 1;
        next[it.id] = Math.max(base, cur + delta + (Math.random() < 0.35 ? 1 : 0));
      }
      return next;
    });
  }, [items]);

  useEffect(() => {
    const live = items.some((i) => i.live);
    if (!live) return;
    const id = window.setInterval(tick, 2300);
    return () => window.clearInterval(id);
  }, [items, tick]);

  if (!items.length) {
    return (
      <div className={`rounded-2xl border border-white/[0.08] bg-black/40 p-12 text-center text-sm text-white/45 ${className}`}>
        No live channels to show yet.
      </div>
    );
  }

  return (
    <div
      className={[
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((s) => {
        const count = praises[s.id] ?? s.praiseSeed;
        return (
          <Link
            key={s.id}
            href={`/watch/${s.id}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]"
          >
            <motion.div
              layout
              whileHover={{ y: -2 }}
              className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e0e10] text-left shadow-lg shadow-black/40 transition-colors hover:border-white/15"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-950">
                {s.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.previewUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    onError={fallbackAvatarOnError}
                  />
                ) : (
                  <>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        s.hot ? "from-[#ff6b2c]/25 via-zinc-900 to-black" : "from-[#00f2ff]/20 via-zinc-900 to-black"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 opacity-40 ${
                        s.hot
                          ? "bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,107,44,0.5),transparent_55%)]"
                          : "bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,242,255,0.35),transparent_55%)]"
                      }`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap
                        className={s.hot ? "text-[#ff6b2c]/35" : "text-[#00f2ff]/35"}
                        size={52}
                        strokeWidth={1}
                      />
                    </div>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {s.live ? (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_0_16px_rgba(220,38,38,0.6)]">
                    <Radio size={12} className="shrink-0" />
                    LIVE
                  </span>
                ) : (
                  <span className="absolute left-3 top-3 rounded bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/55">
                    Offline
                  </span>
                )}

                <span
                  className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    s.hot ? "border-[#ff6b2c]/40 text-[#ffb89a]" : "border-[#00f2ff]/35 text-[#00f2ff]"
                  }`}
                >
                  {s.tag}
                </span>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white drop-shadow">{s.title}</p>
                    <p className="truncate text-xs text-white/55">{s.creator}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-black/70 px-2 py-1.5 text-[11px] font-semibold tabular-nums text-[#00f2ff]">
                    <Heart size={14} className="text-[#00f2ff]/90" fill="currentColor" />
                    <span key={count}>{formatPraise(count)}</span>
                    <span className="hidden text-[10px] font-medium text-white/40 sm:inline">praises</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
