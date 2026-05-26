'use client';

import dynamic from 'next/dynamic';

const GlobalPulseGlobeInner = dynamic(() => import('./GlobalPulseGlobeInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/10 to-amber-500/5" />
  ),
});

/**
 * Floating 3D globe + Supabase Realtime “Glory Sparks” on new `posts` rows.
 * Fixed corner placement; clears bottom nav.
 */
export function GlobalPulseGlobe() {
  return (
    <div
      className="pointer-events-none fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-3 z-[85] flex w-[5.5rem] flex-col items-center md:right-4"
      aria-hidden
    >
      <div className="h-[5.5rem] w-[5.5rem] overflow-hidden rounded-full border border-[#00f2ff]/25 bg-black/50 shadow-[0_0_28px_rgba(0,242,255,0.18)] backdrop-blur-md">
        <GlobalPulseGlobeInner />
      </div>
      <span className="mt-1 max-w-[5.5rem] text-center text-[7px] font-black uppercase leading-tight tracking-[0.2em] text-[#00f2ff]/55">
        Global Pulse
      </span>
    </div>
  );
}
