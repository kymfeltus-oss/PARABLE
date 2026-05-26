'use client';

import Link from 'next/link';
import { HUB_DEFINITIONS, type HubId } from '@/lib/hub-registry';

type Props = {
  hubId: HubId;
  locked?: boolean;
};

export default function HubModulePanel({ hubId, locked }: Props) {
  const def = HUB_DEFINITIONS[hubId];

  return (
    <section className="rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-md">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Active hub</p>
          <h2 className="mt-1 text-lg font-bold text-white">{def.label}</h2>
          <p className="mt-1 text-xs text-white/50">{def.tagline}</p>
        </div>
        {locked && (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-200">
            Locked · earn path
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {def.modules.map((m) => (
          <li key={m.href + m.title}>
            <Link
              href={locked ? '#' : m.href}
              onClick={(e) => locked && e.preventDefault()}
              className={[
                'block rounded-xl border px-3 py-3 transition-colors',
                locked
                  ? 'pointer-events-none border-white/[0.06] bg-white/[0.02] opacity-45'
                  : 'border-white/10 bg-white/[0.04] hover:border-[#00f2ff]/35 hover:bg-white/[0.06]',
              ].join(' ')}
            >
              <div className="flex flex-wrap items-center gap-2">
                {m.badge && (
                  <span className="rounded-md border border-white/15 bg-black/40 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#00f2ff]">
                    {m.badge}
                  </span>
                )}
                <span className="text-sm font-semibold text-white">{m.title}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-white/50">{m.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
