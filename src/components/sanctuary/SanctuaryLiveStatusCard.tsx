'use client';

import { motion } from 'framer-motion';
import { Radio, Headphones } from 'lucide-react';

type Follow = { id: string; name: string; viewers: string };

type Props = {
  liveFollowed: Follow[];
  isLiveMock?: boolean;
};

export default function SanctuaryLiveStatusCard({ liveFollowed, isLiveMock = false }: Props) {
  const inShed = false;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: 0.08 }}
      className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl"
    >
      <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#00f2ff]/55">Live status</p>
      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
          <span className="flex items-center gap-2 text-[11px] text-white/70">
            <Headphones className="h-4 w-4 text-violet-300" />
            In a shed
          </span>
          <span className={`text-[10px] font-black uppercase ${inShed ? 'text-emerald-400' : 'text-white/35'}`}>
            {inShed ? 'Live' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-3 py-2.5">
          <span className="flex items-center gap-2 text-[11px] text-white/70">
            <Radio className="h-4 w-4 text-red-300" />
            Broadcasting
          </span>
          <span className={`text-[10px] font-black uppercase ${isLiveMock ? 'text-red-400' : 'text-white/35'}`}>
            {isLiveMock ? 'On air' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Friends online</p>
        <div className="mt-2 space-y-2 text-[11px] text-white/60">
          {liveFollowed.length === 0 ? (
            <p className="text-white/40">No followed channels live. Discover on Streamers.</p>
          ) : (
            liveFollowed.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />
                  <span className="truncate">{a.name}</span>
                </span>
                <span className="shrink-0 text-[10px] text-white/40">{a.viewers}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.aside>
  );
}
