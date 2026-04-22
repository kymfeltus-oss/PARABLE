"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  BookOpen,
  Box,
  ClipboardCheck,
  Copy,
  Cross,
  Gamepad2,
  Headphones,
  LineChart,
  Mic2,
  Radio,
  Shield,
  Sparkles,
  Users,
  Volume2,
  X,
} from "lucide-react";

const BLESSINGS = [
  "Sarah just helped a new player in Minecraft! +10 Praise",
  "James hosted a voice lobby for youth group · +25 Praise",
  "Elena completed Daily Bible Challenge streak · +15 Praise",
  "Marcus shared server rules with a newcomer · +8 Praise",
  "The Fellowship Roblox room hit 12 visitors tonight · +30 Praise",
  "Noah invited a friend to Sanctuary voice · +12 Praise",
];

const MARKET_LINES = [
  { label: "Minecraft · Sanctuary", value: "24 / 50 players", hot: true },
  { label: "Roblox · Fellowship world", value: "Online · peak 1.2k", hot: true },
  { label: "Voice lobbies", value: "6 rooms live", hot: false },
  { label: "Arcade queue", value: "Low latency", hot: false },
];

function getPublicEnv(key: string): string {
  if (typeof process === "undefined" || !process.env) return "";
  return (process.env[key] as string | undefined) ?? "";
}

const MC_IP =
  getPublicEnv("NEXT_PUBLIC_MINECRAFT_SERVER_IP") || "sanctuary.parable.example";
const ROBLOX_PLACE_ID = getPublicEnv("NEXT_PUBLIC_ROBLOX_PLACE_ID");
const VOICE_LOBBY_URL =
  getPublicEnv("NEXT_PUBLIC_GAMING_VOICE_LOBBY_URL") || "https://discord.com/";
const WORDLE_EMBED_URL =
  getPublicEnv("NEXT_PUBLIC_WORDLE_EMBED_URL") || "https://www.wordle.com";

function robloxWebUrl(): string {
  if (!ROBLOX_PLACE_ID) return "https://www.roblox.com/";
  return `https://www.roblox.com/games/${ROBLOX_PLACE_ID}`;
}

function robloxDeepLink(): string {
  if (!ROBLOX_PLACE_ID) return "https://www.roblox.com/";
  return `roblox://placeId=${ROBLOX_PLACE_ID}`;
}

function BlessingTicker({ className }: { className?: string }) {
  const doubled = useMemo(() => [...BLESSINGS, ...BLESSINGS], []);
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-white/[0.06] bg-black/40 py-1.5 ${className ?? ""}`}
    >
      <div className="animate-marquee flex gap-10 whitespace-nowrap px-3">
        {doubled.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#00f2ff]/90">
            <Sparkles size={11} className="shrink-0 text-amber-300/90" aria-hidden />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function HubCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/50 shadow-[0_0_40px_rgba(0,242,255,0.06)] backdrop-blur-md ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(ellipse_at_20%_0%,#00f2ff,transparent_50%)]" />
      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <Icon size={20} className="text-[#00f2ff]" strokeWidth={1.35} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-white sm:text-base">{title}</h2>
              {subtitle ? <p className="mt-0.5 text-[11px] text-white/45">{subtitle}</p> : null}
            </div>
          </div>
        </div>
        <BlessingTicker className="mb-4 shrink-0" />
        <div className="relative flex min-h-0 flex-1 flex-col gap-3">{children}</div>
      </div>
    </section>
  );
}

const TRIVIA_Q = [
  { q: "Who was thrown into the lions’ den?", a: ["Jonah", "Daniel", "David"], c: 1 },
  { q: "How many books are in the New Testament?", a: ["27", "39", "66"], c: 0 },
  { q: "“Faith, hope, love” — which is the greatest?", a: ["Faith", "Hope", "Love"], c: 2 },
];

function DailyBibleChallenge() {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const q = TRIVIA_Q[i]!;

  const pick = (idx: number) => {
    if (idx === q.c) setScore((s) => s + 1);
    setI((x) => (x + 1) % TRIVIA_Q.length);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f2ff]/80">Daily Bible Challenge</p>
      <p className="mt-2 text-sm font-semibold text-white/90">{q.q}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {q.a.map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => pick(idx)}
            className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs font-semibold text-white/85 transition hover:border-[#00f2ff]/45 hover:text-[#00f2ff]"
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-white/40">
        Score <span className="font-mono text-[#00f2ff]">{score}</span> · tap any answer to continue
      </p>
    </div>
  );
}

function SanctuaryRulesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] max-h-[min(90vh,560px)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#00f2ff]/35 bg-[#0a0c10] p-5 shadow-[0_0_60px_rgba(0,242,255,0.15)]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="text-[#00f2ff]" size={22} />
            <h2 id={titleId} className="text-lg font-bold text-white">
              Sanctuary Server Rules
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 p-1.5 text-white/60 transition hover:border-[#00f2ff]/40 hover:text-[#00f2ff]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mt-2 text-xs text-white/50">
          Our Minecraft realm is moderated for a Christ-honoring experience. Respect staff and players.
        </p>
        <ul className="mt-4 space-y-2.5 text-sm text-white/75">
          <li className="flex gap-2">
            <Cross className="mt-0.5 shrink-0 text-[#00f2ff]" size={16} aria-hidden />
            No harassment, hate, or explicit content — warnings, then removal.
          </li>
          <li className="flex gap-2">
            <Cross className="mt-0.5 shrink-0 text-[#00f2ff]" size={16} aria-hidden />
            No griefing spawn or ministry builds; ask before PvP outside designated zones.
          </li>
          <li className="flex gap-2">
            <Cross className="mt-0.5 shrink-0 text-[#00f2ff]" size={16} aria-hidden />
            Share Scripture kindly; debates stay peaceful — staff may redirect channels.
          </li>
          <li className="flex gap-2">
            <Cross className="mt-0.5 shrink-0 text-[#00f2ff]" size={16} aria-hidden />
            Copy the server IP from the hub, then Multiplayer → Direct Connection or Add Server in Minecraft.
          </li>
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#00f2ff] py-2.5 text-sm font-bold text-black transition hover:brightness-110"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

/**
 * Parable Gamers Hub — bento command center: portals, voice, arcade, market stats,
 * Minecraft copy-IP + rules modal, Roblox deep link, blessing tickers on every card.
 */
export default function GamersHub() {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [arcadeTab, setArcadeTab] = useState<"trivia" | "wordle">("trivia");

  const copyIp = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(MC_IP);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <div className="w-full min-w-0">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-[#00f2ff]">
          <Gamepad2 size={26} strokeWidth={1.25} aria-hidden />
          <span className="text-[10px] font-black uppercase tracking-[0.32em] text-white/40">
            Parable Gamers Hub
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Command center for{" "}
          <span className="text-[#00f2ff]">fellowship & play</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
          Active portals, voice coordination, mini-games, and live market stats — unified in one neon-cyan surface.
          External titles launch via copy-IP (Minecraft) and deep links (Roblox).
        </p>
      </header>

      <div className="grid auto-rows-min gap-4 lg:grid-cols-12">
        {/* Active Portals — wide + tall */}
        <HubCard
          title="Active Portals"
          subtitle="Private moderated worlds · Minecraft & Roblox"
          icon={Box}
          className="lg:col-span-7 lg:row-span-2 min-h-[280px]"
        >
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-white">
                <Box size={18} className="text-[#00f2ff]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">Minecraft</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-white/45">
                Copy the IP, then Minecraft → Multiplayer → Add Server. Staff moderate for a Christian environment.
              </p>
              <code className="mt-3 truncate rounded-lg border border-[#00f2ff]/25 bg-black/60 px-2 py-1.5 font-mono text-[11px] text-[#00f2ff]">
                {MC_IP}
              </code>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyIp()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#00f2ff] px-3 py-2.5 text-xs font-bold text-black transition hover:brightness-110 sm:flex-none"
                >
                  <Copy size={14} aria-hidden />
                  {copied ? "Copied!" : "Copy IP"}
                </button>
                <button
                  type="button"
                  onClick={() => setRulesOpen(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#00f2ff]/40 bg-[#00f2ff]/10 px-3 py-2.5 text-xs font-bold text-[#00f2ff] transition hover:bg-[#00f2ff]/20 sm:flex-none"
                >
                  <Shield size={14} aria-hidden />
                  Server rules
                </button>
              </div>
              <p className="mt-3 text-[10px] text-white/35">
                Env: <span className="font-mono">NEXT_PUBLIC_MINECRAFT_SERVER_IP</span>
              </p>
            </div>

            <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-white">
                <Gamepad2 size={18} className="text-fuchsia-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">Roblox</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-white/45">
                Opens the Roblox app or web experience for our fellowship world (configure place ID in env).
              </p>
              <div className="mt-auto flex flex-col gap-2 pt-3">
                <a
                  href={robloxDeepLink()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-lg transition hover:brightness-110"
                >
                  Enter Sanctuary World
                </a>
                <a
                  href={robloxWebUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-[10px] font-semibold text-[#00f2ff]/80 underline-offset-2 hover:underline"
                >
                  Open in browser instead
                </a>
              </div>
              <p className="mt-2 text-[10px] text-white/35">
                Env: <span className="font-mono">NEXT_PUBLIC_ROBLOX_PLACE_ID</span>
              </p>
            </div>
          </div>
        </HubCard>

        {/* Market stats */}
        <HubCard title="Market Stats" subtitle="Live read on community servers" icon={LineChart} className="lg:col-span-5">
          <div className="space-y-2">
            {MARKET_LINES.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-black/35 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-white/85">{row.label}</p>
                  <p className="text-[10px] text-white/40">Ticker · demo values</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {row.hot ? (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f2ff] opacity-50" />
                      <span className="relative h-2 w-2 rounded-full bg-[#00f2ff]" />
                    </span>
                  ) : null}
                  <span className="text-xs font-mono text-[#00f2ff]">{row.value}</span>
                </div>
              </div>
            ))}
          </div>
        </HubCard>

        {/* Fellowship lobbies */}
        <HubCard
          title="Fellowship Lobbies"
          subtitle="Discord-style voice & text for squads"
          icon={Headphones}
          className="lg:col-span-5"
        >
          <p className="text-sm text-white/50">
            Jump into a hosted voice room for raids, builds, and prayer before the match.
          </p>
          <a
            href={VOICE_LOBBY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#00f2ff]/40 bg-[#00f2ff]/10 py-3 text-sm font-bold text-[#00f2ff] transition hover:bg-[#00f2ff]/20"
          >
            <Mic2 size={18} aria-hidden />
            Join Voice Chat
          </a>
          <p className="text-[10px] text-white/35">
            Set <span className="font-mono">NEXT_PUBLIC_GAMING_VOICE_LOBBY_URL</span> (e.g. Discord invite).
          </p>
        </HubCard>

        {/* Mini-game arcade */}
        <HubCard
          title="Mini-Game Arcade"
          subtitle="Bible trivia in-app · Wordle embed"
          icon={Radio}
          className="lg:col-span-12 min-h-[260px]"
        >
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setArcadeTab("trivia")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                arcadeTab === "trivia"
                  ? "bg-[#00f2ff] text-black"
                  : "border border-white/15 bg-black/40 text-white/60 hover:border-[#00f2ff]/35"
              }`}
            >
              <BookOpen className="mr-1 inline" size={12} aria-hidden />
              Bible trivia
            </button>
            <button
              type="button"
              onClick={() => setArcadeTab("wordle")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                arcadeTab === "wordle"
                  ? "bg-[#00f2ff] text-black"
                  : "border border-white/15 bg-black/40 text-white/60 hover:border-[#00f2ff]/35"
              }`}
            >
              Wordle
            </button>
          </div>

          {arcadeTab === "trivia" ? (
            <DailyBibleChallenge />
          ) : (
            <div className="flex min-h-[200px] flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/60">
              <iframe
                title="Wordle embed"
                src={WORDLE_EMBED_URL}
                className="min-h-[200px] w-full flex-1 border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
                loading="lazy"
              />
              <p className="border-t border-white/[0.06] px-2 py-1.5 text-[9px] text-white/35">
                Override embed via <span className="font-mono">NEXT_PUBLIC_WORDLE_EMBED_URL</span>. If the frame is
                blocked, use{" "}
                <a className="text-[#00f2ff] underline" href={WORDLE_EMBED_URL} target="_blank" rel="noreferrer">
                  open in new tab
                </a>
                .
              </p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/45">
              <Volume2 size={12} className="text-[#00f2ff]" aria-hidden />
              Play Now · {arcadeTab === "trivia" ? "in hub" : "iframe"}
            </span>
          </div>
        </HubCard>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-white/45">
          <Users size={16} className="text-[#00f2ff]" aria-hidden />
          <span>Need the full launcher? </span>
          <Link href="/play" className="font-semibold text-[#00f2ff] hover:underline">
            Parable Play
          </Link>
        </div>
        <Link
          href="/streamers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 transition hover:text-[#00f2ff]"
        >
          <ClipboardCheck size={14} aria-hidden />
          Streamers hub
        </Link>
      </div>

      <SanctuaryRulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
