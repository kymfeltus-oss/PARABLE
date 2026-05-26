'use client';

import { Mic2, Shield, Crown, Footprints } from 'lucide-react';

const SLOTS = [
  { label: 'Golden Mic', sub: 'Artist Hub unlock', icon: Mic2 },
  { label: 'Shield of Faith', sub: 'Armor overlay', icon: Shield },
  { label: 'Crown flair', sub: 'Leagues of Light', icon: Crown },
  { label: 'Trail: Cyan', sub: 'Aura · Imago', icon: Footprints },
] as const;

export default function UniversalInventoryStrip() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Universal inventory</p>
        <span className="text-[9px] text-white/30">Cross-game (demo)</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3">
        {SLOTS.map(({ label, sub, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 flex flex-col gap-2"
          >
            <Icon className="text-[#00f2ff]" size={18} strokeWidth={1.25} />
            <div>
              <p className="text-xs font-semibold text-white leading-tight">{label}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
