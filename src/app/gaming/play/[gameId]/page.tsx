'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';
import { ActivityGamePlayer } from '@/components/gaming/ActivityGameChrome';
import NarrowRoadGame from '@/components/games/NarrowRoadGame';
import ArmorUpGame from '@/components/games/ArmorUpGame';
import KingdomHoopsGame from '@/components/games/KingdomHoopsGame';
import GridironGloryGame from '@/components/games/GridironGloryGame';
import { PLAY_GAMES } from '@/lib/play-catalog';

const GAMES = {
  'narrow-road': {
    title: 'The Narrow Road',
    subtitle: 'Drive the metropolis · complete outreach ops (E in the ring).',
    Component: NarrowRoadGame,
  },
  'armor-up': {
    title: 'Armor Up: The Last Stand',
    subtitle: 'Harvest Truth, Spirit, and Grace · build before the storm wins.',
    Component: ArmorUpGame,
  },
  'kingdom-hoops': {
    title: 'Kingdom Hoops',
    subtitle: 'Gather & release shot arc · defender shrinks green · rhythm doubles XP.',
    Component: KingdomHoopsGame,
  },
  'gridiron-glory': {
    title: 'Gridiron Glory',
    subtitle: 'Pass power zones + lead reticle · run timing lane · Unity burst.',
    Component: GridironGloryGame,
  },
} as const;

type GameId = keyof typeof GAMES;

export default function PlayGamePage() {
  const params = useParams();
  const router = useRouter();
  const raw = params?.gameId;
  const gameId = (typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '') as GameId;
  const entry = gameId && gameId in GAMES ? GAMES[gameId] : null;

  useEffect(() => {
    if (!entry) router.replace('/gaming');
  }, [entry, router]);

  if (!entry) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-sm text-white/45">
        Loading…
      </div>
    );
  }

  const { title, subtitle, Component } = entry;
  const tile = PLAY_GAMES.find((g) => g.id === gameId);
  const accentBarClass = tile?.accentBar ?? 'bg-[#00f2ff]';

  return (
    <div className="relative min-h-screen bg-[#0c0d10] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.35]">
        <HubBackground />
      </div>
      <Header />
      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-20 pt-parable-header">
        <Link
          href="/gaming"
          className="mb-5 inline-flex items-center gap-2 text-xs text-[#b5bac1] transition hover:text-[#00f2ff]"
        >
          <ArrowLeft size={14} />
          All games
        </Link>
        <ActivityGamePlayer
          title={title}
          subtitle={subtitle}
          backHref="/gaming"
          backLabel="Close"
          accentBarClass={accentBarClass}
        >
          <Component />
        </ActivityGamePlayer>
      </main>
    </div>
  );
}
