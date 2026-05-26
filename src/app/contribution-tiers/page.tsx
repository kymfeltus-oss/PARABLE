'use client';

import Link from 'next/link';
import { ArrowLeft, Crown, Heart, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';

const TIERS = [
  { name: 'Seed', amount: '$5/mo', perks: 'Badge · chat highlight', borderClass: 'border-emerald-500/30' },
  { name: 'Partner', amount: '$15/mo', perks: 'Emotes · early VOD', borderClass: 'border-[#00f2ff]/35' },
  { name: 'Patron', amount: '$35/mo', perks: 'Monthly Q&A · name on stream', borderClass: 'border-violet-400/35' },
  { name: 'Ministry circle', amount: '$100/mo', perks: 'Private prayer slot · ministry shout', borderClass: 'border-amber-400/35' },
] as const;

export default function ContributionTiersPage() {
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
        <div className="flex items-center gap-2 text-[#00f2ff]">
          <Crown size={22} />
          <h1 className="text-2xl font-semibold text-white">Giving &amp; tiers</h1>
        </div>
        <p className="text-sm text-white/50 mt-2">
          Support creators and ministry streams. Checkout wiring comes next; pick a tier to reserve your intent.
        </p>
        <ul className="mt-10 space-y-4">
          {TIERS.map((t) => (
            <li
              key={t.name}
              className={`rounded-2xl border bg-black/45 px-5 py-5 ${t.borderClass}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{t.name}</p>
                  <p className="text-sm text-white/50 mt-1">{t.perks}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums text-white">{t.amount}</p>
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#00f2ff] hover:underline"
                  >
                    Select (demo)
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/profile"
          className="mt-10 inline-flex items-center gap-2 text-sm text-white/55 hover:text-[#00f2ff]"
        >
          <Heart size={16} />
          View profile &amp; wallet (coming soon)
        </Link>
        <p className="mt-6 flex items-center gap-2 text-xs text-white/35">
          <Sparkles size={14} />
          Stripe or provider hooks can replace the demo Select buttons.
        </p>
      </main>
    </div>
  );
}
