'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Cpu } from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';
import { useGameEngineStore } from '@/stores/gameEngineStore';

const ParableEngineRoot = dynamic(() => import('@/components/engine/ParableEngineRoot'), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-video max-h-[min(72vh,560px)] items-center justify-center rounded-xl border border-white/10 bg-black/60 text-sm text-white/45">
      Initializing GPU renderer…
    </div>
  ),
});

export default function PlayEngineLabPage() {
  const backend = useGameEngineStore((s) => s.backend);

  return (
    <div className="relative min-h-screen bg-[#030306] text-white pb-28">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <HubBackground />
      </div>
      <Header />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-12 pt-parable-header sm:px-4">
        <Link
          href="/play"
          className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-[#00f2ff] mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Parable Play
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-[#00f2ff] mb-4">
          <Cpu size={24} strokeWidth={1.25} />
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Engine lab</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">WebGPU-first · PBR bootstrap</h1>
        <p className="mt-3 text-sm text-white/55 max-w-2xl leading-relaxed">
          This canvas uses <strong className="text-white/80 font-semibold">three.js WebGPURenderer</strong> when the browser
          allows it, with a <strong className="text-white/80 font-semibold">WebGLRenderer</strong> fallback. Imago avatars,
          Rapier physics, and ECS-style systems attach here—not inside 2D minigame timers.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[11px] font-mono text-white/70">
          <span className="text-white/40">Active backend</span>
          <span className="text-[#00f2ff] uppercase tracking-wider">{backend}</span>
        </div>

        <div className="mt-8">
          <ParableEngineRoot />
        </div>

        <p className="mt-6 text-[11px] text-white/35 leading-relaxed max-w-2xl">
          Read <code className="text-white/50">docs/GAMING_AAA_ARCHITECTURE.md</code> for ECS, client prediction, and
          Supabase state-sync. SQL sketch: <code className="text-white/50">supabase/schema-gaming-vault.sql</code>.
        </p>
      </main>
    </div>
  );
}
