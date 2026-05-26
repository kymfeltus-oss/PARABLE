'use client';

import Link from 'next/link';
import {
  Mic2,
  Music,
  Palette,
  Radio,
  Sparkles,
  Gamepad2,
  Tv,
  Users,
} from 'lucide-react';

export type HubCategoryId =
  | 'pastor'
  | 'musician'
  | 'artist'
  | 'podcaster'
  | 'influencer'
  | 'gamer'
  | 'streamer'
  | 'member';

type HubDef = {
  id: HubCategoryId;
  title: string;
  blurb: string;
  href: string;
  Icon: typeof Mic2;
};

const HUBS: HubDef[] = [
  {
    id: 'pastor',
    title: 'Pastor',
    blurb: 'Teaching, shepherding, altar calls',
    href: '/sunday',
    Icon: Sparkles,
  },
  {
    id: 'musician',
    title: 'Musician',
    blurb: 'Worship, bands, Shed sessions',
    href: '/voices-of-praise',
    Icon: Music,
  },
  {
    id: 'artist',
    title: 'Artist',
    blurb: 'Visual story, creatives',
    href: '/community',
    Icon: Palette,
  },
  {
    id: 'podcaster',
    title: 'Podcaster',
    blurb: 'Shows & long-form voice',
    href: '/community',
    Icon: Mic2,
  },
  {
    id: 'influencer',
    title: 'Influencer',
    blurb: 'Reach & Kingdom voice',
    href: '/streamers',
    Icon: Radio,
  },
  {
    id: 'gamer',
    title: 'Gamer',
    blurb: 'Faith & gaming hubs',
    href: '/gaming',
    Icon: Gamepad2,
  },
  {
    id: 'streamer',
    title: 'Streamer',
    blurb: 'Live video & stage',
    href: '/streamers',
    Icon: Tv,
  },
  {
    id: 'member',
    title: 'Member',
    blurb: 'Your circle & browse all',
    href: '/following?tab=browse',
    Icon: Users,
  },
];

const glass =
  'rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-[#00f2ff]/35 hover:bg-white/[0.09] hover:shadow-[0_0_24px_rgba(0,242,255,0.12)]';

export function CategoryHubCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
      {HUBS.map(({ id, title, blurb, href, Icon }) => (
        <Link
          key={id}
          href={href}
          className={`group flex flex-col gap-2 ${glass}`}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#00f2ff]/25 bg-[#00f2ff]/10 text-[#00f2ff] shadow-[0_0_16px_rgba(0,242,255,0.15)] transition group-hover:shadow-[0_0_22px_rgba(0,242,255,0.28)]">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wide text-white">
              {title}
            </span>
          </div>
          <p className="text-[10px] leading-snug text-white/45">{blurb}</p>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#00f2ff]/70">
            Enter hub →
          </span>
        </Link>
      ))}
    </div>
  );
}
