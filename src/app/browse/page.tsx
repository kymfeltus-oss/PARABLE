'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SparkleOverlay from '@/components/SparkleOverlay';

type BrowseItem = {
  id: string;
  title: string;
  subtitle: string;
  viewers: string;
  type: 'stream' | 'game' | 'parable';
  imageSrc: string;
};

const ITEMS: BrowseItem[] = [
  {
    id: 'sunday-service',
    title: 'Sunday Service Live',
    subtitle: 'Sanctuary & Sermon',
    viewers: '181K watching',
    type: 'stream',
    imageSrc: '/images/sunday-service-live.png',
  },
  {
    id: 'choir-nights',
    title: 'Choir Nights Live',
    subtitle: 'Black Church Choirs',
    viewers: '134K watching',
    type: 'stream',
    imageSrc: '/images/choir-nights-live.png',
  },
  {
    id: 'just-testifying',
    title: 'Just Testifying',
    subtitle: 'Praise Reports Only',
    viewers: '152K watching',
    type: 'stream',
    imageSrc: '/images/just-testifying.png',
  },
  {
    id: 'youth-revival',
    title: 'Youth Revival',
    subtitle: 'Gen Z on Fire',
    viewers: '55K watching',
    type: 'stream',
    imageSrc: '/images/youth-revival.png',
  },
  {
    id: 'parable-library',
    title: 'Parable Library',
    subtitle: 'Story-driven devotionals',
    viewers: '3.2K engaged',
    type: 'parable',
    imageSrc: '/images/creatives-real-talk.png',
  },
  {
    id: 'faith-gaming',
    title: 'Faith & Gaming',
    subtitle: 'Holy ops & co-op',
    viewers: '9.8K watching',
    type: 'game',
    imageSrc: '/images/street-church.png',
  },
];

export default function BrowsePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#010101] text-white relative overflow-hidden">
      <SparkleOverlay />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-full space-y-6 px-4 py-8 sm:px-4">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[6px] text-[#00f2ff]/70">
              Sanctuary // Browse
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Live catalogue
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-white/60 max-w-xl">
              Flip through live streams, games, and parables curated for the Parable community.
            </p>
          </div>
        </header>

        <section className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-28">
                <Image
                  src="/fonts/parable-logo.svg"
                  alt="Parable"
                  fill
                  className="object-contain drop-shadow-[0_0_12px_rgba(0,242,255,0.7)]"
                />
              </div>
              <span className="text-[11px] uppercase tracking-[6px] text-white/40">
                Browse everything
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.type === 'stream') router.push('/sanctuary');
                  else if (item.type === 'game') router.push('/gaming');
                  else router.push('/parables');
                }}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] text-left shadow-sm hover:border-[#00f2ff]/60 hover:bg-white/[0.06] transition-all"
              >
                <div className="relative h-32 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-black/40" />
                  <Image
                    src={item.imageSrc}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-[4px] text-white/50">
                    {item.subtitle}
                  </p>
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                  <div className="flex items-center justify-between text-[11px] text-white/45 pt-1">
                    <span>{item.viewers}</span>
                    <span className="uppercase tracking-[3px] text-[#00f2ff]">
                      {item.type}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

