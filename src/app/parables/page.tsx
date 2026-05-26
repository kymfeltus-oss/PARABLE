"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  Plus,
  Search,
  Sparkles,
  Film,
  Clapperboard,
  Clock3,
  Heart,
  Flame,
  BookOpen,
  Wand2,
  PenSquare,
  Upload,
  ArrowRight,
  Layers3,
  Star,
} from "lucide-react";

type StoryCategory =
  | "All"
  | "Redemption"
  | "Church Drama"
  | "Love & Restoration"
  | "Testimony Films"
  | "Prophetic Suspense"
  | "Family & Faith"
  | "Young Adult Stories"
  | "Urban Parables";

type StoryCard = {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<StoryCategory, "All">;
  type: "Series" | "Short Film" | "Original" | "Trailer";
  episode?: string;
  runtime: string;
  tag: string;
  progress?: number;
  featured?: boolean;
  isNew?: boolean;
};

const CATEGORIES: StoryCategory[] = [
  "All",
  "Redemption",
  "Church Drama",
  "Love & Restoration",
  "Testimony Films",
  "Prophetic Suspense",
  "Family & Faith",
  "Young Adult Stories",
  "Urban Parables",
];

function frac(n: number) {
  return n - Math.floor(n);
}

function prand(seed: number) {
  return frac(Math.sin(seed * 9999.123) * 10000);
}

function CinemaSparkles() {
  const sparkles = useMemo(() => {
    return Array.from({ length: 54 }).map((_, i) => {
      const r1 = prand(i + 1);
      const r2 = prand(i + 101);
      const r3 = prand(i + 1001);
      const r4 = prand(i + 5001);

      return {
        id: i,
        left: `${(r1 * 100).toFixed(4)}%`,
        top: `${(r2 * 100).toFixed(4)}%`,
        dur: `${(4.1 + r3 * 3.6).toFixed(4)}s`,
        delay: `${(r4 * 1.4).toFixed(4)}s`,
        size: 1 + (i % 3),
        opacity: 0.18 + (i % 4) * 0.07,
      };
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-[#00f2fe] shadow-[0_0_14px_rgba(0,242,254,0.70)]"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `parableSpark ${s.dur} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes parableSpark {
          0% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: translate3d(0, -20px, 0) scale(1.08);
          }
          100% {
            transform: translate3d(0, -48px, 0) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes cinemaOcean {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(2%, -2%, 0) rotate(5deg);
          }
        }

        @keyframes tickerSlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes reelGlow {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(0, 242, 254, 0);
          }
          50% {
            box-shadow: 0 0 48px rgba(0, 242, 254, 0.1);
          }
        }

        @keyframes pulseDot {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[3px] transition-all",
        active
          ? "border-[#00f2fe]/35 bg-[#00f2fe]/16 text-[#00f2fe] shadow-[0_0_22px_rgba(0,242,254,0.14)]"
          : "border-white/10 bg-white/5 text-white/55 hover:border-[#00f2fe]/20 hover:text-white/80",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SignalCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-2">
        <span className="text-white/40">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-[3px] text-white/35">
          Story Signal
        </span>
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[4px] text-white/45">
        {label}
      </p>
      <p className="mt-1 text-[20px] font-black text-white">{value}</p>
    </div>
  );
}

function StoryWorldCard({
  title,
  subtitle,
  value,
  icon,
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="min-w-0 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,242,254,0.10)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="shrink-0 text-[#00f2fe]">{icon}</span>
        <span className="min-w-0 truncate text-right text-[9px] font-black uppercase tracking-[3px] text-white/35">
          {value}
        </span>
      </div>
      <h3 className="mt-5 break-words text-lg font-black text-white sm:text-[18px]">{title}</h3>
      <p className="mt-2 break-words text-sm leading-relaxed text-white/55">{subtitle}</p>
      <button
        type="button"
        className="mt-5 w-full rounded-[18px] border border-[#00f2fe]/25 bg-[#00f2fe]/12 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[4px] text-[#00f2fe]"
      >
        Explore
      </button>
    </motion.div>
  );
}

function EpisodeCard({ item }: { item: StoryCard }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="relative min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_90px_rgba(0,242,254,0.08)]"
      style={item.featured ? { animation: "reelGlow 5.4s ease-in-out infinite" } : undefined}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.20] bg-[radial-gradient(circle_at_18%_18%,rgba(0,242,254,0.18),transparent_52%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.08),transparent_60%)]" />

      <div className="relative min-w-0 p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${item.isNew ? "bg-red-500" : "bg-[#00f2fe]"}`}
              style={item.isNew ? { animation: "pulseDot 1.15s ease-in-out infinite" } : undefined}
            />
            <span className="min-w-0 break-words text-[9px] font-black uppercase leading-snug tracking-[0.2em] text-white/65 sm:text-[10px] sm:tracking-[4px]">
              {item.tag}
            </span>
          </div>

          <div className="shrink-0 text-left">
            <p className="text-[10px] font-black uppercase tracking-[4px] text-[#00f2fe]">{item.type}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[3px] text-white/35">{item.runtime}</p>
          </div>
        </div>

        <div className="relative mt-4 flex h-[140px] items-center justify-center overflow-hidden rounded-[22px] border border-[#00f2fe]/14 bg-black/45 sm:h-[170px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.14),transparent_58%)]" />
          <Film className="relative z-10 text-[#00f2fe]/60" size={42} />
          {item.isNew && (
            <div className="absolute top-3 right-3 rounded-full border border-red-500/25 bg-black/60 px-3 py-2">
              <span className="text-[9px] font-black uppercase tracking-[4px] text-red-300">
                New
              </span>
            </div>
          )}
        </div>

        <h3 className="mt-4 break-words text-[17px] font-black tracking-tight text-white sm:text-[18px]">
          {item.title}
        </h3>
        <p className="mt-2 break-words text-sm leading-relaxed text-white/60">{item.subtitle}</p>

        <div className="mt-4 flex flex-col gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[3px] text-white/35">
              {item.episode || "Feature"}
            </p>
            <p className="mt-1 break-words text-[10px] font-black uppercase tracking-[3px] text-[#00f2fe]">
              {item.category}
            </p>
          </div>

          <button
            type="button"
            className="w-full shrink-0 rounded-[16px] border border-[#00f2fe]/25 bg-[#00f2fe]/12 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[4px] text-[#00f2fe]"
          >
            Watch
          </button>
        </div>

        {typeof item.progress === "number" && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[3px] text-white/35">
                Continue Watching
              </span>
              <span className="text-[9px] font-black uppercase tracking-[3px] text-white/35">
                {item.progress}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#00f2fe]/75"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ParablePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<StoryCategory>("All");

  const featured = useMemo<StoryCard>(
    () => ({
      id: "featured-1",
      title: "The Altar Call",
      subtitle:
        "A young woman on the edge of giving up is pulled into a moment that changes everything.",
      category: "Redemption",
      type: "Original",
      episode: "Season 1 • Episode 2",
      runtime: "8 min",
      tag: "Featured Original",
      progress: 44,
      featured: true,
      isNew: true,
    }),
    []
  );

  const liveRail = useMemo(
    () => [
      { id: "lr1", title: "The Altar Call", meta: "Episode 2 • 8 min" },
      { id: "lr2", title: "Grace Street", meta: "Season Premiere" },
      { id: "lr3", title: "When The Choir Stops", meta: "Short Film" },
      { id: "lr4", title: "Red Letter", meta: "New This Week" },
      { id: "lr5", title: "First Lady", meta: "Church Drama" },
      { id: "lr6", title: "Open Heaven", meta: "Testimony Film" },
    ],
    []
  );

  const library = useMemo<StoryCard[]>(
    () => [
      {
        id: "s1",
        title: "Grace Street",
        subtitle: "A city block, a storefront church, and lives colliding under pressure.",
        category: "Church Drama",
        type: "Series",
        episode: "Episode 5",
        runtime: "11 min",
        tag: "Trending",
        progress: 72,
      },
      {
        id: "s2",
        title: "Open Heaven",
        subtitle: "A visual testimony about grief, surrender, and unexpected healing.",
        category: "Testimony Films",
        type: "Short Film",
        runtime: "9 min",
        tag: "Based on True Testimony",
        isNew: true,
      },
      {
        id: "s3",
        title: "Red Letter",
        subtitle: "A suspenseful journey into a word that refuses to leave her alone.",
        category: "Prophetic Suspense",
        type: "Original",
        episode: "Episode 1",
        runtime: "7 min",
        tag: "Premiere",
        isNew: true,
      },
      {
        id: "s4",
        title: "When The Choir Stops",
        subtitle: "What happens when the song ends but the wounds stay in the room.",
        category: "Family & Faith",
        type: "Short Film",
        runtime: "10 min",
        tag: "Most Watched",
      },
      {
        id: "s5",
        title: "First Lady",
        subtitle: "Image, pressure, calling, and the private weight behind public grace.",
        category: "Church Drama",
        type: "Series",
        episode: "Episode 3",
        runtime: "12 min",
        tag: "Trending",
      },
      {
        id: "s6",
        title: "After Youth Night",
        subtitle: "Friendship, first love, church culture, and identity after the altar moment.",
        category: "Young Adult Stories",
        type: "Series",
        episode: "Episode 4",
        runtime: "8 min",
        tag: "Young Adult",
        progress: 31,
      },
      {
        id: "s7",
        title: "The Promise Ring",
        subtitle: "A story about waiting, wisdom, and love tested by time and pressure.",
        category: "Love & Restoration",
        type: "Series",
        episode: "Episode 2",
        runtime: "9 min",
        tag: "Romance",
      },
      {
        id: "s8",
        title: "Corner Store Prophet",
        subtitle: "An urban parable about warning, mercy, and the voice nobody wanted to hear.",
        category: "Urban Parables",
        type: "Short Film",
        runtime: "8 min",
        tag: "Urban",
      },
      {
        id: "s9",
        title: "The Return",
        subtitle: "A son comes back, but not everyone is ready for restoration.",
        category: "Redemption",
        type: "Series",
        episode: "Episode 6",
        runtime: "10 min",
        tag: "Redemption",
      },
      {
        id: "s10",
        title: "Seen by Heaven",
        subtitle: "A quiet story about being overlooked by people but never by God.",
        category: "Testimony Films",
        type: "Short Film",
        runtime: "6 min",
        tag: "Moved",
      },
    ],
    []
  );

  const continueWatching = useMemo(
    () => library.filter((item) => typeof item.progress === "number"),
    [library]
  );

  const filtered = useMemo(() => {
    let items = library;

    if (category !== "All") {
      items = items.filter((item) => item.category === category);
    }

    if (!query.trim()) return items;

    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    );
  }, [library, category, query]);

  const rows = useMemo(
    () => [
      {
        title: "Continue Watching",
        items: continueWatching,
      },
      {
        title: "Trending Originals",
        items: library.slice(0, 5),
      },
      {
        title: "Based on True Testimonies",
        items: library.filter((item) => item.category === "Testimony Films"),
      },
      {
        title: "Church World Stories",
        items: library.filter((item) => item.category === "Church Drama"),
      },
    ],
    [continueWatching, library]
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white pb-parable-bottom">
      <div className="absolute inset-0">
        <div className="absolute inset-[-30%] opacity-[0.20] blur-[92px] animate-[cinemaOcean_18s_ease-in-out_infinite] bg-[radial-gradient(circle_at_18%_18%,rgba(0,242,254,0.34),transparent_55%),radial-gradient(circle_at_75%_68%,rgba(255,255,255,0.12),transparent_60%),radial-gradient(circle_at_46%_82%,rgba(0,242,254,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.10] [background:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:92px_92px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.74)_58%,rgba(0,0,0,0.97)_100%)]" />
      </div>

      <CinemaSparkles />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-28 pt-10">
        <Link
          href="/studio-hub"
          className="relative mb-6 flex w-full flex-col gap-4 overflow-hidden rounded-[28px] border border-amber-500/25 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-[1px] shadow-[0_0_64px_rgba(251,191,36,0.12)] transition hover:shadow-[0_0_80px_rgba(251,191,36,0.18)] sm:flex-row sm:items-stretch"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_20%_30%,rgba(251,191,36,0.15),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(0,242,255,0.08),transparent_50%)] opacity-90" />
          <div className="relative flex flex-1 flex-col justify-center gap-2 px-6 py-6 sm:px-8">
            <span className="w-fit rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.35em] text-amber-200/90">
              Pro
            </span>
            <span className="text-xl font-black tracking-tight text-white sm:text-2xl">Parable Creator Studio</span>
            <span className="max-w-xl text-sm leading-relaxed text-white/55">
              Script architect, hybrid casting room, and storyboard grid — production workflow in one hub.
            </span>
          </div>
          <div className="relative flex shrink-0 items-center justify-center border-t border-white/10 bg-black/40 px-6 py-5 sm:border-l sm:border-t-0 sm:px-10">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#00f2ff]">Open studio →</span>
          </div>
        </Link>

        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
          <div
            className="flex min-w-max gap-4 px-4 py-3"
            style={{ animation: "tickerSlide 24s linear infinite" }}
          >
            {[...liveRail, ...liveRail].map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                className="inline-flex items-center gap-3 rounded-full border border-[#00f2fe]/18 bg-black/45 px-4 py-3"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[4px] text-white/70">
                  {item.title}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[3px] text-[#00f2fe]">
                  {item.meta}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6">
          <div className="">
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_0_140px_rgba(0,242,254,0.12)]">
              <div className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_18%_18%,rgba(0,242,254,0.18),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.08),transparent_60%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#00f2fe] shadow-[0_0_18px_rgba(0,242,254,0.9)]" />
                  <span className="text-[11px] font-black uppercase tracking-[4px] text-white/70">
                    Parable Originals
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6">
                  <div>
                    <h1 className="break-words text-[28px] font-black leading-[1.05] tracking-tight sm:text-[36px]">
                      The{" "}
                      <span className="relative inline-block">
                        <span className="absolute -inset-2 blur-2xl opacity-60 bg-[radial-gradient(circle_at_30%_40%,rgba(0,242,254,0.42),transparent_60%)]" />
                        <span className="relative text-[#00f2fe] drop-shadow-[0_0_24px_rgba(0,242,254,0.55)]">
                          Story World
                        </span>
                      </span>{" "}
                      of Parable
                    </h1>

                    <p className="mt-4 max-w-[760px] text-[15px] leading-relaxed text-white/65">
                      Microdramas, cinematic testimonies, episodic faith stories, and
                      premium short form originals built for culture, redemption, and
                      spiritual storytelling.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button className="inline-flex items-center gap-2 rounded-[22px] bg-[#00f2fe] px-6 py-4 text-[11px] font-black uppercase tracking-[4px] text-black shadow-[0_0_30px_rgba(0,242,254,0.18)]">
                        <Play size={14} /> Watch Now
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-[22px] border border-white/10 bg-black/50 px-6 py-4 text-[11px] font-black uppercase tracking-[4px] text-white/70 hover:bg-white/10 transition">
                        <Plus size={14} /> Add to Watchlist
                      </button>
                    </div>

                    <Link
                      href="/writers-hub"
                      className="mt-6 flex w-full flex-col gap-3 rounded-[22px] border border-[#00f2ff]/25 bg-gradient-to-br from-[#00f2ff]/12 via-black/40 to-amber-500/10 p-5 text-left shadow-[0_0_48px_rgba(0,242,254,0.08)] transition hover:border-[#00f2ff]/40 hover:shadow-[0_0_64px_rgba(0,242,254,0.12)] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#00f2ff]/80">For writers</p>
                        <p className="mt-2 text-base font-black text-white sm:text-lg">Writer Studio</p>
                        <p className="mt-1 text-sm text-white/60">
                          AI script modes (outline, beats, scene, dialogue, rewrite) and character tools — autosaves on your device.
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl bg-[#00f2ff]/15 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#00f2ff] sm:self-center">
                        Open hub <ArrowRight size={14} />
                      </span>
                    </Link>
                  </div>

                  <div className="rounded-[28px] border border-[#00f2fe]/14 bg-black/45 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[4px] text-red-400">
                        Featured Original
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[4px] text-[#00f2fe]">
                        {featured.runtime}
                      </span>
                    </div>

                    <div className="mt-4 h-[190px] rounded-[22px] border border-[#00f2fe]/12 bg-black/45 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.14),transparent_58%)]" />
                      <Clapperboard className="relative z-10 text-[#00f2fe]/60" size={44} />
                      <div className="absolute top-3 right-3 rounded-full border border-red-500/25 bg-black/60 px-3 py-2">
                        <span className="text-[9px] font-black uppercase tracking-[4px] text-red-300">
                          New Episode
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-4 text-[22px] font-black text-white">{featured.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{featured.subtitle}</p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[4px] text-[#00f2fe]">
                      {featured.episode}
                    </p>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[3px] text-white/35">
                          Continue Watching
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[3px] text-white/35">
                          {featured.progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#00f2fe]/75"
                          style={{ width: `${featured.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SignalCard label="Originals Live" value="18" icon={<Film size={18} />} />
            <SignalCard label="Episodes This Week" value="42" icon={<Clapperboard size={18} />} />
            <SignalCard label="Saved Watchlist" value="27" icon={<Star size={18} />} />
            <SignalCard label="Story Worlds" value="9" icon={<Layers3 size={18} />} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <StoryWorldCard
            title="Redemption"
            subtitle="Stories of return, rebuilding, mercy, and the long road back."
            value="12 titles"
            icon={<Sparkles size={18} />}
          />
          <StoryWorldCard
            title="Church Drama"
            subtitle="Relationships, leadership, pressure, image, calling, and church worlds."
            value="8 series"
            icon={<BookOpen size={18} />}
          />
          <StoryWorldCard
            title="Love & Restoration"
            subtitle="Faith centered romance, heartbreak, waiting, healing, and restored love."
            value="7 stories"
            icon={<Heart size={18} />}
          />
          <StoryWorldCard
            title="Prophetic Suspense"
            subtitle="Mystery, warning, encounters, and storylines built around the unseen."
            value="5 originals"
            icon={<Flame size={18} />}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="">
            <div className="rounded-[28px] border border-white/10 bg-black/55 px-6 py-4 backdrop-blur-2xl shadow-[0_0_110px_rgba(0,242,254,0.10)]">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-white/35" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search series, shorts, testimonies, creators, genres…"
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-white/30"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-start">
            {CATEGORIES.map((x) => (
              <Pill key={x} active={category === x} onClick={() => setCategory(x)}>
                {x}
              </Pill>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6">
          <div className="space-y-8">
            <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:thin] snap-x snap-mandatory">
              {filtered.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="w-[min(100%,320px)] min-w-[min(100%,280px)] max-w-full shrink-0 snap-start"
                >
                  <EpisodeCard item={item} />
                </div>
              ))}
            </div>

            {rows.map((row) => (
              <div
                key={row.title}
                className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_0_120px_rgba(0,242,254,0.10)]"
              >
                <div className="mb-5 flex min-w-0 flex-col gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[4px] text-white/45">
                      Story Row
                    </p>
                    <h2 className="mt-1 break-words text-xl font-black text-white sm:text-2xl">{row.title}</h2>
                  </div>

                  <button
                    type="button"
                    className="inline-flex w-fit shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-[4px] text-[#00f2fe]"
                  >
                    View All <ArrowRight size={14} />
                  </button>
                </div>

                <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:thin] snap-x snap-mandatory">
                  {row.items.slice(0, 3).map((item) => (
                    <div
                      key={`${row.title}-${item.id}`}
                      className="w-[min(100%,320px)] min-w-[min(100%,280px)] max-w-full shrink-0 snap-start"
                    >
                      <EpisodeCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_0_120px_rgba(0,242,254,0.10)]">
              <div className="flex items-center gap-2">
                <Wand2 size={18} className="text-[#00f2fe]" />
                <p className="text-[10px] font-black uppercase tracking-[4px] text-white/50">
                  Creator Studio
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { label: "Pitch a Series", icon: <PenSquare size={14} /> },
                  { label: "Upload Episode", icon: <Upload size={14} /> },
                  { label: "Build a Season", icon: <Layers3 size={14} /> },
                  { label: "Trailer Drop", icon: <Play size={14} /> },
                  { label: "Open Writer’s Room", icon: <BookOpen size={14} /> },
                  { label: "Scene Vault", icon: <Film size={14} /> },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full rounded-[20px] border border-white/10 bg-black/45 px-4 py-4 text-left text-[11px] font-black uppercase tracking-[3px] text-white/70 hover:bg-white/10 transition"
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="text-[#00f2fe]">{item.icon}</span>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_0_120px_rgba(0,242,254,0.10)]">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#00f2fe]" />
                <p className="text-[10px] font-black uppercase tracking-[4px] text-white/50">
                  Audience Reactions
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {["Moved", "Inspired", "Convicted", "Praying", "Need Part 2", "Saved"].map(
                  (label) => (
                    <button
                      key={label}
                      className="rounded-[18px] border border-[#00f2fe]/16 bg-black/45 px-4 py-4 text-[10px] font-black uppercase tracking-[3px] text-[#00f2fe]"
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_0_120px_rgba(0,242,254,0.10)]">
              <div className="flex items-center gap-2">
                <Clock3 size={18} className="text-[#00f2fe]" />
                <p className="text-[10px] font-black uppercase tracking-[4px] text-white/50">
                  Continue Watching
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {continueWatching.slice(0, 3).map((item) => (
                  <div
                    key={`cw-${item.id}`}
                    className="rounded-[18px] border border-white/10 bg-black/45 px-4 py-4"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[3px] text-white/80">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[3px] text-white/35">
                      {item.episode || item.type}
                    </p>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#00f2fe]/75"
                        style={{ width: `${item.progress || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}