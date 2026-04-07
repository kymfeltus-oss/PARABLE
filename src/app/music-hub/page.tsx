"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Camera,
  ChevronRight,
  Coins,
  Cpu,
  Disc3,
  Flame,
  HandCoins,
  Headphones,
  Layers,
  MapPin,
  Mic2,
  Play,
  Radio,
  ShoppingBag,
  Sparkles,
  Ticket,
  Video,
} from "lucide-react";

const SECTIONS = [
  { id: "main-stage", label: "Stage", short: "Live" },
  { id: "shed-room", label: "Shed", short: "Shed" },
  { id: "open-mic", label: "Open mic", short: "Mic" },
  { id: "dashboard", label: "Artist OS", short: "OS" },
  { id: "rolodex", label: "Sessions", short: "Book" },
  { id: "ai-architect", label: "AI", short: "AI" },
  { id: "merch", label: "Merch", short: "Shop" },
  { id: "sponsors", label: "Impact", short: "Give" },
] as const;

function GradientFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-[22px] bg-gradient-to-br from-[#00f2ff]/35 via-fuchsia-500/15 to-amber-400/25 p-[1px] shadow-[0_20px_60px_rgba(0,242,255,0.08)]",
        className,
      ].join(" ")}
    >
      <div className="rounded-[21px] bg-[#0a0a0d]/95 backdrop-blur-xl">{children}</div>
    </div>
  );
}

function SectionShell({
  id,
  icon,
  eyebrow,
  title,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-24"
    >
      <GradientFrame>
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00f2ff]/25 to-violet-600/20 text-[#00f2ff] shadow-inner shadow-black/40">
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f2ff]">{eyebrow}</p>
              <h2 className="mt-1 text-lg font-black leading-tight text-white">{title}</h2>
            </div>
          </div>
          <div className="mt-5 space-y-4 text-[13px] leading-relaxed text-white/70">{children}</div>
        </div>
      </GradientFrame>
    </motion.section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#00f2ff] to-cyan-400 shadow-[0_0_8px_#00f2ff]" />
      <span>{children}</span>
    </li>
  );
}

function TierCard({
  name,
  body,
  accent,
}: {
  name: string;
  body: string;
  accent: "cyan" | "amber" | "violet";
}) {
  const ring =
    accent === "cyan"
      ? "from-[#00f2ff]/30 to-cyan-600/10 border-[#00f2ff]/25"
      : accent === "amber"
        ? "from-amber-400/25 to-orange-600/10 border-amber-400/25"
        : "from-violet-400/25 to-fuchsia-600/10 border-violet-400/25";
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-b px-4 py-3.5 ${ring} shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`}
    >
      <p className="text-[11px] font-black uppercase tracking-widest text-white">{name}</p>
      <p className="mt-1.5 text-[12px] leading-snug text-white/55">{body}</p>
    </div>
  );
}

function LiveCard({
  title,
  meta,
  tint,
}: {
  title: string;
  meta: string;
  tint: "cyan" | "violet" | "amber";
}) {
  const bg =
    tint === "cyan"
      ? "from-[#00f2ff]/20 via-[#0a1620] to-[#050508]"
      : tint === "violet"
        ? "from-fuchsia-500/20 via-[#140a18] to-[#050508]"
        : "from-amber-500/15 via-[#181005] to-[#050508]";
  return (
    <div
      className={`min-w-[220px] max-w-[240px] snap-start overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${bg} p-4 shadow-lg`}
    >
      <div className="flex items-center justify-between gap-2">
        <Flame className="text-white/30" size={18} />
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-50" />
          <span className="relative h-2 w-2 rounded-full bg-red-500" />
        </span>
      </div>
      <p className="mt-3 text-[12px] font-black uppercase leading-snug tracking-wide text-white">{title}</p>
      <p className="mt-2 text-[11px] font-bold text-[#00f2ff]">{meta}</p>
      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-white/10 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white/15"
      >
        Tune in <ChevronRight size={14} />
      </button>
    </div>
  );
}

/** Decorative bars for hero / player */
function WaveBars() {
  const heights = [40, 65, 35, 80, 50, 90, 45, 70, 38, 85, 55, 72, 42, 88];
  return (
    <div className="flex h-14 items-end justify-center gap-0.5 opacity-40">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-[#00f2ff] to-violet-400"
          style={{ height: `${h}%`, animation: `hubBar 1.2s ease-in-out ${i * 0.06}s infinite alternate` }}
        />
      ))}
      <style jsx global>{`
        @keyframes hubBar {
          from {
            transform: scaleY(0.35);
          }
          to {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}

export default function MusicHubPage() {
  const [navHighlight, setNavHighlight] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => Boolean(n)
    );
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = hit?.target.id;
        if (id) setNavHighlight(id);
      },
      { root: null, rootMargin: "-38% 0px -38% 0px", threshold: [0, 0.12, 0.28] }
    );
    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#050506] pb-32 text-white">
      {/* Hero */}
      <div className="relative px-4 pt-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_90%_80%_at_50%_-20%,rgba(0,242,255,0.22),transparent),radial-gradient(ellipse_60%_50%_at_100%_0%,rgba(167,139,250,0.12),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <GradientFrame className="relative">
            <div className="px-5 pb-5 pt-6">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00f2ff]/30 bg-[#00f2ff]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#a5f3fc]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f2ff] opacity-40" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-[#00f2ff]" />
                  </span>
                  Residency live
                </span>
                <Sparkles className="text-amber-200/80" size={22} strokeWidth={1.5} />
              </div>

              <h1 className="mt-4 text-[1.65rem] font-black leading-[1.1] tracking-tight text-white">
                Your stage.
                <br />
                <span className="bg-gradient-to-r from-[#00f2ff] via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                  Your masters.
                </span>
              </h1>

              <p className="mt-3 text-[13px] leading-relaxed text-white/60">
                Ticketed concerts, Shed Rooms, merch that never makes fans leave the stream—and tools that turn tonight&apos;s
                jam into tomorrow&apos;s chart pack.
              </p>

              <WaveBars />

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { k: "Live now", v: "48", sub: "sheds" },
                  { k: "RSVP", v: "12k", sub: "this week" },
                  { k: "Paid out", v: "$", sub: "instant" },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="rounded-xl border border-white/10 bg-black/40 px-2 py-3 text-center shadow-inner"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">{s.k}</p>
                    <p className="mt-1 text-lg font-black tabular-nums text-white">{s.v}</p>
                    <p className="text-[9px] text-[#00f2ff]/80">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/voices-of-praise"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00f2ff] to-cyan-400 py-3.5 text-[11px] font-black uppercase tracking-widest text-black shadow-[0_8px_24px_rgba(0,242,255,0.35)] transition hover:brightness-110"
                >
                  <Mic2 size={18} strokeWidth={2.5} />
                  Vocal rooms
                </Link>
                <Link
                  href="/streamers"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3.5 text-[11px] font-black uppercase tracking-widest text-white transition hover:border-[#00f2ff]/35 hover:bg-white/[0.08]"
                >
                  <Radio size={18} />
                  Stream hub
                </Link>
              </div>
              <Link
                href="/gaming"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/50 transition hover:border-[#00f2ff]/30 hover:text-[#00f2ff]"
              >
                In-world radio & games
                <ChevronRight size={16} />
              </Link>
            </div>
          </GradientFrame>
        </motion.div>

        {/* Section chips */}
        <div className="sticky top-0 z-20 mt-6 -mx-4 border-y border-white/[0.07] bg-[#050506]/90 py-3 backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={[
                  "shrink-0 rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition active:scale-[0.98]",
                  navHighlight === s.id
                    ? "bg-[#00f2ff] text-black shadow-[0_0_20px_rgba(0,242,255,0.35)]"
                    : "border border-white/10 bg-white/[0.06] text-white/55 hover:border-[#00f2ff]/25 hover:text-white",
                ].join(" ")}
              >
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Happening now — horizontal carousel */}
        <div className="mt-6">
          <div className="mb-3 flex items-end justify-between px-0.5">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/90">Happening now</h2>
            <span className="text-[10px] font-bold text-white/35">Swipe</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <LiveCard title="Open Shed — keys & organ" meta="LIVE · 184 watching" tint="cyan" />
            <LiveCard title="Masterclass Shed" meta="Ticketed · 42 inside" tint="violet" />
            <LiveCard title="Main Stage rehearsal" meta="Countdown · 12.4k RSVP" tint="amber" />
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <SectionShell
            id="main-stage"
            icon={<Ticket size={22} strokeWidth={1.75} />}
            eyebrow="Ticketed live"
            title="Main Stage — concerts & launches"
          >
            <p>Full-scale worship with tiers that reward the room—not just the feed.</p>
            <div className="grid gap-3">
              <TierCard name="Front Row" body="Backstage chat while the stream runs." accent="cyan" />
              <TierCard name="General Admission" body="Crystal-clear standard stream." accent="amber" />
              <TierCard name="VIP" body="Meet-and-greet or limited Imago skin." accent="violet" />
            </div>
            <ul className="space-y-2.5">
              <Bullet>
                <strong className="text-white">Cinema-View:</strong> 4K / 60fps-class pipeline, low latency.
              </Bullet>
              <Bullet>
                <strong className="text-white">Multi-cam director:</strong> lead vocal, drums, or full stage.
              </Bullet>
              <Bullet>
                <strong className="text-white">Spatial audio:</strong> stand in the center of the mix.
              </Bullet>
            </ul>
          </SectionShell>

          <SectionShell
            id="shed-room"
            icon={<Headphones size={22} strokeWidth={1.75} />}
            eyebrow="Musician playground"
            title="Shed Room Hub"
          >
            <p>Open sheds for the culture; ticketed sheds for the lesson. Jam-Sync keeps pockets tight across cities.</p>
            <ul className="space-y-2.5">
              <Bullet>
                <strong className="text-white">Section rooms:</strong> soprano / alto / tenor—Listener Passes for fans.
              </Bullet>
            </ul>
            <div className="rounded-2xl border border-[#00f2ff]/20 bg-gradient-to-br from-[#00f2ff]/[0.08] to-transparent p-4">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00f2ff]">
                <Video size={15} /> Director&apos;s toggle
              </p>
              <ul className="mt-3 space-y-2">
                <Bullet>
                  <strong className="text-white">Hands-Cam</strong> for fretboard & keys.
                </Bullet>
                <Bullet>
                  <strong className="text-white">Gear overlay</strong> — patches & pedals on-screen.
                </Bullet>
              </ul>
            </div>
          </SectionShell>

          <SectionShell
            id="open-mic"
            icon={<Mic2 size={22} strokeWidth={1.75} />}
            eyebrow="Join-in"
            title="Open Mic & matchmaking"
          >
            <ul className="space-y-2.5">
              <Bullet>
                <strong className="text-white">Stage-Request:</strong> host accepts → your AV merges for hand-offs or battles.
              </Bullet>
              <Bullet>
                <strong className="text-white">Smart sidebar:</strong> sheds match your Imago instruments.
              </Bullet>
            </ul>
          </SectionShell>

          <SectionShell
            id="dashboard"
            icon={<Layers size={22} strokeWidth={1.75} />}
            eyebrow="Command center"
            title="Artist OS"
          >
            <ul className="space-y-2.5">
              <Bullet>
                <strong className="text-white">Legacy vault</strong> — subscription archives you control.
              </Bullet>
              <Bullet>
                <strong className="text-white">Merch + Imago</strong> — gear that shows up in{" "}
                <Link href="/gaming" className="text-[#00f2ff] underline-offset-2 hover:underline">
                  games
                </Link>
                .
              </Bullet>
              <Bullet>
                <strong className="text-white">Instant payouts</strong> — Stripe + Supabase ledger.
              </Bullet>
              <Bullet>
                <strong className="text-white">Fan analytics & splits</strong> — thank VIPs, auto-split collabs.
              </Bullet>
            </ul>
          </SectionShell>

          <SectionShell
            id="rolodex"
            icon={<BadgeCheck size={22} strokeWidth={1.75} />}
            eyebrow="Hire"
            title="Session Musician Rolodex"
          >
            <ul className="space-y-2.5">
              <Bullet>
                <strong className="text-white">Verified</strong> credits and tours on-profile.
              </Bullet>
              <Bullet>
                <strong className="text-white">Book for session</strong> without leaving PARABLE.
              </Bullet>
              <Bullet>
                <strong className="text-white">Ticketed auditions</strong> for real slots.
              </Bullet>
            </ul>
          </SectionShell>

          <SectionShell
            id="ai-architect"
            icon={<Cpu size={22} strokeWidth={1.75} />}
            eyebrow="Jam → asset"
            title="AI Architect"
          >
            <p>Real-time listening: charts, MIDI, tabs—ready when the Shed ends.</p>
            <div className="flex flex-wrap gap-2">
              {["Web Audio API", "Essentia / TF.js", "session_assets JSON"].map((t) => (
                <span
                  key={t}
                  className="rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white/45"
                >
                  {t}
                </span>
              ))}
            </div>
          </SectionShell>

          <SectionShell
            id="merch"
            icon={<ShoppingBag size={22} strokeWidth={1.75} />}
            eyebrow="Live commerce"
            title="Virtual Merch Table"
          >
            <ul className="space-y-2.5">
              <Bullet>
                <strong className="text-white">Flash drops</strong> — timers, scarcity bars, hype overlays.
              </Bullet>
              <Bullet>
                <strong className="text-white">Digital unbox</strong> → <code className="text-[#00f2ff]">imago_inventory</code>.
              </Bullet>
              <Bullet>
                <strong className="text-white">Bundles & VIP box office</strong> — cart slides over the 4K player.
              </Bullet>
            </ul>
          </SectionShell>

          <SectionShell
            id="sponsors"
            icon={<HandCoins size={22} strokeWidth={1.75} />}
            eyebrow="Impact"
            title="Ministry partners"
          >
            <p>
              Funded Outreach Ops in{" "}
              <Link href="/gaming" className="text-[#00f2ff] underline-offset-2 hover:underline">
                The Narrow Road
              </Link>{" "}
              — gameplay that triggers real giving.
            </p>
            <ul className="space-y-2.5">
              <Bullet>
                <strong className="text-white">Bounties & Proof of Impact</strong> toasts.
              </Bullet>
              <Bullet>
                <strong className="text-white">Partner dashboards</strong> + seasonal worlds.
              </Bullet>
            </ul>
            <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] text-white/45">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#00f2ff]" />
              <span>
                Pipeline: completion → partner webhook + <code className="text-white/55">world_influence</code> + waypoint
                branding.
              </span>
            </div>
          </SectionShell>
        </div>

        {/* Portfolio */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <GradientFrame>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#00f2ff]" size={20} />
                <h3 className="text-base font-black text-white">Legacy portfolio</h3>
              </div>
              <p className="mt-2 text-[12px] text-white/55">
                Every Shed and concert becomes résumé: skills, pitch stats, stems, optional collectibles.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { icon: <Disc3 size={16} />, t: "Stems", d: "Sell packs · license for Testify." },
                  { icon: <Camera size={16} />, t: "Venue skins", d: "3D stages you own." },
                  { icon: <Coins size={16} />, t: "Seeds", d: "One ledger for gifts & tickets." },
                  { icon: <Radio size={16} />, t: "Huddles", d: "Licensed beds, royalties to you." },
                ].map((x) => (
                  <div key={x.t} className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <span className="text-[#00f2ff]">{x.icon}</span>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-white">{x.t}</p>
                    <p className="mt-1 text-[10px] leading-snug text-white/45">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </GradientFrame>
        </motion.div>

        {/* Mini player */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#111118] via-[#0a0a10] to-[#111118] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00f2ff] text-black shadow-[0_0_24px_rgba(0,242,255,0.4)] transition hover:scale-105 active:scale-95"
              aria-label="Play demo"
            >
              <Play size={22} className="ml-0.5" fill="currentColor" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Now playing</p>
              <p className="truncate text-sm font-black text-white">Sanctuary session (demo)</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-[#00f2ff] to-violet-400" />
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] text-white/35">Full Main Stage player + merch drawer ship next.</p>
        </div>
      </div>
    </div>
  );
}
