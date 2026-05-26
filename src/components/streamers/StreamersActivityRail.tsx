"use client";

import { Flame, Sparkles, Trophy } from "lucide-react";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

export type StreamHighlight = {
  id: string;
  title: string;
  channel: string;
  timeLabel: string;
};

export type TopPraiser = {
  id: string;
  name: string;
  praises: string;
  avatarUrl?: string | null;
};

type Props = {
  highlights?: StreamHighlight[];
  topPraisers?: TopPraiser[];
  className?: string;
};

const DEFAULT_HIGHLIGHTS: StreamHighlight[] = [
  { id: "h1", title: "Altar call — 200 new praises", channel: "Sanctuary Main", timeLabel: "12m ago" },
  { id: "h2", title: "Worship set peaked at 4.1K live", channel: "Upper Room", timeLabel: "48m ago" },
  { id: "h3", title: "Prayer chain milestone hit", channel: "Prayer Watch", timeLabel: "2h ago" },
  { id: "h4", title: "Testimony clip trending", channel: "Faith Voices", timeLabel: "5h ago" },
];

const DEFAULT_TOP: TopPraiser[] = [
  { id: "t1", name: "Kai M.", praises: "24.1K", avatarUrl: null },
  { id: "t2", name: "Sister Nia", praises: "18.2K", avatarUrl: null },
  { id: "t3", name: "Eli Rivers", praises: "12.8K", avatarUrl: null },
  { id: "t4", name: "Sanctuary Host", praises: "9.4K", avatarUrl: null },
];

/**
 * Discord-inspired right rail: compact channels list + leaderboard-style blocks.
 */
export default function StreamersActivityRail({
  highlights = DEFAULT_HIGHLIGHTS,
  topPraisers = DEFAULT_TOP,
  className = "",
}: Props) {
  return (
    <aside
      className={[
        "parable-live-surface flex w-full flex-col gap-3 rounded-xl shadow-xl shadow-black/50 xl:sticky xl:top-[5.5rem] xl:max-h-[calc(100vh-7rem)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="border-b border-white/[0.06] px-3 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Community</p>
        <h2 className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
          <Sparkles className="h-4 w-4 text-[#00f2ff]" strokeWidth={2} />
          Activity
        </h2>
      </div>

      <div className="scrollbar-hide flex max-h-[min(420px,50vh)] flex-col gap-0 overflow-y-auto px-2 pb-2 xl:max-h-[320px]">
        <div className="flex items-center gap-2 px-2 pb-2 pt-1">
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-white/50">Recent stream highlights</span>
        </div>
        {highlights.map((h) => (
          <button
            key={h.id}
            type="button"
            className="w-full rounded-md px-2 py-2.5 text-left transition hover:bg-white/[0.05]"
          >
            <p className="text-[13px] font-medium leading-snug text-white/90">{h.title}</p>
            <p className="mt-0.5 text-[11px] text-white/45">
              <span className="text-[#00f2ff]/90">{h.channel}</span>
              <span className="mx-1.5 text-white/25">·</span>
              {h.timeLabel}
            </p>
          </button>
        ))}
      </div>

      <div className="mx-2 border-t border-white/[0.06]" />

      <div className="flex flex-col gap-1 px-2 pb-3">
        <div className="flex items-center gap-2 px-1 pb-2 pt-1">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-white/50">Top praisers</span>
        </div>
        <div className="flex flex-col gap-1 rounded-md border border-white/[0.06] bg-black/35 p-2">
          {topPraisers.map((u, idx) => (
            <div
              key={u.id}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition hover:bg-white/[0.04]"
            >
              <span className="w-5 text-center text-[11px] font-black tabular-nums text-white/40">{idx + 1}</span>
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-white/10">
                {u.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={fallbackAvatarOnError}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/50">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">{u.name}</p>
                <p className="text-[11px] tabular-nums text-[#00f2ff]">{u.praises} praises</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
