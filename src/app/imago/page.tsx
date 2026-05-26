'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Crown,
  Footprints,
  Layers,
  Shirt,
  Sparkles,
  Swords,
  UserRound,
  Wand2,
} from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';

const TABS = [
  { id: 'sculpt', label: 'Sculpt', icon: UserRound },
  { id: 'apparel', label: 'Apparel', icon: Shirt },
  { id: 'armor', label: 'Armor of God', icon: Swords },
  { id: 'aura', label: 'Aura', icon: Sparkles },
  { id: 'loadout', label: 'Loadouts', icon: Layers },
  { id: 'emotes', label: 'Emotes', icon: Wand2 },
  { id: 'mirror', label: 'Mirror', icon: Camera },
] as const;

type TabId = (typeof TABS)[number]['id'];

const LOADOUTS = [
  { id: 'athlete', name: 'The Athlete', sub: 'Hoops · Gridiron', items: 'Jersey, tape, pro sneakers' },
  { id: 'nomad', name: 'The Nomad', sub: 'Narrow Road', items: 'Street-saint kit, shades, pack' },
  { id: 'warrior', name: 'The Warrior', sub: 'Armor Up', items: 'Full battle overlay + shield FX' },
  { id: 'creator', name: 'The Creator', sub: 'Streamer hub', items: 'Studio cans, clean casual' },
] as const;

const EMOTES = [
  'Hands lifted',
  'Davidic step',
  'Deep prayer',
  'Point up',
  'Jersey scripture point',
  'Artist entrance (locked)',
] as const;

export default function ImagoPage() {
  const [tab, setTab] = useState<TabId>('sculpt');
  const [armorOn, setArmorOn] = useState(false);
  const [aura, setAura] = useState<'cyan' | 'gold' | 'white'>('cyan');

  return (
    <div className="relative min-h-screen bg-[#030306] text-white pb-28">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
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

        <header className="mb-8">
          <div className="flex items-center gap-2 text-[#00f2ff]">
            <Crown size={22} strokeWidth={1.25} />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Imago</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Digital locker · wardrobe</h1>
          <p className="mt-3 text-sm text-white/55 max-w-2xl leading-relaxed">
            One high-fidelity avatar for the feed, the court, and the metropolis. This module is the 2K-style builder shell:
            sculpt, layer street-saint merch, toggle Armor of God for battle modes, tune your aura, and snap a pose for the
            hybrid profile.
          </p>
        </header>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="rounded-2xl border border-[#00f2ff]/25 bg-black/60 backdrop-blur-md aspect-[3/4] max-h-[520px] flex flex-col items-center justify-center relative overflow-hidden">
              <div
                className={[
                  'absolute inset-0 opacity-40 blur-3xl',
                  aura === 'cyan' ? 'bg-[radial-gradient(circle,rgba(0,242,255,0.35),transparent_60%)]' : '',
                  aura === 'gold' ? 'bg-[radial-gradient(circle,rgba(234,179,8,0.35),transparent_60%)]' : '',
                  aura === 'white' ? 'bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_60%)]' : '',
                ].join(' ')}
              />
              <div className="relative z-10 text-center px-6">
                <div className="mx-auto h-28 w-28 rounded-full border-2 border-white/20 bg-gradient-to-b from-white/15 to-black/40 flex items-center justify-center shadow-[0_0_40px_rgba(0,242,255,0.15)]">
                  <UserRound className="text-white/50" size={48} strokeWidth={1} />
                </div>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-white/35">Idle preview</p>
                <p className="mt-1 text-sm text-white/60">
                  Ball spin · air guitar · sower satchel — wire animation clips to state.
                </p>
                {armorOn ? (
                  <p className="mt-3 text-[11px] font-bold text-violet-300 uppercase tracking-widest">Armor overlay active</p>
                ) : null}
              </div>
              <Footprints className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#00f2ff]/30" size={32} />
            </div>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2 space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors',
                    tab === id
                      ? 'border-[#00f2ff]/50 bg-[#00f2ff]/15 text-[#00f2ff]'
                      : 'border-white/10 bg-white/[0.04] text-white/45 hover:border-white/20',
                  ].join(' ')}
                >
                  <Icon size={14} strokeWidth={1.25} />
                  {label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/[0.1] bg-black/50 backdrop-blur-md p-5 min-h-[280px]">
              {tab === 'sculpt' && (
                <div className="space-y-4 text-sm text-white/60">
                  <p className="text-white font-semibold text-base">Foundational sculpt</p>
                  <p>Height, build, and facial sliders with inclusive legacy tones and hair textures—shader-ready metadata lives here.</p>
                  <div className="space-y-3 pt-2">
                    {['Height', 'Build', 'Face depth', 'Skin tone', 'Hair'].map((label) => (
                      <label key={label} className="block">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white/35">{label}</span>
                        <input type="range" className="mt-1 w-full accent-[#00f2ff]" defaultValue={50} />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'apparel' && (
                <div className="text-sm text-white/60 space-y-3">
                  <p className="text-white font-semibold text-base">Street-saint & layers</p>
                  <p>Hoodies, tech joggers, limited sneaker drops from musicians—GTA-style layering with chains and cross earrings.</p>
                  <ul className="grid sm:grid-cols-2 gap-2 pt-2">
                    {['Oversized covenant hoodie', 'Tech-wear joggers', 'Scripture chain', 'Cross studs'].map((x) => (
                      <li key={x} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tab === 'armor' && (
                <div className="text-sm text-white/60 space-y-4">
                  <p className="text-white font-semibold text-base">Armor of God overlay</p>
                  <p>Breastplate, shield, helmet, and visor FX stack over street clothes when you queue competitive spiritual modes.</p>
                  <button
                    type="button"
                    onClick={() => setArmorOn((v) => !v)}
                    className={[
                      'rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-widest',
                      armorOn
                        ? 'border-violet-400/60 bg-violet-500/20 text-violet-200'
                        : 'border-white/15 bg-white/[0.06] text-white/70',
                    ].join(' ')}
                  >
                    {armorOn ? 'Armor equipped' : 'Equip armor preview'}
                  </button>
                </div>
              )}

              {tab === 'aura' && (
                <div className="text-sm text-white/60 space-y-4">
                  <p className="text-white font-semibold text-base">Aura · trails</p>
                  <p>Particle halo scales with streaks and community influence; trails follow sprints and dunks.</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { id: 'cyan' as const, label: 'Neon cyan pulse' },
                        { id: 'gold' as const, label: 'Golden shimmer' },
                        { id: 'white' as const, label: 'Soft white' },
                      ]
                    ).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAura(a.id)}
                        className={[
                          'rounded-xl border px-3 py-2 text-xs font-semibold',
                          aura === a.id ? 'border-[#00f2ff]/50 text-[#00f2ff]' : 'border-white/10 text-white/55',
                        ].join(' ')}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'loadout' && (
                <ul className="space-y-3">
                  {LOADOUTS.map((L) => (
                    <li key={L.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-sm font-bold text-white">{L.name}</p>
                      <p className="text-[11px] text-[#00f2ff] uppercase tracking-wider mt-0.5">{L.sub}</p>
                      <p className="text-xs text-white/50 mt-1">{L.items}</p>
                    </li>
                  ))}
                </ul>
              )}

              {tab === 'emotes' && (
                <ul className="grid sm:grid-cols-2 gap-2">
                  {EMOTES.map((e) => (
                    <li key={e} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">
                      {e}
                    </li>
                  ))}
                </ul>
              )}

              {tab === 'mirror' && (
                <div className="text-sm text-white/60 space-y-3">
                  <p className="text-white font-semibold text-base">Imago mirror</p>
                  <p>Snap a pose and push it to your PARABLE profile picture; friends upvote fits in the Closet hub for Influence.</p>
                  <button
                    type="button"
                    className="rounded-xl border border-[#00f2ff]/40 bg-[#00f2ff]/10 px-4 py-2 text-xs font-bold text-[#00f2ff]"
                  >
                    Snap pose (demo)
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/play"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white/85 hover:border-[#00f2ff]/35 transition-colors"
              >
                Back to launcher
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-xl border border-[#00f2ff]/40 bg-[#00f2ff]/10 px-4 py-2.5 text-xs font-bold text-[#00f2ff] hover:bg-[#00f2ff]/20 transition-colors"
              >
                Profile card
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
