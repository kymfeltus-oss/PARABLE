'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';
import { DirectorModeDemo } from '@/components/command-center/DirectorModeDemo';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function WatchChannelPage() {
  const params = useParams();
  const raw = params?.id;
  const id =
    typeof raw === 'string' ? raw : Array.isArray(raw) && raw[0] ? raw[0] : 'live';

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
          Streamers
        </Link>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Live watch</p>
        <DirectorModeDemo streamLabel={id} />
      </div>
    </main>
  );
}
