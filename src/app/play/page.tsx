'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Cloud,
  Cpu,
  Flame,
  Gamepad2,
  Headphones,
  Landmark,
  Megaphone,
  Mic,
  Sparkles,
  Trophy,
  Users,
  Video,
} from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';
import KingdomXpBar from '@/components/launcher/KingdomXpBar';
import PreGameStreamPip from '@/components/launcher/PreGameStreamPip';
import SquadUpPanel from '@/components/launcher/SquadUpPanel';
import ControllerStatusPill from '@/components/launcher/ControllerStatusPill';
import UniversalInventoryStrip from '@/components/launcher/UniversalInventoryStrip';
import { ActivityGameTile } from '@/components/gaming/ActivityGameChrome';
import { PLAY_GAMES, playHref } from '@/lib/play-catalog';

export default function ParablePlayLauncherPage() {
  return (
    <div className="relative min-h-screen bg-[#030306] text-white pb-28">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HubBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00f2ff]/[0.05] via-transparent to-black" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-12 pt-parable-header sm:px-4">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-[#00f2ff]">
            <Gamepad2 size={26} strokeWidth={1.25} />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Parable Play</span>
          </div>
          <h1 className="mt-3 break-words text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-3xl">
            Unified game launcher
            <span className="text-[#00f2ff]"> · feed, stream, squad</span>
          </h1>
          <p className="mt-4 text-sm text-white/55 max-w-2xl leading-relaxed">
            Jump from a live ministry moment into a playable session without leaving PARABLE. This hub is the bridge: featured
            pre-game streams, cloud-ready slots, squad invites, and one profile that carries Kingdom XP and gear across modes.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <ControllerStatusPill />
            <Link
              href="/streamer-hub"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:border-[#00f2ff]/40 hover:text-[#00f2ff] transition-colors"
            >
              <Video size={14} />
              Join match (hub)
            </Link>
            <Link
              href="/play/engine"
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-200 hover:border-violet-400/50 transition-colors"
            >
              <Cpu size={14} />
              Engine lab (WebGPU)
            </Link>
          </div>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.12] via-black/50 to-[#00f2ff]/[0.06] p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 w-full max-w-full">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-300/90">Games for the web · GPU first</p>
              <h2 className="mt-2 text-lg sm:text-xl font-bold text-white tracking-tight">
                3D engine path (not blue-grid mini-games)
              </h2>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">
                Compete-tier visuals and physics live in a <strong className="text-white/80 font-semibold">Three.js WebGPU</strong> scene with PBR materials,
                then Rapier/Ammo, pro-stick input, and Supabase-backed authority for real scores. The 2D demos are placeholders; this is the build target.
              </p>
              <p className="mt-2 text-[11px] text-white/35">
                Blueprint: <code className="text-white/50">docs/GAMING_AAA_ARCHITECTURE.md</code>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Link
                href="/play/engine"
                className="inline-flex items-center justify-center rounded-xl border border-[#00f2ff]/50 bg-[#00f2ff]/15 px-5 py-2.5 text-sm font-bold text-[#00f2ff] hover:bg-[#00f2ff]/25 transition-colors"
              >
                Open engine lab
              </Link>
              <Link
                href="/imago"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-white/80 hover:border-violet-400/35 transition-colors"
              >
                Imago pipeline
              </Link>
            </div>
          </div>
        </motion.section>

        <div className="mb-8">
          <KingdomXpBar />
        </div>

        <div className="mb-8">
          <UniversalInventoryStrip />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-black/40 to-orange-500/5 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/35 bg-black/40">
              <Flame className="text-amber-400" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-200/70">World event · sermon to quest</p>
              <p className="mt-1 text-base font-semibold text-white">Siege of Jericho — live in Armor Up</p>
              <p className="mt-1 text-sm text-white/55">
                2× Kingdom XP for the next hour when you queue from this notification pipeline (backend wiring hooks here).
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={playHref('armor-up')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/25 transition-colors"
                >
                  Enter event
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/browse"
                  className="inline-flex items-center rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/75 hover:border-white/25 transition-colors"
                >
                  Back to live feed
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section aria-label="Launch games">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/45">Play now</h2>
                <Link href="/gaming" className="text-[11px] text-[#00f2ff] hover:underline font-semibold">
                  Full vision specs
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {PLAY_GAMES.map((g, i) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ActivityGameTile
                      title={g.title}
                      tag={g.tag}
                      shortBlurb={g.shortBlurb}
                      href={playHref(g.id)}
                      accentBarClass={g.accentBar}
                      bannerFrom={g.bannerFrom}
                      bannerTo={g.bannerTo}
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-black/35 backdrop-blur-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[#00f2ff] mb-3">
                <Cloud size={18} />
                <h2 className="text-sm font-bold text-white">Cloud streaming layer</h2>
              </div>
              <p className="text-sm text-white/55 leading-relaxed">
                Kingdom Hoops and Gridiron Glory are tagged for instant cloud sessions on mobile and web—no 100GB install.
                Wire your provider (GeForce NOW–class, custom pixel streaming, or console share) behind the &quot;Cloud slot&quot;
                badge; this UI reserves the player journey and telemetry hooks.
              </p>
            </section>

            <PreGameStreamPip />

            <section className="rounded-2xl border border-white/[0.08] bg-black/35 backdrop-blur-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Headphones className="text-[#00f2ff]" size={18} />
                <h2 className="text-sm font-bold text-white">Huddle voice · spatial audio</h2>
              </div>
              <p className="text-sm text-white/55 leading-relaxed">
                Low-latency party chat with distance falloff pairs with The Narrow Road convoys and squad modes. Connect your
                real-time stack (WebRTC + server mix) to the same presence graph as the sidebar.
              </p>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 self-start">
            <SquadUpPanel />
            <div className="rounded-2xl border border-white/[0.1] bg-black/50 backdrop-blur-md p-4">
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <Sparkles className="text-[#00f2ff]" size={16} />
                <p className="text-sm font-semibold">Imago locker</p>
              </div>
              <p className="text-xs text-white/45 leading-relaxed mb-3">
                One avatar for feed, courts, and the metropolis—loadouts, aura, and Armor of God overlays.
              </p>
              <Link
                href="/imago"
                className="inline-flex w-full justify-center rounded-xl border border-[#00f2ff]/40 bg-[#00f2ff]/10 py-2.5 text-xs font-bold text-[#00f2ff] hover:bg-[#00f2ff]/20 transition-colors"
              >
                Open Imago
              </Link>
            </div>
            <div className="rounded-2xl border border-white/[0.1] bg-black/50 backdrop-blur-md p-4">
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <Mic className="text-fuchsia-400 shrink-0" size={16} strokeWidth={1.5} />
                <p className="text-sm font-semibold">Voices of Praise</p>
              </div>
              <p className="text-xs text-white/45 leading-relaxed mb-3">
                Studio karaoke, duels, and live rooms that inherit your Imago emotes and musician-backed tracks.
              </p>
              <Link
                href="/voices-of-praise"
                className="inline-flex w-full justify-center rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 py-2.5 text-xs font-bold text-fuchsia-300 hover:bg-fuchsia-500/20 transition-colors"
              >
                Enter studio
              </Link>
            </div>
          </aside>
        </div>

        <section className="mt-12 rounded-2xl border border-white/[0.08] overflow-hidden bg-black/45 backdrop-blur-md">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Landmark className="text-[#00f2ff]" size={18} />
            <h2 className="text-sm font-semibold text-white">Sanctuary meta-world</h2>
          </div>
          <div className="p-5 sm:p-6 grid md:grid-cols-3 gap-4 text-sm text-white/55 leading-relaxed">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Video className="text-[#00f2ff] mb-2" size={18} />
              <p className="font-semibold text-white mb-1">Cinema</p>
              Streams the live rolodex—same signals as your main feed, staged as a social lobby screen.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Megaphone className="text-[#00f2ff] mb-2" size={18} />
              <p className="font-semibold text-white mb-1">Concert stage</p>
              Musician sets with audience boosts; links to Voices of Praise and Seeds economy.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Gamepad2 className="text-[#00f2ff] mb-2" size={18} />
              <p className="font-semibold text-white mb-1">Portals</p>
              Jump to Narrow Road, Hoops, Gridiron, and Armor Up without breaking party presence.
            </div>
          </div>
          <div className="px-5 py-4 border-t border-white/[0.06] flex flex-wrap gap-3">
            <Link
              href="/community"
              className="text-xs font-semibold text-[#00f2ff] hover:underline"
            >
              Temple Builder (UGC) — roadmap
            </Link>
            <span className="text-white/25">|</span>
            <Link href="/fellowship" className="text-xs font-semibold text-white/50 hover:text-white">
              Fellowship
            </Link>
          </div>
        </section>

        <section className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Trophy size={18} />
              <h2 className="text-sm font-bold text-white">Leagues of Light</h2>
            </div>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              Ministry-sponsored Pro-Am circuits, live Faith Caster huddles, and non-monetary Seed picks on outcomes—all
              broadcastable to the main feed.
            </p>
            <Link href="/streamers" className="text-xs font-bold text-emerald-400 hover:underline uppercase tracking-widest">
              Watch broadcasts
            </Link>
          </div>
          <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.07] p-5">
            <div className="flex items-center gap-2 text-violet-300 mb-2">
              <Users size={18} />
              <h2 className="text-sm font-bold text-white">Hall of Faith</h2>
            </div>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              Permanent showcase for top avatars and seasonal stats—tied to Kingdom XP and league placement.
            </p>
            <Link href="/profile" className="text-xs font-bold text-violet-300 hover:underline uppercase tracking-widest">
              Your public card
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
