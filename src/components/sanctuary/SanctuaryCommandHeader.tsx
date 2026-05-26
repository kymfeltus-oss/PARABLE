'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Heart, Mic, Music, Palette, Sparkles, Church } from 'lucide-react';
import { fallbackAvatarOnError } from '@/lib/avatar-display';
import { kingdomXpToLevel, readKingdomXp } from '@/lib/kingdom-xp';
import {
  auraFromStreak,
  estimateInfluence,
  parseCreatorCategories,
  primaryCategory,
  readSanctuarySeeds,
  readSanctuaryStreak,
  type AuraKind,
} from '@/lib/sanctuary-creator-state';

function CategoryGlyph({ category }: { category: string }) {
  const c = category.toLowerCase();
  if (c.includes('pastor') || c.includes('preacher')) return <Church className="h-4 w-4 text-amber-300" strokeWidth={1.75} />;
  if (c.includes('musician')) return <Music className="h-4 w-4 text-cyan-300" strokeWidth={1.75} />;
  if (c.includes('artist')) return <Palette className="h-4 w-4 text-fuchsia-300" strokeWidth={1.75} />;
  if (c.includes('podcaster')) return <Mic className="h-4 w-4 text-orange-300" strokeWidth={1.75} />;
  if (c.includes('influencer')) return <Sparkles className="h-4 w-4 text-violet-300" strokeWidth={1.75} />;
  if (c.includes('gamer') || c.includes('streamer')) return <Gamepad2 className="h-4 w-4 text-sky-300" strokeWidth={1.75} />;
  return <Heart className="h-4 w-4 text-emerald-300" strokeWidth={1.75} />;
}

function AuraRing({ aura }: { aura: AuraKind }) {
  const isGold = aura === 'gold';
  return (
    <>
      <div
        className={[
          'pointer-events-none absolute -inset-1 rounded-full opacity-90 blur-md',
          isGold
            ? 'bg-[conic-gradient(from_180deg,theme(colors.amber.400),theme(colors.yellow.200),theme(colors.amber.500),theme(colors.amber.400))] animate-pulse'
            : 'bg-[conic-gradient(from_90deg,theme(colors.cyan.400),theme(colors.sky.400),theme(colors.cyan.300),theme(colors.cyan.500))]',
        ].join(' ')}
        style={{ animationDuration: isGold ? '2.8s' : '4s' }}
      />
      <div
        className={[
          'pointer-events-none absolute -inset-0.5 rounded-full border-2 opacity-80',
          isGold ? 'border-amber-400/70 shadow-[0_0_28px_rgba(251,191,36,0.45)]' : 'border-cyan-400/60 shadow-[0_0_26px_rgba(34,211,238,0.4)]',
        ].join(' ')}
      />
    </>
  );
}

type Props = {
  displayName: string;
  role: string | null | undefined;
  avatarUrl: string;
  followingCount: number;
  testimonyCount: number;
};

export default function SanctuaryCommandHeader({
  displayName,
  role,
  avatarUrl,
  followingCount,
  testimonyCount,
}: Props) {
  const categories = parseCreatorCategories(role);
  const primary = primaryCategory(categories);
  const streak = readSanctuaryStreak();
  const aura = auraFromStreak(streak);
  const seeds = readSanctuarySeeds();
  const xp = readKingdomXp();
  const { level, progressPct, need } = kingdomXpToLevel(xp);
  const influence = estimateInfluence(testimonyCount, followingCount);

  const shortName =
    displayName.length > 18 ? `${displayName.slice(0, 16).trim()}…` : displayName;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-black/40 p-5 shadow-[0_0_60px_rgba(0,242,255,0.08)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,242,255,0.12),transparent_55%)]" />

      <div className="relative flex flex-col items-center gap-5">
        <div className="relative">
          <AuraRing aura={aura} />
          <div
            className={[
              'relative h-[104px] w-[104px] overflow-hidden rounded-full border-2 border-black/80 bg-black/60 ring-2',
              aura === 'gold' ? 'ring-amber-400/50' : 'ring-cyan-400/40',
            ].join(' ')}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl && avatarUrl !== '/logo.svg' ? avatarUrl : '/logo.svg'}
              alt=""
              className="h-full w-full object-cover"
              onError={fallbackAvatarOnError}
            />
          </div>
          {streak >= 7 && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-400/40 bg-black/80 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-200">
              7-day streak
            </span>
          )}
        </div>

        <div className="w-full min-w-0 text-center">
          <p className="text-[9px] font-mono uppercase tracking-[0.35em] text-[#00f2ff]/60">Command center</p>
          <div className="mt-2 flex min-w-0 flex-wrap items-center justify-center gap-2">
            <h1 className="text-xl font-black uppercase tracking-tight text-white">{shortName}</h1>
            <span className="text-white/30">|</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90">
              <CategoryGlyph category={primary} />
              {primary.replace('/', ' · ')}
            </span>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-white/[0.08] bg-black/45 px-3 py-3 backdrop-blur-md">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Influence</p>
              <p className="mt-1 truncate text-sm font-black tabular-nums text-white">{influence.toLocaleString()}</p>
            </div>
            <div className="min-w-0 border-x border-white/[0.06]">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Seeds</p>
              <p className="mt-1 truncate text-sm font-black tabular-nums text-[#00f2ff]">{seeds.toLocaleString()}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/35">XP · Lv</p>
              <p className="mt-1 truncate text-sm font-black tabular-nums text-white">
                {level}
                <span className="text-[10px] font-semibold text-white/40"> · {Math.round(progressPct)}%</span>
              </p>
            </div>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00f2ff] to-cyan-200/90 transition-[width] duration-500"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
          <p className="mt-1.5 text-center text-[9px] text-white/35">{need} XP to next unlock tier</p>
        </div>
      </div>
    </motion.section>
  );
}
