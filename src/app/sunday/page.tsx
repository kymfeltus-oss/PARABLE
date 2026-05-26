'use client';

import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';
import { DirectorModeDemo } from '@/components/command-center/DirectorModeDemo';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SundayPage() {
  return (
    <main className="relative min-h-screen text-white">
      <HubBackground />
      <Header />
      <div className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-16 pt-parable-header sm:px-4">
        <Link
          href="/streamers"
          className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-[#00f2ff] mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Streamers
        </Link>
        <header className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#00f2ff]/90">
            Sunday morning experience
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">Director Mode</h1>
          <p className="mt-2 text-sm text-white/55 max-w-2xl leading-relaxed">
            Word vs Worship console, PiP handoff, side-car context, gathering count, and floating reactions — retro-future
            command center chrome (interactive preview).
          </p>
        </header>
        <DirectorModeDemo streamLabel="Featured service" />
      </div>
    </main>
  );
}
