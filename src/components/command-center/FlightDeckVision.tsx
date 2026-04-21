"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Gift, Mic2, Scissors, Sparkles, SplitSquareVertical, Wand2 } from "lucide-react";
import { useState } from "react";
import { useGlobalPulse } from "@/providers/GlobalPulseProvider";
import { LobbyPulseHeatmap } from "@/components/command-center/LobbyPulseHeatmap";
import { AiArchitectOutlinePanel } from "@/components/command-center/AiArchitectOutlinePanel";

const GIFTS = ["🎸 Seed", "💎 Gem", "🎺 Horn", "🌱 Offering", "✨ Blessing"] as const;

const CARDS = [
  {
    id: "ai-architect" as const,
    icon: <Wand2 size={18} className="text-[#00f2ff]" />,
    title: "AI Architect",
    body: "Draft sermons or setlists; Greek/Hebrew glosses and song keys on tap.",
    href: "/lab",
  },
  {
    id: "link" as const,
    icon: <Mic2 size={18} className="text-fuchsia-300" />,
    title: "Ghost-Script prompter",
    body: "Voice-scrolled teleprompter with flashes like “Ask for amens” or “Start poll”.",
    href: "/teleprompter",
  },
  {
    id: "link" as const,
    icon: <SplitSquareVertical size={18} className="text-orange-300" />,
    title: "Post-match compare",
    body: "Script vs live overlay, tangent heatmap, clarity score, pacing tips.",
    href: "/sermon-checker",
  },
  {
    id: "link" as const,
    icon: <Scissors size={18} className="text-amber-300" />,
    title: "Golden Moment",
    body: "One hit clips last 30s with scripture/lyric captions to the feed.",
    href: "/sanctuary",
  },
  {
    id: "link" as const,
    icon: <Gift size={18} className="text-emerald-300" />,
    title: "Blessing ticker",
    body: "Gifts flow across the deck; community bar fills ministry or artist goals.",
    href: "/contribution-tiers",
  },
] as const;

const cardClass =
  "rounded-xl border border-white/[0.08] bg-[#0b0d10]/90 p-4 transition-colors hover:border-[#00f2ff]/35 hover:bg-white/[0.04] block text-left";

export function FlightDeckVision() {
  const router = useRouter();
  const { pulseScore } = useGlobalPulse();
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const cockpitGlow = pulseScore > 1.0;

  return (
    <>
      <section
        className={[
          "parable-live-surface overflow-hidden rounded-2xl border transition-[box-shadow,background-color] duration-700",
          cockpitGlow
            ? "bg-[#060a10] shadow-[0_0_60px_-8px_rgba(0,242,255,0.32),inset_0_0_80px_-40px_rgba(0,242,255,0.08)] ring-1 ring-[#00f2ff]/20"
            : "bg-black/40",
        ].join(" ")}
      >
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00f2ff]/90">Flight deck</p>
            <h2 className="mt-1 text-sm font-semibold text-white">Creator cockpit (vision)</h2>
            <p className="mt-1 max-w-xl text-xs text-white/45">
              AI architect, voice teleprompter with triggers, post-match script vs performance, Golden Moment clips, and
              blessing ticker toward ministry goals.
            </p>
          </div>
          {/*
            App Router equivalent of react-router-dom `useNavigate`: `useRouter().push('/hub')`.
          */}
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/sunday"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-white/90 transition-colors hover:border-[#00f2ff]/40 hover:text-[#00f2ff] sm:order-1"
            >
              Try Director Mode
            </Link>
            <button
              type="button"
              onClick={() => router.push("/hub")}
              className="group inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_4px_18px_rgba(88,101,242,0.45)] transition-all duration-300 hover:bg-[#4752C4] hover:shadow-[0_0_36px_rgba(88,101,242,0.72),0_8px_28px_rgba(0,0,0,0.45)] sm:order-2"
            >
              Enter Hub
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <LobbyPulseHeatmap />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CARDS.map((card) =>
              card.id === "ai-architect" ? (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => setAiPanelOpen(true)}
                  className={cardClass}
                >
                  <div className="flex items-center gap-2">
                    {card.icon}
                    <Sparkles size={14} className="text-white/25" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{card.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/45">{card.body}</p>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-[#00f2ff]/80">Open panel →</p>
                </button>
              ) : (
                <Link key={card.title} href={card.href} className={cardClass}>
                  <div className="flex items-center gap-2">
                    {card.icon}
                    <Sparkles size={14} className="text-white/25" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{card.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/45">{card.body}</p>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-[#00f2ff]/80">Open →</p>
                </Link>
              ),
            )}
          </div>
        </div>

        <Link
          href="/contribution-tiers"
          className="block overflow-hidden border-t border-white/[0.06] bg-black/50 px-2 py-2 transition-colors hover:bg-black/60"
        >
          <p className="mb-1 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
            Blessing ticker · tap for giving tiers
          </p>
          <div className="relative flex h-9 items-center">
            <motion.div
              className="flex gap-10 whitespace-nowrap text-xs font-semibold text-white/70"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            >
              {[...GIFTS, ...GIFTS, ...GIFTS].map((g, i) => (
                <span key={`${g}-${i}`} className="inline-flex items-center gap-1.5">
                  <span className="text-[#00f2ff]">+1</span> {g}
                </span>
              ))}
            </motion.div>
          </div>
        </Link>
      </section>

      <AiArchitectOutlinePanel open={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />
    </>
  );
}
