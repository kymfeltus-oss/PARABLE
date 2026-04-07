'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pause, Play, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';

export default function TeleprompterPage() {
  const [text, setText] = useState(
    "Welcome, church.\n\nToday we anchor in grace — not as a slogan, but as power.\n\n[ASK FOR AMENS]\n\nOpen with me to Romans 5…\n\n[START POLL — How are you arriving today?]"
  );
  const [speed, setSpeed] = useState(28);
  const [playing, setPlaying] = useState(false);
  const [fontPx, setFontPx] = useState(22);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      el.scrollTop += speed / 60;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <HubBackground />
      </div>
      <Header />
      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-16 pt-parable-header">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/streamers"
            className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-[#00f2ff] transition-colors"
          >
            <ArrowLeft size={14} />
            Streamers hub
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00f2ff] text-black px-4 py-2 text-sm font-semibold"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? 'Pause' : 'Run'}
            </button>
            <button
              type="button"
              onClick={() => {
                scrollRef.current && (scrollRef.current.scrollTop = 0);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80"
            >
              <RotateCcw size={16} />
              Top
            </button>
          </div>
        </div>
        <h1 className="text-xl font-semibold">Teleprompter</h1>
        <p className="text-sm text-white/45 mt-1">Paste your message; scroll speed and size are yours.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-white/40">
            Scroll speed
            <input
              type="range"
              min={8}
              max={64}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="mt-2 w-full accent-[#00f2ff]"
            />
          </label>
          <label className="block text-xs text-white/40">
            Font size
            <input
              type="range"
              min={14}
              max={36}
              value={fontPx}
              onChange={(e) => setFontPx(Number(e.target.value))}
              className="mt-2 w-full accent-[#00f2ff]"
            />
          </label>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-4 w-full min-h-[140px] rounded-xl border border-white/10 bg-zinc-950/80 p-4 text-sm text-white/90 outline-none focus:border-[#00f2ff]/40"
          placeholder="Paste notes…"
        />

        <div
          className="mt-6 rounded-2xl border border-[#00f2ff]/25 bg-zinc-950 overflow-hidden"
          style={{ height: 'min(55vh, 420px)' }}
        >
          <div
            id="parable-teleprompter-main"
            ref={scrollRef}
            className="h-full overflow-y-auto px-6 py-8 custom-tele-scroll"
            style={{ fontSize: fontPx, lineHeight: 1.55, fontWeight: 600 }}
          >
            {text.split('\n').map((line, i) => (
              <p key={i} className="mb-4 text-white/90">
                {line.startsWith('[') ? (
                  <span className="text-[#ff6b2c] font-black tracking-wide">{line}</span>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </div>
        <style jsx global>{`
          .custom-tele-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .custom-tele-scroll::-webkit-scrollbar-thumb {
            background: rgba(0, 242, 255, 0.25);
            border-radius: 6px;
          }
        `}</style>
      </main>
    </div>
  );
}
