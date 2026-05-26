'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';

export default function SermonCheckerPage() {
  const [notes, setNotes] = useState('');
  const [transcript, setTranscript] = useState('');
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [flags, setFlags] = useState<{ type: 'ok' | 'warn'; label: string; detail: string }[]>([]);

  const run = async () => {
    setChecking(true);
    setScore(null);
    setFlags([]);
    await new Promise((r) => setTimeout(r, 800));
    const a = notes.trim();
    const b = transcript.trim();
    const lengthDelta = Math.abs(a.length - b.length);
    const base = a && b ? 82 : a || b ? 64 : 52;
    const s = Math.max(40, Math.min(98, base - Math.min(22, Math.floor(lengthDelta / 120))));
    const next: typeof flags = [];
    if (!a) next.push({ type: 'warn', label: 'Missing notes', detail: 'Add your planned outline for a stronger check.' });
    if (!b) next.push({ type: 'warn', label: 'Missing transcript', detail: 'Paste capture or transcript from the live message.' });
    if (a && b) next.push({ type: 'ok', label: 'Theme alignment', detail: 'Core topics read as consistent.' });
    if (a && b && lengthDelta > 900)
      next.push({ type: 'warn', label: 'Length drift', detail: 'Live length diverges a lot from notes.' });
    setScore(s);
    setFlags(next);
    setChecking(false);
  };

  return (
    <div className="relative min-h-screen bg-[#050508] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
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
        <h1 className="text-2xl font-semibold">Sermon checker</h1>
        <p className="text-sm text-white/50 mt-2">Compare planned notes with what you actually said (demo scoring).</p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-medium text-white/45">Notes / outline</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 w-full min-h-[140px] rounded-xl border border-white/10 bg-black/50 p-4 text-sm outline-none focus:border-[#00f2ff]/35"
              placeholder="Paste your sermon notes…"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/45">Live transcript</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="mt-2 w-full min-h-[140px] rounded-xl border border-white/10 bg-black/50 p-4 text-sm outline-none focus:border-[#00f2ff]/35"
              placeholder="Paste transcript or live capture…"
            />
          </div>
          <button
            type="button"
            onClick={run}
            disabled={checking}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00f2ff] text-black px-5 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {checking ? <Loader2 className="animate-spin" size={18} /> : null}
            Run comparison
          </button>
        </div>

        {score !== null ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-black/45 p-6">
            <p className="text-xs text-white/45 uppercase tracking-widest">Clarity-style score</p>
            <p className="text-4xl font-bold text-[#00f2ff] mt-2 tabular-nums">{score}</p>
            <ul className="mt-6 space-y-3">
              {flags.map((f, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  {f.type === 'ok' ? (
                    <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
                  ) : (
                    <AlertTriangle className="text-amber-400 shrink-0" size={18} />
                  )}
                  <div>
                    <p className="font-medium text-white">{f.label}</p>
                    <p className="text-white/45 text-xs mt-0.5">{f.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </main>
    </div>
  );
}
