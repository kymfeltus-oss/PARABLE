'use client';

import Header from '@/components/Header';
import HubManager from '@/components/hubs/HubManager';

export default function HubsPortalPage() {
  return (
    <div className="min-h-[100dvh] bg-[#030306] text-white pb-parable-bottom">
      <Header />
      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-12 pt-parable-header">
        <header className="mb-8 max-w-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#00f2ff]/70">Hub controller</p>
          <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Nav-Portal
            <span className="text-[#00f2ff]"> · five hubs</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Spin the Rolodex to swap environments. Tools load from your Supabase{' '}
            <code className="text-white/50">profiles.role</code> and optional progression fields. Kingdom XP opens
            milestone paths before roles are upgraded.
          </p>
        </header>

        <HubManager />
      </main>
    </div>
  );
}
