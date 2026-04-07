'use client';

import { useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HUB_DEFINITIONS, HUB_ORDER, type HubId } from '@/lib/hub-registry';

type Props = {
  unlocked: HubId[];
  activeId: HubId;
  onSelect: (id: HubId) => void;
};

export default function HubRolodex({ unlocked, activeId, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const ordered = HUB_ORDER.filter((id) => unlocked.includes(id));

  const scrollToHub = useCallback(
    (id: HubId) => {
      const el = scrollRef.current?.querySelector(`[data-hub="${id}"]`);
      el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    },
    [],
  );

  useEffect(() => {
    scrollToHub(activeId);
  }, [activeId, scrollToHub]);

  const idx = Math.max(0, ordered.indexOf(activeId));
  const prev = () => {
    const next = ordered[(idx - 1 + ordered.length) % ordered.length];
    if (next) onSelect(next);
  };
  const next = () => {
    const n = ordered[(idx + 1) % ordered.length];
    if (n) onSelect(n);
  };

  return (
    <div className="relative mt-4">
      <p className="mb-2 text-center text-[9px] font-black uppercase tracking-[0.35em] text-white/35">
        Nav-Portal · Rolodex
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous hub"
          onClick={prev}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/60 text-white/70 hover:border-[#00f2ff]/40 hover:text-[#00f2ff]"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={scrollRef}
          className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ordered.map((id) => {
            const def = HUB_DEFINITIONS[id];
            const active = id === activeId;
            return (
              <button
                key={id}
                type="button"
                data-hub={id}
                onClick={() => onSelect(id)}
                className={[
                  'shrink-0 rounded-2xl border px-3 py-2 text-left transition-all duration-300',
                  active
                    ? 'min-w-[46%] scale-100 border-[#00f2ff]/50 bg-[#00f2ff]/10 shadow-[0_0_24px_rgba(0,242,255,0.15)] sm:min-w-[38%]'
                    : 'min-w-[40%] scale-[0.94] border-white/10 bg-white/[0.03] opacity-80 hover:opacity-100 sm:min-w-[32%]',
                ].join(' ')}
              >
                <span
                  className="block text-[8px] font-black uppercase tracking-widest"
                  style={{ color: def.accent }}
                >
                  {def.shortLabel}
                </span>
                <span className="mt-0.5 block truncate text-xs font-bold text-white">{def.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Next hub"
          onClick={next}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/60 text-white/70 hover:border-[#00f2ff]/40 hover:text-[#00f2ff]"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
