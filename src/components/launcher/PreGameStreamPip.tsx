'use client';

import Link from 'next/link';
import { Play, Radio } from 'lucide-react';

type Props = {
  featuredName?: string;
  featuredSub?: string;
  href?: string;
};

export default function PreGameStreamPip({
  featuredName = 'Featured: City Hope Worship',
  featuredSub = 'Pre-game stream · live now',
  href = '/streamers',
}: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.1] bg-black/50 backdrop-blur-md overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#00f2ff]">
          <Radio size={16} strokeWidth={1.25} />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Now loading feed</span>
        </div>
        <span className="text-[10px] text-emerald-400/90 font-semibold uppercase tracking-widest">PiP</span>
      </div>
      <div className="relative aspect-video bg-gradient-to-br from-[#0a1628] via-black to-[#1a0a28]">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_40%_30%,rgba(0,242,255,0.25),transparent_50%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full border border-[#00f2ff]/40 bg-black/50 p-4">
            <Play className="text-[#00f2ff]" size={28} fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
          <p className="text-sm font-semibold text-white truncate">{featuredName}</p>
          <p className="text-[11px] text-white/45">{featuredSub}</p>
        </div>
      </div>
      <div className="p-3 flex flex-wrap gap-2">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-xl border border-[#00f2ff]/40 bg-[#00f2ff]/10 px-4 py-2 text-xs font-bold text-[#00f2ff] hover:bg-[#00f2ff]/20 transition-colors"
        >
          Open stream hub
        </Link>
        <p className="text-[10px] text-white/35 self-center max-w-[220px] leading-relaxed">
          While a heavy session boots, ministries and musicians stay on-screen—same window, zero context drop.
        </p>
      </div>
    </div>
  );
}
