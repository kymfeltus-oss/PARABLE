'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, HeartHandshake, MessageCircle, Users } from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';

const HUBS = [
  {
    href: '/fellowship',
    title: 'Fellowship rooms',
    desc: 'Prayer, study, and small-group style spaces.',
    icon: HeartHandshake,
  },
  { href: '/following', title: 'Following', desc: 'People and channels you follow.', icon: Users },
  { href: '/table', title: 'The Table', desc: 'Study groups and hosted tables.', icon: BookOpen },
  { href: '/testify', title: 'Testify', desc: 'Stories, portal feed, and live energy.', icon: MessageCircle },
] as const;

export default function CommunityPage() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-35">
        <HubBackground />
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
        <h1 className="text-2xl font-semibold">Community</h1>
        <p className="text-sm text-white/50 mt-2">Choose where you want to connect.</p>
        <ul className="mt-10 space-y-3">
          {HUBS.map(({ href, title, desc, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-4 hover:border-[#00f2ff]/35 transition-colors"
              >
                <Icon className="text-[#00f2ff] shrink-0 mt-0.5" size={22} />
                <div>
                  <p className="font-semibold text-white">{title}</p>
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
