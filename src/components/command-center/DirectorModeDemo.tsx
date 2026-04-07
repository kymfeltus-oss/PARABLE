'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Music2, Radio, Users } from 'lucide-react';

type Mode = 'worship' | 'word';

const CYAN = '#00f2ff';
const ORANGE = '#ff6b2c';

type FloatReaction = { id: string; emoji: string; x: number; mode: Mode };

function tryHaptic() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(14);
  }
}

export function DirectorModeDemo({
  streamLabel,
  className = '',
}: {
  streamLabel?: string;
  className?: string;
}) {
  const [mode, setMode] = useState<Mode>('worship');
  const [floats, setFloats] = useState<FloatReaction[]>([]);

  const accent = mode === 'worship' ? CYAN : ORANGE;
  const gathering = useMemo(
    () => 120 + Math.min(180, (streamLabel?.length ?? 0) * 11),
    [streamLabel]
  );

  const setModeWithHaptic = useCallback((next: Mode) => {
    setMode((prev) => {
      if (prev !== next) tryHaptic();
      return next;
    });
  }, []);

  const toggleMode = useCallback(() => {
    tryHaptic();
    setMode((m) => (m === 'worship' ? 'word' : 'worship'));
  }, []);

  const pipTap = useCallback(() => {
    tryHaptic();
    setMode((m) => (m === 'worship' ? 'word' : 'worship'));
  }, []);

  useEffect(() => {
    const worshipPool = ['🙏', '🔥', '🎸', '🎹', '🥁'];
    const wordPool = ['🙏', '💡', '📖', '✨', '🔥'];
    const pool = mode === 'worship' ? worshipPool : wordPool;
    const t = window.setInterval(() => {
      const emoji = pool[Math.floor(Math.random() * pool.length)]!;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const x = 8 + Math.random() * 84;
      setFloats((prev) => [...prev.slice(-18), { id, emoji, x, mode }]);
    }, 2200);
    return () => window.clearInterval(t);
  }, [mode]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setFloats((prev) => prev.slice(-12));
    }, 3200);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div
        className="rounded-2xl border border-white/[0.08] bg-black/50 backdrop-blur-md overflow-hidden transition-shadow duration-700"
        style={{
          boxShadow: `0 0 0 1px ${accent}22, 0 0 48px ${accent}28, inset 0 0 80px ${accent}08`,
        }}
      >
        {/* HUD frame */}
        <div className="absolute inset-3 pointer-events-none z-20 sm:inset-4">
          <div
            className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg opacity-80"
            style={{ borderColor: accent }}
          />
          <div
            className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg opacity-80"
            style={{ borderColor: accent }}
          />
          <div
            className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg opacity-80"
            style={{ borderColor: accent }}
          />
          <div
            className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-lg opacity-80"
            style={{ borderColor: accent }}
          />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-0">
          {/* Main stage */}
          <div className="relative flex-1 min-w-0">
            <div className="relative aspect-video bg-zinc-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0"
                >
                  <div
                    className="absolute inset-0 opacity-90"
                    style={{
                      background:
                        mode === 'worship'
                          ? 'radial-gradient(ellipse at 50% 120%, rgba(0,242,255,0.35), transparent 55%), linear-gradient(to bottom, #0a1620, #050508)'
                          : 'radial-gradient(ellipse at 50% 100%, rgba(255,107,44,0.28), transparent 50%), linear-gradient(to bottom, #1a1008, #050508)',
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <Radio className="mb-3 opacity-40" size={40} strokeWidth={1} style={{ color: accent }} />
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/50">
                      {mode === 'worship' ? 'Worship mix · wide stage' : 'Word mix · teacher frame'}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white/85">
                      {streamLabel ? `Channel · ${streamLabel}` : 'Sunday morning · director preview'}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      {mode === 'worship'
                        ? 'Immersive room · enhanced stereo width (demo)'
                        : 'Isolation · vocals forward, pads ducked (demo)'}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Floating reactions */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
                <AnimatePresence>
                  {floats.map((f) => (
                    <motion.span
                      key={f.id}
                      initial={{ opacity: 0, y: '100%', scale: 0.6 }}
                      animate={{ opacity: 1, y: '-20%', scale: 1 }}
                      exit={{ opacity: 0, y: '-120%' }}
                      transition={{ duration: 3.2, ease: 'easeOut' }}
                      className="absolute text-2xl bottom-0"
                      style={{ left: `${f.x}%`, transform: 'translateX(-50%)' }}
                    >
                      {f.emoji}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              <div className="absolute top-3 right-3 z-30 flex items-center gap-2 rounded-full bg-black/70 border border-white/10 px-3 py-1.5 text-xs backdrop-blur-md">
                <Users size={14} className="text-white/60 shrink-0" />
                <span className="tabular-nums text-white/85 font-semibold">{gathering}</span>
                <span className="text-white/40 hidden sm:inline">in this view</span>
              </div>

              {/* PiP ghost */}
              <button
                type="button"
                onClick={pipTap}
                className="absolute bottom-3 right-3 z-30 w-[28%] max-w-[200px] aspect-video rounded-lg border overflow-hidden text-left shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-black/80 backdrop-blur-sm"
                style={{
                  borderColor: mode === 'worship' ? `${ORANGE}99` : `${CYAN}99`,
                  boxShadow: `0 0 20px ${mode === 'worship' ? `${ORANGE}40` : `${CYAN}40`}`,
                }}
                aria-label="Swap to alternate view"
              >
                <div
                  className="absolute inset-0 opacity-95"
                  style={{
                    background:
                      mode === 'worship'
                        ? 'linear-gradient(135deg, rgba(255,107,44,0.35), #0a0a0a)'
                        : 'linear-gradient(135deg, rgba(0,242,255,0.3), #0a0a0a)',
                  }}
                />
                <div className="relative h-full flex flex-col items-center justify-center p-2">
                  {mode === 'worship' ? (
                    <BookOpen size={22} className="text-orange-200/90" />
                  ) : (
                    <Music2 size={22} className="text-cyan-200/90" />
                  )}
                  <span className="mt-1 text-[8px] font-black uppercase tracking-wider text-white/70 text-center leading-tight">
                    {mode === 'worship' ? 'Word monitor · tap' : 'Worship monitor · tap'}
                  </span>
                </div>
              </button>
            </div>

            {/* Switch console */}
            <div className="px-4 py-4 border-t border-white/[0.06] bg-black/40 backdrop-blur-md">
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/40 mb-3">
                Director console · Word vs Worship
              </p>
              <div
                className="flex rounded-2xl p-1 border bg-black/50 relative"
                style={{ borderColor: `${accent}44` }}
                role="group"
                aria-label="Primary view mode"
              >
                <button
                  type="button"
                  onClick={() => setModeWithHaptic('worship')}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors ${
                    mode === 'worship' ? 'text-black' : 'text-white/50 hover:text-white/75'
                  }`}
                  style={
                    mode === 'worship'
                      ? { backgroundColor: CYAN, boxShadow: `0 0 24px ${CYAN}55` }
                      : undefined
                  }
                >
                  <Music2 size={16} />
                  Worship
                </button>
                <button
                  type="button"
                  onClick={() => setModeWithHaptic('word')}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors ${
                    mode === 'word' ? 'text-black' : 'text-white/50 hover:text-white/75'
                  }`}
                  style={
                    mode === 'word'
                      ? { backgroundColor: ORANGE, boxShadow: `0 0 24px ${ORANGE}55` }
                      : undefined
                  }
                >
                  <BookOpen size={16} />
                  Word
                </button>
              </div>
              <button
                type="button"
                onClick={toggleMode}
                className="mt-3 w-full text-[10px] text-white/35 hover:text-white/55 uppercase tracking-widest font-semibold"
              >
                Cross-dissolve + haptic handoff
              </button>
            </div>
          </div>

          {/* Side-car */}
          <aside
            className="lg:w-[min(100%,280px)] border-t lg:border-t-0 lg:border-l border-white/[0.06] bg-black/35 backdrop-blur-md p-4 flex flex-col gap-3"
            style={{ boxShadow: mode === 'worship' ? `inset 0 0 40px ${CYAN}0a` : `inset 0 0 40px ${ORANGE}0a` }}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">Side-car</p>
            <AnimatePresence mode="wait">
              {mode === 'worship' ? (
                <motion.div
                  key="worship-side"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 flex-1 min-h-[200px]"
                >
                  <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3">
                    <p className="text-[10px] font-bold text-cyan-200/90 uppercase tracking-wider">Lyric scroll</p>
                    <p className="mt-2 text-sm text-white/80 leading-relaxed font-medium">
                      Holy, holy, holy
                      <span className="text-cyan-300/90"> · sync demo</span>
                    </p>
                    <p className="mt-2 text-xs text-white/45">Tap lines to heart or clip (demo).</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Band stand</p>
                    <ul className="mt-2 text-xs text-white/70 space-y-1.5">
                      <li>Key B · BPM 72</li>
                      <li>Keys · Mara</li>
                      <li>Drums · Eli</li>
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="word-side"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 flex-1 min-h-[200px]"
                >
                  <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3">
                    <p className="text-[10px] font-bold text-orange-200/90 uppercase tracking-wider">AI-live notes</p>
                    <p className="mt-2 text-xs text-white/75 leading-relaxed">
                      <span className="text-orange-300 font-semibold">Key point:</span> grace precedes grit — Paul,
                      Romans 5.
                    </p>
                    <p className="mt-2 text-xs text-white/45">Transcript highlights scripture in real time (demo).</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Digital Bible</p>
                    <p className="mt-2 text-sm text-white/85 font-serif">Romans 5:1–2</p>
                    <button
                      type="button"
                      className="mt-2 text-[11px] font-semibold text-orange-300 hover:text-orange-200"
                    >
                      Open passage →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </div>
    </div>
  );
}
