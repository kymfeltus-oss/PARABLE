"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Building2,
  Car,
  Church,
  Crosshair,
  Gamepad2,
  Gift,
  MapPin,
  Mic2,
  Music,
  Radio,
  Shield,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import HubBackground from "@/components/HubBackground";

const FLAGSHIPS = [
  {
    id: "narrow-road",
    title: "The Narrow Road",
    tag: "Open world · GTA hybrid",
    icon: Car,
    shortBlurb:
      "Neon metropolis, outreach ops, and driving loops—packaged like an in-app activity you’d launch from chat.",
    accentBar: "bg-gradient-to-b from-[#00f2ff] to-purple-500",
    bannerFrom: "from-[#00f2ff]/25",
    bannerTo: "to-purple-900/40",
    world:
      "A sprawling neon Metropolis of Choices—skyscrapers, districts, and high-end detail. Build Influence and Peace, not chaos.",
    gameplay:
      "Outreach Ops instead of heists: mobilize teams to calm a Riot of Despair or turn a District of Apathy into a Zone of Grace.",
    vehicles: "Chariots (cars/bikes) and Wings (aircraft)—full customization and physics-forward driving and flight.",
    hub: "Ministries can mirror a real church as an in-world venue for live-streamed in-game services.",
    links: [
      { href: "/streamers", label: "Streamers hub" },
      { href: "/ai-sanctuary", label: "AI Sanctuary" },
      { href: "/music-hub", label: "Musician tracks" },
    ],
  },
  {
    id: "armor-up",
    title: "Armor Up: The Last Stand",
    tag: "Battle build · Fortnite hybrid",
    icon: Shield,
    shortBlurb: "Harvest, build, and weather the storm—quick session energy like Discord Activities and mobile game hubs.",
    accentBar: "bg-gradient-to-b from-violet-400 to-cyan-500",
    bannerFrom: "from-violet-600/30",
    bannerTo: "to-cyan-900/35",
    world:
      "100 players drop into a map losing its light. Win by building the strongest Citadel of Light before the Shadow Storm closes in—not by eliminating friends.",
    gameplay:
      "Harvest Truth, Spirit, and Grace as build materials. Gifts (not weapons) shield teammates and clear Shadow Minions.",
    vehicles: "",
    hub: "Musicians host in-game concerts; the world becomes a giant interactive music video tied to PARABLE releases.",
    links: [
      { href: "/music-hub", label: "Artist Hub" },
      { href: "/sanctuary", label: "Sanctuary feed" },
      { href: "/fellowship", label: "Fellowship" },
    ],
  },
  {
    id: "kingdom-hoops",
    title: "Kingdom Hoops",
    tag: "Streetball · NBA 2K hybrid",
    icon: Activity,
    shortBlurb: "Rhythm shooting and contest windows—feels like a skill mini-game inside a social gaming client.",
    accentBar: "bg-gradient-to-b from-orange-400 to-amber-600",
    bannerFrom: "from-orange-600/35",
    bannerTo: "to-amber-900/40",
    accent: "from-orange-500/15 to-amber-500/5",
    border: "border-orange-400/35",
    glow: "shadow-[0_0_50px_rgba(251,146,60,0.12)]",
    world:
      "High-fidelity 3v3 or 5v5 on urban Sanctuary Courts—pro-stick depth, shot rhythm, and weighty player movement.",
    gameplay:
      "Virtue badges: Self-Control steadies you under pressure; Encouragement buffs teammates after a great play.",
    vehicles: "",
    hub: "MyCareer arc from a church blacktop to the Global Kingdom Games—off-court choices shape Faith Rating and Influence.",
    links: [
      { href: "/streamers", label: "Watch live sports" },
      { href: "/sunday", label: "Director Mode" },
      { href: "/profile", label: "Your profile" },
    ],
  },
  {
    id: "gridiron-glory",
    title: "Gridiron Glory",
    tag: "Simulation · Madden hybrid",
    icon: Crosshair,
    shortBlurb: "Pass meter, lead reticle, and drive logic—tight loop matching competitive sports activities in app launchers.",
    accentBar: "bg-gradient-to-b from-emerald-400 to-cyan-500",
    bannerFrom: "from-emerald-600/30",
    bannerTo: "to-cyan-900/35",
    world:
      "11v11 football with play-calling, audibles, and hard-hitting, believable physics.",
    gameplay:
      "Playbook of Wisdom: Inspired plays hit harder when Unity stayed high all season.",
    vehicles: "",
    hub: "Ministry leagues inside PARABLE; Game of the Week on the feed with commentary and a Huddle sidebar for live chat.",
    links: [
      { href: "/streamers", label: "Streamers · Game of the Week" },
      { href: "/community", label: "Community" },
      { href: "/contribution-tiers", label: "Seeds & tiers" },
    ],
  },
] as const;

const INTEGRATIONS = [
  {
    feature: 'The "Radios"',
    body: "In The Narrow Road, in-car audio pulls from musician tracks uploaded on PARABLE—your catalog becomes the city soundtrack.",
    icon: Radio,
  },
  {
    feature: "Lobby sidebar",
    body: "Live Personnel shows friends In the Red Zone (Gridiron) or Building a Citadel (Armor Up)—presence that matches your hybrid feed.",
    icon: Users,
  },
  {
    feature: "Director toggle",
    body: "Halftime and ministry tournaments: viewers flip Player Cam vs Broadcast Cam, same idea as Word vs Worship on live church streams.",
    icon: Video,
  },
  {
    feature: "Gifting / Seeds",
    body: "Earn Seeds in-game and sow them to favorite creators or ministries on the main feed to unlock special cosmetics and gear.",
    icon: Gift,
  },
] as const;

function FlagshipCard({
  item,
  index,
}: {
  item: (typeof FLAGSHIPS)[number];
  index: number;
}) {
  const Icon = item.icon;
  return (
    <motion.article
      id={item.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative scroll-mt-28 overflow-hidden rounded-xl border border-[#3f4147] bg-[#1e1f22] shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition hover:border-[#4e5058]"
    >
      <div className="flex">
        <div className={`w-1 shrink-0 rounded-l-[10px] ${item.accentBar}`} aria-hidden />
        <div className="min-w-0 flex-1 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#3f4147] bg-[#111214]">
                <Icon className="text-[#00f2ff]" size={24} strokeWidth={1.25} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#949ba4]">Parable activity</p>
                <h2 className="mt-0.5 text-xl font-bold leading-tight text-[#f2f3f5] sm:text-2xl">{item.title}</h2>
                <p className="mt-0.5 text-[11px] text-[#b5bac1]">{item.tag}</p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-[#23a559]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#23a559] opacity-40" />
                <span className="relative h-2 w-2 rounded-full bg-[#23a559]" />
              </span>
              Playable
            </span>
          </div>

          <div className="mt-4 aspect-video overflow-hidden rounded-lg border border-[#3f4147] bg-[#111214]">
            <div className={`h-full w-full bg-gradient-to-br ${item.bannerFrom} ${item.bannerTo} opacity-95`} />
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#b5bac1]">{item.shortBlurb}</p>

          <div className="mt-2 text-[11px] text-[#949ba4]">Solo · instant play · in-app style</div>

          <Link
            href={`/gaming/play/${item.id}`}
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#248046] py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2a9650] sm:inline-flex sm:w-auto sm:px-10"
          >
            Play now
          </Link>

          <div className="mt-6 rounded-lg border border-[#3f4147] bg-[#2b2d31] p-4 sm:p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#949ba4]">About this experience</p>
            <ul className="space-y-3 text-sm leading-relaxed text-[#b5bac1]">
              <li>
                <span className="font-semibold text-[#f2f3f5]">World · </span>
                {item.world}
              </li>
              <li>
                <span className="font-semibold text-[#f2f3f5]">Gameplay · </span>
                {item.gameplay}
              </li>
              {item.vehicles ? (
                <li>
                  <span className="font-semibold text-[#f2f3f5]">Vehicles · </span>
                  {item.vehicles}
                </li>
              ) : null}
              <li>
                <span className="font-semibold text-[#f2f3f5]">PARABLE hub · </span>
                {item.hub}
              </li>
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center rounded-lg border border-[#3f4147] bg-[#111214] px-3 py-2 text-xs font-semibold text-[#b5bac1] transition hover:border-[#00f2ff]/40 hover:text-[#00f2ff]"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function GamingPage() {
  return (
    <div className="relative min-h-screen bg-[#030306] text-white selection:bg-[#00f2ff]/25">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HubBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00f2ff]/[0.04] via-transparent to-black" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(0,242,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.12)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-24 pt-parable-header sm:px-4">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Link
            href="/play"
            className="inline-flex items-center gap-2 rounded-full border border-[#00f2ff]/40 bg-[#00f2ff]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#00f2ff] hover:bg-[#00f2ff]/20 transition-colors"
          >
            Parable Play launcher
          </Link>
          <Link
            href="/streamers"
            className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-[#00f2ff] transition-colors"
          >
            <ArrowLeft size={14} />
            Streamers hub
          </Link>
        </div>

        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 text-[#00f2ff]">
            <Gamepad2 size={28} strokeWidth={1.25} />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Faith gaming · open world</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            Territory, teamwork,
            <span className="text-[#00f2ff]"> high-fidelity physics</span>
          </h1>
          <p className="mt-5 text-sm sm:text-base text-white/55 max-w-2xl leading-relaxed">
            Competitive energy and open-world scale—reaimed for ministries and musicians. Four flagship lanes mirror the
            giants you know, but the win conditions are influence, unity, worship, and wisdom—not exploitation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/40">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5">
              <MapPin size={14} className="text-[#00f2ff]" />
              Territory
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5">
              <Users size={14} className="text-[#00f2ff]" />
              Teamwork
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5">
              <Zap size={14} className="text-[#00f2ff]" />
              Physics-forward
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5">
              <Church size={14} className="text-[#00f2ff]" />
              Ministry-safe fantasy
            </span>
          </div>
        </header>

        <section aria-label="Flagship experiences" className="space-y-8">
          {FLAGSHIPS.map((item, index) => (
            <FlagshipCard key={item.id} item={item} index={index} />
          ))}
        </section>

        <section className="mt-16 rounded-2xl border border-white/[0.08] bg-black/45 backdrop-blur-md overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Building2 className="text-[#00f2ff]" size={18} />
            <h2 className="text-sm font-semibold text-white">How these games plug into PARABLE</h2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {INTEGRATIONS.map((row) => {
              const Ic = row.icon;
              return (
                <div key={row.feature} className="px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:gap-8 gap-3">
                  <div className="sm:w-48 shrink-0 flex items-start gap-2">
                    <Ic className="text-[#00f2ff] shrink-0 mt-0.5" size={18} />
                    <p className="text-sm font-semibold text-white">{row.feature}</p>
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed flex-1">{row.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/sanctuary", label: "Sanctuary", sub: "Seeds & social floor", icon: Mic2 },
            { href: "/music-hub", label: "Artist Hub", sub: "Residency, sheds, merch", icon: Music },
            { href: "/live-studio", label: "Live Studio", sub: "Broadcast into the world", icon: Sparkles },
            { href: "/browse", label: "Browse", sub: "More live catalogue", icon: Radio },
          ].map(({ href, label, sub, icon: Ic }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-[#00f2ff]/35 transition-colors group"
            >
              <Ic className="text-[#00f2ff] group-hover:scale-105 transition-transform" size={20} />
              <p className="mt-3 text-sm font-semibold text-white">{label}</p>
              <p className="mt-1 text-xs text-white/40">{sub}</p>
            </Link>
          ))}
        </section>

        <p className="mt-12 text-center text-[11px] text-white/30 max-w-xl mx-auto leading-relaxed">
          Each card links to a lightweight in-browser prototype you can play today. Full open-world builds are longer-term;
          these demos capture the loop and tone for your roadmap.
        </p>
      </main>
    </div>
  );
}
