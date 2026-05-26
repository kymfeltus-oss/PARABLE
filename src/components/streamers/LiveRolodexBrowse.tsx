'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Radio } from 'lucide-react';

export type RolodexLiveItem = {
  id: string;
  title: string;
  creator: string;
  viewers: string;
  tag: string;
  /** High engagement → electric orange accent */
  hot?: boolean;
};

type Props = {
  items: RolodexLiveItem[];
  onWatch: (id: string) => void;
};

export function LiveRolodexBrowse({ items, onWatch }: Props) {
  const [active, setActive] = useState(0);
  const len = items.length;

  const safeIndex = useMemo(() => (len ? ((active % len) + len) % len : 0), [active, len]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!len) return;
      setActive((i) => (i + dir + len) % len);
    },
    [len]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const current = items[safeIndex];
  const prevItem = len ? items[(safeIndex - 1 + len) % len] : null;
  const nextItem = len ? items[(safeIndex + 1) % len] : null;

  if (!len || !current) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-12 text-center text-white/45 text-sm">
        No live channels in the rolodex yet.
      </div>
    );
  }

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[#00f2ff]/20 bg-gradient-to-b from-black/70 via-[#0a1014] to-black/90 shadow-[0_0_60px_rgba(0,242,255,0.08)]"
      aria-label="Browse live channels"
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[radial-gradient(ellipse_at_50%_0%,#00f2ff,transparent_55%)]" />

      <div className="relative px-4 sm:px-8 pt-8 pb-6 sm:pt-10 sm:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#00f2ff]/85">
              Live rolodex
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Flip through what&apos;s live
            </h2>
            <p className="mt-2 text-sm text-white/50 max-w-lg leading-relaxed">
              Choose a stream to watch. Use arrows, keyboard, or tap a side card to browse.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-white/40 tabular-nums">
              {safeIndex + 1} / {len}
            </span>
          </div>
        </div>

        <div
          className="relative mt-8 flex min-h-[260px] w-full min-w-0 items-center justify-center gap-2 sm:min-h-[300px] sm:gap-6 md:min-h-[320px]"
          style={{ perspective: '1200px' }}
        >
          <button
            type="button"
            onClick={() => go(-1)}
            className="hidden sm:flex shrink-0 h-12 w-12 items-center justify-center rounded-xl border border-white/12 bg-black/50 text-white/70 hover:border-[#00f2ff]/40 hover:text-[#00f2ff] transition-colors z-20"
            aria-label="Previous live"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="relative mx-auto flex min-w-0 max-w-full flex-1 items-center justify-center sm:max-w-[min(100%,420px)]">
            {/* Back-left */}
            {prevItem ? (
              <motion.button
                type="button"
                key={`prev-${prevItem.id}`}
                initial={false}
                animate={{
                  x: '-42%',
                  scale: 0.82,
                  rotateY: 28,
                  opacity: 0.45,
                  zIndex: 1,
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                onClick={() => go(-1)}
                className="absolute w-[78%] aspect-[4/5] rounded-2xl border border-white/10 bg-zinc-950/90 overflow-hidden origin-right cursor-pointer hover:opacity-70 transition-opacity hidden sm:block"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <SideCardPeek item={prevItem} />
              </motion.button>
            ) : null}

            {/* Front — active */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, rotateY: -18, scale: 0.92 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: 16, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className={`relative w-full aspect-[4/5] sm:aspect-video max-h-[420px] rounded-2xl overflow-hidden border-2 shadow-2xl origin-center ${
                  current.hot
                    ? 'border-[#ff6b2c]/70 shadow-[0_0_40px_rgba(255,107,44,0.25)]'
                    : 'border-[#00f2ff]/45 shadow-[0_0_36px_rgba(0,242,255,0.2)]'
                }`}
                style={{ transformStyle: 'preserve-3d', zIndex: 10 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
                <div
                  className={`absolute inset-0 opacity-30 ${
                    current.hot
                      ? 'bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,107,44,0.5),transparent_50%)]'
                      : 'bg-[radial-gradient(ellipse_at_30%_20%,rgba(0,242,255,0.45),transparent_50%)]'
                  }`}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 bg-gradient-to-t from-black via-black/70 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                      <Radio size={12} className="shrink-0" />
                      Live
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        current.hot ? 'text-[#ffb89a]' : 'text-[#00f2ff]'
                      }`}
                    >
                      {current.tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">{current.title}</h3>
                  <p className="mt-1 text-sm text-white/55">{current.creator}</p>
                  <p className="mt-2 text-xs text-white/40 tabular-nums">{current.viewers} watching</p>
                  <button
                    type="button"
                    onClick={() => onWatch(current.id)}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00f2ff] text-black px-5 py-3 text-sm font-bold hover:opacity-90 transition-opacity w-full sm:w-auto"
                  >
                    <Play size={18} fill="currentColor" />
                    Watch this stream
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Back-right */}
            {nextItem ? (
              <motion.button
                type="button"
                key={`next-${nextItem.id}`}
                initial={false}
                animate={{
                  x: '42%',
                  scale: 0.82,
                  rotateY: -28,
                  opacity: 0.45,
                  zIndex: 1,
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                onClick={() => go(1)}
                className="absolute w-[78%] aspect-[4/5] rounded-2xl border border-white/10 bg-zinc-950/90 overflow-hidden origin-left cursor-pointer hover:opacity-70 transition-opacity hidden sm:block"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <SideCardPeek item={nextItem} />
              </motion.button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            className="hidden sm:flex shrink-0 h-12 w-12 items-center justify-center rounded-xl border border-white/12 bg-black/50 text-white/70 hover:border-[#00f2ff]/40 hover:text-[#00f2ff] transition-colors z-20"
            aria-label="Next live"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="flex sm:hidden justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={() => go(-1)}
            className="h-11 px-5 rounded-xl border border-white/12 bg-black/50 text-sm text-white/80"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="h-11 px-5 rounded-xl border border-white/12 bg-black/50 text-sm text-white/80"
          >
            Next
          </button>
        </div>

        <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === safeIndex ? 'w-8 bg-[#00f2ff]' : 'w-1.5 bg-white/20 hover:bg-white/35'
              }`}
              aria-label={`Show channel ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SideCardPeek({ item }: { item: RolodexLiveItem }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/95 to-transparent">
      <p className="text-[9px] font-black uppercase tracking-wider text-white/50 truncate">{item.tag}</p>
      <p className="text-sm font-semibold text-white/90 truncate mt-1">{item.title}</p>
    </div>
  );
}
