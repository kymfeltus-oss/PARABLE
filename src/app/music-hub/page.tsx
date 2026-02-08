"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Category =
  | "Gospel Artists"
  | "Musicians"
  | "Choirs"
  | "Worshipers/ Worship Leaders"
  | "Producers";

const CATEGORIES: Category[] = [
  "Gospel Artists",
  "Musicians",
  "Choirs",
  "Worshipers/ Worship Leaders",
  "Producers",
];

type Card = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  glow?: boolean;
};

function frac(n: number) {
  return n - Math.floor(n);
}
function prand(seed: number) {
  return frac(Math.sin(seed * 9999.123) * 10000);
}

function SparklesLikeFlash() {
  // deterministic sparkles (no hydration mismatch)
  const sparkles = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const r1 = prand(i + 1);
      const r2 = prand(i + 101);
      const r3 = prand(i + 1001);
      const r4 = prand(i + 5001);
      return {
        id: i,
        left: `${r1 * 100}%`,
        top: `${r2 * 100}%`,
        delay: r3 * 1.4,
        dur: 4.3 + r4 * 3.4,
        size: 1 + Math.floor((i % 3) + 1),
        opacity: 0.28 + (i % 5) * 0.08,
      };
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-[#00f2fe] shadow-[0_0_14px_rgba(0,242,254,0.75)]"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `sparkFloat ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes sparkFloat {
          0% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: translate3d(0, -26px, 0) scale(1.1);
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(0, -54px, 0) scale(0.7);
            opacity: 0;
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
        "px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-[4px] transition",
        active
          ? "border-[#00f2fe]/35 bg-[#00f2fe]/14 text-[#00f2fe] shadow-[0_0_26px_rgba(0,242,254,0.14)]"
          : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/75",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-xl">
      <div className="text-[10px] font-black uppercase tracking-[4px] text-white/45">
        {label}
      </div>
      <div className="mt-1 text-[15px] font-black text-white/85">{value}</div>
    </div>
  );
}

function HubCard({ c }: { c: Card }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={[
        "relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] backdrop-blur-2xl",
        "shadow-[0_0_90px_rgba(0,242,254,0.10)]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_25%_25%,rgba(0,242,254,0.18),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.08),transparent_60%)]" />
      {c.glow && (
        <div className="pointer-events-none absolute -inset-10 opacity-[0.18] blur-3xl bg-[#00f2fe]" />
      )}

      <div className="relative p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#00f2fe] shadow-[0_0_18px_rgba(0,242,254,0.95)]" />
          <span className="text-[10px] font-black uppercase tracking-[4px] text-white/65">
            {c.tag}
          </span>
        </div>

        <div className="mt-4 text-[18px] font-black tracking-tight text-white">
          {c.title}
        </div>
        <div className="mt-1 text-sm text-white/60">{c.subtitle}</div>

        <div className="mt-5 flex items-center justify-between">
          <button className="rounded-[18px] border border-[#00f2fe]/25 bg-[#00f2fe]/12 px-4 py-3 text-[11px] font-black uppercase tracking-[4px] text-[#00f2fe] hover:bg-[#00f2fe]/18 transition">
            Explore
          </button>

          <button className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-black uppercase tracking-[4px] text-white/70 hover:bg-white/10 transition">
            Follow
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MusicHubPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category>("Gospel Artists");

  const cards = useMemo<Card[]>(() => {
    const base: Record<Category, Card[]> = {
      "Gospel Artists": [
        {
          id: "ga-1",
          title: "Featured Voices",
          subtitle: "Breakthrough worship + powerhouse leads.",
          tag: "Spotlight",
          glow: true,
        },
        {
          id: "ga-2",
          title: "Sunday Setlists",
          subtitle: "What churches are singing right now.",
          tag: "Trending",
        },
        {
          id: "ga-3",
          title: "New Releases",
          subtitle: "Fresh drops, live sessions, and remixes.",
          tag: "New",
        },
      ],
      Musicians: [
        {
          id: "m-1",
          title: "The Bandstand",
          subtitle: "Drums • Keys • Bass • Guitar • MDs.",
          tag: "Stage",
          glow: true,
        },
        {
          id: "m-2",
          title: "Chops & Runs",
          subtitle: "Micro-lessons and signature licks.",
          tag: "Learn",
        },
        {
          id: "m-3",
          title: "Session Ready",
          subtitle: "Charts, stems, and rehearsal packs.",
          tag: "Toolbox",
        },
      ],
      Choirs: [
        {
          id: "c-1",
          title: "Choir Rooms",
          subtitle: "Soprano to Bass — build the wall of sound.",
          tag: "Community",
          glow: true,
        },
        {
          id: "c-2",
          title: "Anthems",
          subtitle: "Classic gospel, modern praise, new choir flips.",
          tag: "Catalog",
        },
        {
          id: "c-3",
          title: "Director’s Corner",
          subtitle: "Warmups, blends, and rehearsal flow.",
          tag: "Practice",
        },
      ],
      "Worshipers/ Worship Leaders": [
        {
          id: "w-1",
          title: "Worship Flow",
          subtitle: "Build sets that carry the room.",
          tag: "Setlist",
          glow: true,
        },
        {
          id: "w-2",
          title: "Worship Leaders",
          subtitle: "Voices, teams, and rotations.",
          tag: "Leaders",
        },
        {
          id: "w-3",
          title: "Moments",
          subtitle: "Spontaneous worship + transitions.",
          tag: "Live",
        },
      ],
      Producers: [
        {
          id: "p-1",
          title: "Live Mix Lab",
          subtitle: "Capture the room. Keep it cinematic.",
          tag: "Studio",
          glow: true,
        },
        {
          id: "p-2",
          title: "Sound Libraries",
          subtitle: "Pads, risers, transitions for worship.",
          tag: "Packs",
        },
        {
          id: "p-3",
          title: "Release Ready",
          subtitle: "Mastering, cover art, and rollout prep.",
          tag: "Launch",
        },
      ],
    };

    const list = base[cat];
    if (!q.trim()) return list;

    const s = q.trim().toLowerCase();
    return list.filter(
      (x) =>
        x.title.toLowerCase().includes(s) ||
        x.subtitle.toLowerCase().includes(s) ||
        x.tag.toLowerCase().includes(s)
    );
  }, [cat, q]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* BACKDROP */}
      <div className="absolute inset-0">
        <div className="absolute inset-[-30%] opacity-[0.20] blur-[90px] animate-[ocean_16s_ease-in-out_infinite] bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,254,0.35),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.12),transparent_60%),radial-gradient(circle_at_40%_80%,rgba(0,242,254,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:84px_84px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.72)_58%,rgba(0,0,0,0.96)_100%)]" />
      </div>

      {/* Sparkles like Flash page (immediate) */}
      <SparklesLikeFlash />

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 pb-28 pt-10">
        {/* HEADER */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-[#00f2fe] shadow-[0_0_18px_rgba(0,242,254,0.9)]" />
              <span className="text-[11px] font-black uppercase tracking-[4px] text-white/70">
                Music Hub
              </span>
            </div>

            <h1 className="mt-5 text-[38px] sm:text-[52px] font-black leading-[1.02] tracking-tight">
              The Sound of the{" "}
              <span className="relative inline-block">
                <span className="absolute -inset-2 blur-2xl opacity-60 bg-[radial-gradient(circle_at_30%_40%,rgba(0,242,254,0.42),transparent_60%)]" />
                <span className="relative text-[#00f2fe] drop-shadow-[0_0_24px_rgba(0,242,254,0.55)]">
                  Sanctuary
                </span>
              </span>
            </h1>

            <p className="mt-4 text-white/65 max-w-[680px] text-[15px] leading-relaxed">
              Gospel artists and musicians aren’t “support” — they’re the pulse.
              Discover, follow, and build your sound.
            </p>
          </div>

          {/* mini brand tile */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 shadow-[0_0_120px_rgba(0,242,254,0.10)]">
            <div className="flex items-center gap-4">
              <div className="rounded-[22px] border border-white/10 bg-black/50 px-6 py-4">
                <Image
                  src="/logo.svg"
                  alt="Parable"
                  width={160}
                  height={42}
                  priority
                />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-[5px] text-white/50">
                  LIVE • SETLISTS • COMMUNITY
                </div>
                <div className="mt-2 h-[2px] w-full bg-gradient-to-r from-[#00f2fe]/0 via-[#00f2fe]/35 to-[#00f2fe]/0" />
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <div className="rounded-[28px] border border-white/10 bg-black/55 px-6 py-4 backdrop-blur-2xl shadow-[0_0_110px_rgba(0,242,254,0.10)]">
              <div className="text-[10px] font-black uppercase tracking-[4px] text-white/45">
                Search
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search rooms, artists, musicians, setlists…"
                className="mt-2 w-full bg-transparent text-[15px] outline-none placeholder:text-white/30"
                suppressHydrationWarning
              />
            </div>
          </div>

          <div className="md:col-span-5 flex flex-wrap gap-2 md:justify-end">
            {(["Gospel Artists", "Musicians", "Choirs", "Producers"] as Category[]).map(
              (x) => (
                <Pill key={x} active={cat === x} onClick={() => setCat(x)}>
                  {x}
                </Pill>
              )
            )}
          </div>
        </div>

        {/* STATS + ACTIONS */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-8 grid grid-cols-2 gap-4">
            <StatChip label="Live Rooms" value="Coming Online" />
            <StatChip label="Trending Setlists" value="Updating" />
          </div>

          <div className="md:col-span-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4 shadow-[0_0_110px_rgba(0,242,254,0.10)]">
              <button className="w-full rounded-[22px] bg-[#00f2fe] py-4 font-black text-black tracking-[3px] uppercase shadow-[0_0_30px_rgba(0,242,254,0.18)]">
                Start a Music Room
              </button>
              <div className="mt-3 text-[10px] font-black uppercase tracking-[4px] text-white/40 text-center">
                (Hook this to LiveKit later)
              </div>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={cat + q}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              {cards.map((c) => (
                <HubCard key={c.id} c={c} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* PLAYER SHELL */}
        <div className="mt-10 rounded-[34px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 shadow-[0_0_150px_rgba(0,242,254,0.12)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[4px] text-white/45">
                Now Playing
              </div>
              <div className="mt-2 text-[18px] font-black text-white">
                “Sanctuary Session” (Demo Player)
              </div>
              <div className="mt-1 text-sm text-white/60">
                This is a visual shell — wire it to uploads/streams when ready.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="rounded-[18px] border border-white/10 bg-black/55 px-5 py-3 text-[11px] font-black uppercase tracking-[4px] text-white/70 hover:bg-white/10 transition">
                Prev
              </button>
              <button className="rounded-[18px] bg-[#00f2fe] px-7 py-3 text-[11px] font-black uppercase tracking-[4px] text-black shadow-[0_0_28px_rgba(0,242,254,0.18)]">
                Play
              </button>
              <button className="rounded-[18px] border border-white/10 bg-black/55 px-5 py-3 text-[11px] font-black uppercase tracking-[4px] text-white/70 hover:bg-white/10 transition">
                Next
              </button>
            </div>
          </div>

          <div className="mt-6 h-[2px] w-full bg-gradient-to-r from-transparent via-[#00f2fe]/30 to-transparent" />
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[34%] bg-[#00f2fe]/70" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[3px] text-white/45">
              01:12 / 03:18
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ocean {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(2%, -2%, 0) rotate(6deg);
          }
        }
      `}</style>
    </div>
  );
}
