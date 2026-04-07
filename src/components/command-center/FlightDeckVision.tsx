'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clapperboard,
  Gift,
  Mic2,
  Scissors,
  Sparkles,
  SplitSquareVertical,
  Wand2,
} from 'lucide-react';

const GIFTS = ['🎸 Seed', '💎 Gem', '🎺 Horn', '🌱 Offering', '✨ Blessing'] as const;

const CARDS = [
  {
    icon: <Wand2 size={18} className="text-[#00f2ff]" />,
    title: 'AI Architect',
    body: 'Draft sermons or setlists; Greek/Hebrew glosses and song keys on tap.',
    href: '/lab',
  },
  {
    icon: <Mic2 size={18} className="text-fuchsia-300" />,
    title: 'Ghost-Script prompter',
    body: 'Voice-scrolled teleprompter with flashes like “Ask for amens” or “Start poll”.',
    href: '/teleprompter',
  },
  {
    icon: <SplitSquareVertical size={18} className="text-orange-300" />,
    title: 'Post-match compare',
    body: 'Script vs live overlay, tangent heatmap, clarity score, pacing tips.',
    href: '/sermon-checker',
  },
  {
    icon: <Scissors size={18} className="text-amber-300" />,
    title: 'Golden Moment',
    body: 'One hit clips last 30s with scripture/lyric captions to the feed.',
    href: '/testify',
  },
  {
    icon: <Gift size={18} className="text-emerald-300" />,
    title: 'Blessing ticker',
    body: 'Gifts flow across the deck; community bar fills ministry or artist goals.',
    href: '/contribution-tiers',
  },
  {
    icon: <Clapperboard size={18} className="text-cyan-200" />,
    title: 'Lobby pulse',
    body: 'Mini-stream tiles, action ticker, sentiment feeding a global heatmap.',
    href: '/browse',
  },
] as const;

export function FlightDeckVision() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-black/40 overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00f2ff]/90">Flight deck</p>
          <h2 className="text-sm font-semibold text-white mt-1">Creator cockpit (vision)</h2>
          <p className="text-xs text-white/45 mt-1 max-w-xl">
            AI architect, voice teleprompter with triggers, post-match script vs performance, Golden Moment clips, and
            blessing ticker toward ministry goals.
          </p>
        </div>
        <Link
          href="/sunday"
          className="shrink-0 inline-flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/90 hover:border-[#00f2ff]/40 hover:text-[#00f2ff] transition-colors"
        >
          Try Director Mode
        </Link>
      </div>

      <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 hover:border-[#00f2ff]/35 hover:bg-white/[0.05] transition-colors block text-left"
          >
            <div className="flex items-center gap-2">
              {card.icon}
              <Sparkles size={14} className="text-white/25" />
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{card.title}</p>
            <p className="mt-1.5 text-xs text-white/45 leading-relaxed">{card.body}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-[#00f2ff]/80">Open →</p>
          </Link>
        ))}
      </div>

      <Link
        href="/contribution-tiers"
        className="block border-t border-white/[0.06] bg-black/50 px-2 py-2 overflow-hidden hover:bg-black/60 transition-colors"
      >
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35 px-2 mb-1">
          Blessing ticker · tap for giving tiers
        </p>
        <div className="relative h-9 flex items-center">
          <motion.div
            className="flex gap-10 whitespace-nowrap text-xs font-semibold text-white/70"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
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
  );
}
