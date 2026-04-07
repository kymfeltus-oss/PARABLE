'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Headphones, Mic, Play, Trophy } from 'lucide-react';
import { primaryCategory, parseCreatorCategories } from '@/lib/sanctuary-creator-state';

type Props = {
  role: string | null | undefined;
  router: { push: (href: string) => void };
};

export default function SanctuaryCategoryUtility({ role, router }: Props) {
  const primary = primaryCategory(parseCreatorCategories(role));
  const p = primary.toLowerCase();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#00f2ff]/55">Utility rail</p>
        <span className="truncate text-[10px] font-bold uppercase tracking-wide text-white/45">{primary}</span>
      </div>

      {p.includes('musician') && (
        <div className="rounded-[22px] border border-violet-500/25 bg-gradient-to-br from-violet-950/50 to-black/60 p-4">
          <div className="flex items-center gap-2 text-violet-200">
            <Headphones className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">Current shed</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-white">Green Room · Tonight 8:00 PM</p>
          <p className="mt-1 text-xs text-white/50">Preview your next jam block. Opens the music hub.</p>
          <button
            type="button"
            onClick={() => router.push('/music-hub')}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#00f2ff] hover:underline"
          >
            Open shed <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {(p.includes('pastor') || p.includes('preacher')) && (
        <div className="rounded-[22px] border border-amber-500/25 bg-gradient-to-br from-amber-950/40 to-black/60 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-200/90">Recent sermon</p>
          <p className="mt-2 text-sm font-semibold text-white">Sunday message · Draft in AI Sanctuary</p>
          <div className="mt-3 max-h-16 overflow-hidden rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/45">
            Prayer requests ticker · “Peace over families this week…” (sample)
          </div>
          <button
            type="button"
            onClick={() => router.push('/ai-sanctuary')}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#00f2ff] hover:underline"
          >
            Open study <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {(p.includes('gamer') || p.includes('streamer')) && (
        <div className="rounded-[22px] border border-cyan-500/25 bg-gradient-to-br from-cyan-950/35 to-black/60 p-4">
          <div className="flex items-center gap-2 text-cyan-200">
            <Trophy className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">Arena scores</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li className="flex justify-between border-b border-white/[0.06] pb-2">
              <span>Kingdom Hoops</span>
              <span className="font-mono text-[#00f2ff]">12,480</span>
            </li>
            <li className="flex justify-between pt-1">
              <span>The Narrow Road</span>
              <span className="font-mono text-[#00f2ff]">Sector 7 cleared</span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => router.push('/play')}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#00f2ff] hover:underline"
          >
            Launch base <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {p.includes('podcaster') && (
        <div className="-mx-1">
          <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-white/40">Episodes</p>
          <div className="flex gap-3 overflow-x-auto pb-2 px-1 [scrollbar-width:thin]">
            {['Ep 12 · Table Talk', 'Ep 11 · Culture', 'Ep 10 · Faith & Work'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => router.push('/streamer-hub')}
                className="min-w-[200px] shrink-0 rounded-2xl border border-white/10 bg-black/50 p-4 text-left transition hover:border-[#00f2ff]/35"
              >
                <Mic className="h-4 w-4 text-[#00f2ff]" />
                <p className="mt-2 text-sm font-semibold text-white">{t}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#00f2ff]">
                  <Play className="h-3 w-3" /> Listen
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {p.includes('artist') && (
        <div className="rounded-[22px] border border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-950/35 to-black/60 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-200/90">Imago & gear</p>
          <p className="mt-2 text-sm text-white/75">Signature skins and merch drops sync here.</p>
          <button
            type="button"
            onClick={() => router.push('/imago')}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#00f2ff] hover:underline"
          >
            Open gear locker <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {p.includes('influencer') && (
        <div className="rounded-[22px] border border-violet-500/20 bg-black/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-200/90">Brand pulse</p>
          <p className="mt-2 text-sm text-white/75">Virtual merch table & partner slots (roadmap).</p>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#00f2ff] hover:underline"
          >
            Brand manager <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {!p.includes('musician') &&
        !p.includes('pastor') &&
        !p.includes('preacher') &&
        !p.includes('gamer') &&
        !p.includes('streamer') &&
        !p.includes('podcaster') &&
        !p.includes('artist') &&
        !p.includes('influencer') && (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">Faith journey home</p>
            <p className="mt-1 text-xs text-white/50">
              Streaks, outreach ops, and badges will surface here as your Kingdom Path advances.
            </p>
            <button
              type="button"
              onClick={() => router.push('/hubs')}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#00f2ff] hover:underline"
            >
              Open hub portal <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
    </motion.section>
  );
}
