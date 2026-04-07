'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, FlaskConical, Mic2, Sparkles, Video, Wand2 } from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';

const LINKS = [
  { href: '/lab', label: 'Study Lab', desc: 'Theory solver, verse tools, sermon prep', icon: FlaskConical },
  { href: '/live-studio', label: 'Live Studio', desc: 'Go live with camera and chat', icon: Video },
  { href: '/teleprompter', label: 'Teleprompter', desc: 'Scroll notes while you stream', icon: FileText },
  { href: '/sermon-checker', label: 'Sermon checker', desc: 'Compare notes vs transcript', icon: Wand2 },
  { href: '/sunday', label: 'Director Mode', desc: 'Word vs Worship viewer experience', icon: Mic2 },
  { href: '/testify', label: 'Testify feed', desc: 'Community portal & clips', icon: Sparkles },
] as const;

export default function AIStudioPage() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HubBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00f2ff]/[0.04] to-black" />
      </div>
      <Header />
      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-16 pt-parable-header">
        <Link
          href="/streamers"
          className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-[#00f2ff] mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Streamers hub
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#00f2ff]/30 bg-[#00f2ff]/10">
            <Sparkles className="text-[#00f2ff]" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">AI Studio</h1>
            <p className="text-sm text-white/50 mt-0.5">Creator tools across PARABLE</p>
          </div>
        </div>
        <ul className="mt-10 space-y-3">
          {LINKS.map(({ href, label, desc, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-4 hover:border-[#00f2ff]/35 transition-colors"
              >
                <Icon className="text-[#00f2ff] shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-white">{label}</p>
                  <p className="text-xs text-white/45 mt-1">{desc}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
