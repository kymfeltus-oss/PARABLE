'use client';

import { useCallback, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { addKingdomXp, kingdomXpToLevel, readKingdomXp } from '@/lib/kingdom-xp';

export default function KingdomXpBar() {
  const [xp, setXp] = useState(0);

  const refresh = useCallback(() => setXp(readKingdomXp()), []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'parable-kingdom-xp') refresh();
    };
    const onCustom = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('parable-kingdom-xp', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('parable-kingdom-xp', onCustom as EventListener);
    };
  }, [refresh]);

  const { level, progressPct, need } = kingdomXpToLevel(xp);

  return (
    <div className="rounded-2xl border border-[#00f2ff]/25 bg-black/55 backdrop-blur-md overflow-hidden">
      <div className="px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#00f2ff]/35 bg-[#00f2ff]/10">
            <Sparkles className="text-[#00f2ff]" size={22} strokeWidth={1.25} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Kingdom XP</p>
            <p className="text-lg font-bold text-white tabular-nums">
              Level {level}
              <span className="text-white/35 font-medium text-sm ml-2">{xp.toLocaleString()} XP</span>
            </p>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-2.5 rounded-full bg-white/[0.08] overflow-hidden border border-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00f2ff] to-cyan-300/90 transition-[width] duration-500 ease-out"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-white/45">
            {need} XP to next level · Sermons, music, matches, and karaoke all feed this bar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setXp(addKingdomXp(24))}
          className="shrink-0 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:border-[#00f2ff]/40 hover:text-[#00f2ff] transition-colors"
        >
          Demo +24 XP
        </button>
      </div>
    </div>
  );
}
