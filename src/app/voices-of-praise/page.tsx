'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Disc3,
  Mic2,
  Radio,
  SlidersHorizontal,
  Sparkles,
  Users,
  Volume2,
  Waves,
} from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';

const LYRIC_LINES = [
  { t: 0, text: 'Holy light breaking through the night' },
  { t: 1, text: 'Every voice we raise becomes one cry' },
  { t: 2, text: 'Kingdom sound is running through this room' },
  { t: 3, text: 'We sing it loud — the promise still is true' },
] as const;

export default function VoicesOfPraisePage() {
  const [phase, setPhase] = useState(0);
  const [directorKaraoke, setDirectorKaraoke] = useState(false);
  const raf = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setPhase((p) => (p + 1) % LYRIC_LINES.length), 2200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let t = 0;
    const loop = () => {
      t += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0,242,255,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const mid = h / 2;
      for (let x = 0; x < w; x += 4) {
        const y = mid + Math.sin(x * 0.02 + t) * 18 + Math.sin(t * 2) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      for (let x = 0; x < w; x += 4) {
        const y = mid + Math.sin(x * 0.018 + t * 0.9 + 1) * 14;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const line = LYRIC_LINES[phase];

  return (
    <div className="relative min-h-screen bg-[#030306] text-white pb-28">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-45">
        <HubBackground />
      </div>
      <Header />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-12 pt-parable-header sm:px-4">
        <Link
          href="/play"
          className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-fuchsia-300 mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Parable Play
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-fuchsia-400">
            <Mic2 size={24} strokeWidth={1.25} />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Voices of Praise</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Studio-grade karaoke</h1>
          <p className="mt-3 text-sm text-white/55 max-w-2xl leading-relaxed">
            Bridge the Musician Hub and gaming energy: lyric HUD, pitch guidance, FX rack, live rooms with pass-the-mic, vocal
            duels, and Saturday choir mode tied to the Director toggle.
          </p>
        </header>

        <div className={`rounded-2xl border overflow-hidden mb-8 ${directorKaraoke ? 'border-fuchsia-500/40' : 'border-white/[0.1]'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-black/60 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 text-white/80">
              <Radio className="text-fuchsia-400" size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Director toggle</span>
            </div>
            <button
              type="button"
              onClick={() => setDirectorKaraoke((v) => !v)}
              className={[
                'rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest',
                directorKaraoke
                  ? 'border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-200'
                  : 'border-white/12 text-white/45 hover:border-white/25',
              ].join(' ')}
            >
              {directorKaraoke ? 'Karaoke mode on' : 'Karaoke mode off'}
            </button>
          </div>
          <div className={`grid ${directorKaraoke ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-0 bg-black/40`}>
            {directorKaraoke ? (
              <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-white/[0.06] p-4 aspect-video flex items-center justify-center bg-black/50">
                <div className="text-center text-white/35 text-xs uppercase tracking-widest">Live band video (PiP)</div>
              </div>
            ) : null}
            <div className={directorKaraoke ? 'md:col-span-2 p-6 md:p-8' : 'p-6 md:p-8'}>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-fuchsia-400/80 mb-4">Lyric flow HUD</p>
              <p
                className="text-2xl sm:text-3xl font-bold leading-snug text-center bg-gradient-to-r from-fuchsia-200 via-white to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(232,121,249,0.25)] min-h-[4.5rem] flex items-center justify-center px-2"
              >
                {line.text}
              </p>
              <p className="text-center text-[11px] text-white/35 mt-3">Demo scroll — sync to stems in production.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-white/[0.1] bg-black/50 backdrop-blur-md p-5">
            <div className="flex items-center gap-2 text-[#00f2ff] mb-3">
              <Waves size={18} />
              <h2 className="text-sm font-bold text-white">Pitch tracker</h2>
            </div>
            <canvas ref={canvasRef} width={360} height={120} className="w-full max-w-full h-[120px] rounded-xl border border-white/10 bg-black" />
            <p className="text-xs text-white/45 mt-2">Your take vs reference — Rock Band–style scoring hooks to Web Audio.</p>
          </div>
          <div className="rounded-2xl border border-white/[0.1] bg-black/50 backdrop-blur-md p-5">
            <div className="flex items-center gap-2 text-fuchsia-300 mb-3">
              <SlidersHorizontal size={18} />
              <h2 className="text-sm font-bold text-white">FX rack</h2>
            </div>
            <ul className="space-y-2 text-sm text-white/55">
              <li className="flex justify-between border border-white/10 rounded-lg px-3 py-2">
                <span>Auto-tune</span>
                <span className="text-white/35 text-xs">Off · Mild · Stage</span>
              </li>
              <li className="flex justify-between border border-white/10 rounded-lg px-3 py-2">
                <span>Cathedral reverb</span>
                <span className="text-emerald-400/90 text-xs">On</span>
              </li>
              <li className="flex justify-between border border-white/10 rounded-lg px-3 py-2">
                <span>Harmonizer choir</span>
                <span className="text-white/35 text-xs">3rd · 5th</span>
              </li>
            </ul>
          </div>
        </div>

        <section className="rounded-2xl border border-white/[0.08] bg-black/45 backdrop-blur-md p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Users className="text-fuchsia-400" size={18} />
            <h2 className="text-sm font-bold text-white">Live huddle room</h2>
          </div>
          <p className="text-sm text-white/55 mb-4">
            Eight slots backstage, audience scale unlimited, pass-the-mic queue visible in the rail. Vocal Boosts map to emoji
            light shows on the singer HUD.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Queue: You', 'Next: MIA', 'Audience: 240'].map((x) => (
              <span key={x} className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/60">
                {x}
              </span>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] p-5">
            <div className="flex items-center gap-2 text-cyan-300 mb-2">
              <Disc3 size={18} />
              <h2 className="text-sm font-bold text-white">Musician pipeline</h2>
            </div>
            <p className="text-sm text-white/55 leading-relaxed mb-3">
              Official backing tracks, duet ghosts, and scouting pings when someone clears a high bar on your song.
            </p>
            <Link href="/music-hub" className="text-xs font-bold text-cyan-300 hover:underline uppercase tracking-widest">
              Artist Hub
            </Link>
          </div>
          <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.07] p-5">
            <div className="flex items-center gap-2 text-violet-300 mb-2">
              <Sparkles size={18} />
              <h2 className="text-sm font-bold text-white">Virtual choir · Saturday</h2>
            </div>
            <p className="text-sm text-white/55 leading-relaxed mb-3">
              Worship leader triggers choir mode; home mics blend server-side for a mass harmony return channel (integrate with
              your audio bus).
            </p>
            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <Volume2 size={14} />
              Director toggle above shrinks band video when leading from home.
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/imago"
            className="inline-flex items-center rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-xs font-bold text-white/80 hover:border-[#00f2ff]/35 transition-colors"
          >
            Imago emotes on stage
          </Link>
          <Link
            href="/music-hub"
            className="inline-flex items-center rounded-xl border border-fuchsia-500/35 bg-fuchsia-500/10 px-4 py-2.5 text-xs font-bold text-fuchsia-200 hover:bg-fuchsia-500/20 transition-colors"
          >
            Open Artist Hub
          </Link>
        </div>
      </main>
    </div>
  );
}
