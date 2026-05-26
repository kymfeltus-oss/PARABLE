'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Church, Clock, MapPin, Play, Sparkles, Sun } from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';

type MinistryStream = {
  id: string;
  name: string;
  city: string;
  serviceTime: string;
  focus: string;
  watchId: string;
  accent: 'cyan' | 'orange';
};

const MINISTRIES: MinistryStream[] = [
  {
    id: 'grace-main',
    name: 'Grace Cathedral Live',
    city: 'Atlanta, GA',
    serviceTime: '9:00 & 11:00 AM ET',
    focus: 'Worship block + teaching',
    watchId: 'lr1',
    accent: 'cyan',
  },
  {
    id: 'upper-room',
    name: 'Upper Room Revival',
    city: 'Dallas, TX',
    serviceTime: '10:30 AM CT',
    focus: 'Prayer + testimony',
    watchId: 'lr4',
    accent: 'orange',
  },
  {
    id: 'hope-city',
    name: 'Hope City Church',
    city: 'Chicago, IL',
    serviceTime: '8:45 AM CT',
    focus: 'Family service · kids choir',
    watchId: 'lr2',
    accent: 'cyan',
  },
  {
    id: 'riverside',
    name: 'Riverside Bible',
    city: 'Tampa, FL',
    serviceTime: '11:15 AM ET',
    focus: 'Expository series',
    watchId: 'lr3',
    accent: 'cyan',
  },
  {
    id: 'kingdom-biz',
    name: 'Kingdom Business Fellowship',
    city: 'Online',
    serviceTime: '12:00 PM ET',
    focus: 'Faith & marketplace',
    watchId: 'lr5',
    accent: 'orange',
  },
  {
    id: 'freedom-house',
    name: 'Freedom House',
    city: 'Houston, TX',
    serviceTime: '9:30 AM CT',
    focus: 'Deliverance · worship',
    watchId: 'lr6',
    accent: 'orange',
  },
];

export default function AISanctuaryPage() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-white selection:bg-[#00f2ff]/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HubBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff6b2c]/[0.06] via-transparent to-black/90" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-20 pt-parable-header sm:px-4">
        <Link
          href="/streamers"
          className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-[#00f2ff] mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Streamers hub
        </Link>

        <div className="rounded-2xl border border-[#ff6b2c]/25 bg-gradient-to-br from-[#ff6b2c]/[0.12] to-black/60 p-6 sm:p-8 mb-10 backdrop-blur-sm">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff6b2c]/35 bg-black/40">
              <Sun className="text-[#ffb89a]" size={28} strokeWidth={1.25} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#ffb89a]/90">
                AI Sanctuary
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Sunday morning · pick a ministry stream
              </h1>
              <p className="mt-3 text-sm text-white/55 leading-relaxed max-w-2xl">
                Browse churches and ministries broadcasting this weekend. Jump into a live watch room or open Director
                Mode for Word vs Worship when the stream supports it.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/sunday"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ff6b2c] text-black px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Sparkles size={16} />
              Director Mode
            </Link>
            <Link
              href="/streamers"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/[0.09] transition-colors"
            >
              Live rolodex
            </Link>
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40 mb-4">Ministries on stream</p>

        <ul className="space-y-4">
          {MINISTRIES.map((m, i) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                className={`rounded-2xl border bg-black/45 backdrop-blur-md overflow-hidden transition-colors hover:border-opacity-80 ${
                  m.accent === 'orange'
                    ? 'border-[#ff6b2c]/30 hover:border-[#ff6b2c]/50'
                    : 'border-[#00f2ff]/20 hover:border-[#00f2ff]/40'
                }`}
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <Church
                      className={m.accent === 'orange' ? 'text-[#ffb89a]' : 'text-[#00f2ff]'}
                      size={22}
                      strokeWidth={1.25}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-white">{m.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} className="shrink-0 opacity-70" />
                        {m.city}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} className="shrink-0 opacity-70" />
                        {m.serviceTime}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/50">{m.focus}</p>
                  </div>
                  <Link
                    href={`/watch/${m.watchId}`}
                    className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 ${
                      m.accent === 'orange'
                        ? 'bg-[#ff6b2c]/90 text-black'
                        : 'bg-[#00f2ff] text-black'
                    }`}
                  >
                    <Play size={16} fill="currentColor" />
                    Watch
                  </Link>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>

        <p className="mt-10 text-center text-[11px] text-white/30 leading-relaxed max-w-md mx-auto">
          Schedules and ministries are demo data for the product vision. Wire your CMS or provider to replace this list.
        </p>
      </main>
    </div>
  );
}
