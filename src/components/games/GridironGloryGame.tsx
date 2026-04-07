'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

type Phase = 'pick' | 'pass_charge' | 'pass_lead' | 'run_timing' | 'result';
type PassZone = 'blue' | 'gold' | 'red' | 'bad';

const FIELD_W = 320;
const FIELD_H = 120;

function passZoneForPower(p: number): PassZone {
  if (p < 32) return 'blue';
  if (p <= 68) return 'gold';
  if (p <= 92) return 'red';
  return 'bad';
}

type DriveState = {
  yardLine: number;
  down: number;
  unity: number;
  won: boolean;
  lost: boolean;
};

type DriveAction =
  | { type: 'RESET' }
  | { type: 'RESOLVE'; gain: number; unityDelta: number }
  | { type: 'PICK'; unityDelta: number };

function driveReducer(state: DriveState, action: DriveAction): DriveState {
  if (action.type === 'RESET') {
    return { yardLine: 25, down: 1, unity: 72, won: false, lost: false };
  }
  if (action.type === 'PICK') {
    const unity = Math.max(42, Math.min(100, state.unity + action.unityDelta));
    return { ...state, unity, lost: true, won: false };
  }
  const { gain, unityDelta } = action;
  const unity = Math.max(42, Math.min(100, state.unity + unityDelta));
  const nextYard = Math.max(0, Math.min(110, state.yardLine + gain));
  if (nextYard >= 100) {
    return { ...state, yardLine: nextYard, unity, won: true, lost: false };
  }
  const nextDown = gain >= 8 ? 1 : state.down + 1;
  if (nextDown > 4) {
    return { ...state, unity, lost: true, won: false };
  }
  return { ...state, yardLine: nextYard, down: nextDown, unity, won: false, lost: false };
}

export default function GridironGloryGame() {
  const [drive, dispatch] = useReducer(driveReducer, {
    yardLine: 25,
    down: 1,
    unity: 72,
    won: false,
    lost: false,
  });
  const driveRef = useRef(drive);
  driveRef.current = drive;
  const { yardLine, down, unity, won, lost } = drive;

  const [log, setLog] = useState<string[]>(['Ball on your 25. Reach 100 for a touchdown.']);
  const [phase, setPhase] = useState<Phase>('pick');
  const [lastGain, setLastGain] = useState(0);
  const [hudFlash, setHudFlash] = useState<string | null>(null);
  const [passPower, setPassPower] = useState(0);
  const passPowerRef = useRef(0);
  const [leadPos, setLeadPos] = useState({ x: 160, y: 60 });
  const [optimalLead] = useState(() => ({ x: 155 + Math.random() * 50, y: 45 + Math.random() * 35 }));

  const passChargingRef = useRef(false);
  const runMarkerRef = useRef(0);
  const runDirRef = useRef(1);
  const [runTick, setRunTick] = useState(0);

  const push = useCallback((line: string) => {
    setLog((l) => [line, ...l].slice(0, 8));
  }, []);

  const flash = (t: string) => {
    setHudFlash(t);
    window.setTimeout(() => setHudFlash(null), 1400);
  };

  const finishPlay = useCallback(
    (gain: number, unityDelta: number, line: string) => {
      const prev = driveRef.current;
      const next = driveReducer(prev, { type: 'RESOLVE', gain, unityDelta });
      setLastGain(gain);
      dispatch({ type: 'RESOLVE', gain, unityDelta });
      setPhase('result');

      if (next.won) {
        push(`${line} — touchdown!`);
        flash('TOUCHDOWN');
      } else if (next.lost) {
        if (gain < 0) push(line);
        else push(`Stuffed on down ${prev.down}. Turnover on downs.`);
      } else if (gain >= 8) {
        push(`${line} · first down!`);
      } else {
        push(`${line} · down ${next.down}`);
      }
    },
    [push]
  );

  const pickSixFlow = useCallback(() => {
    push('Jumped route — interception. Drive over.');
    setLastGain(0);
    dispatch({ type: 'PICK', unityDelta: -5 });
    setPhase('result');
    flash('DEFENSE READ');
  }, [push]);

  const startPassCharge = useCallback(() => {
    if (phase !== 'pick' || won || lost) return;
    setPhase('pass_charge');
    passChargingRef.current = true;
    setPassPower(0);
    passPowerRef.current = 0;
  }, [phase, won, lost]);

  useEffect(() => {
    if (phase !== 'pass_charge' || !passChargingRef.current) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      if (!passChargingRef.current) return;
      const t = (now - t0) / 1000;
      const u = (t * 58) % 100;
      passPowerRef.current = u;
      setPassPower(u);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const releasePassCharge = useCallback(() => {
    if (phase !== 'pass_charge') return;
    passChargingRef.current = false;
    const p = passPowerRef.current;
    const zone = passZoneForPower(p);
    if (zone === 'bad') {
      finishPlay(-4, -3, 'Pass — overcharge. Sack yardage.');
      return;
    }
    setPhase('pass_lead');
    flash(zone === 'gold' ? 'BULLET WINDOW' : zone === 'blue' ? 'TOUCH PASS' : 'RISK WINDOW');
  }, [phase, finishPlay]);

  const confirmPassLead = useCallback(() => {
    if (phase !== 'pass_lead' || won || lost) return;
    const d = Math.hypot(leadPos.x - optimalLead.x, leadPos.y - optimalLead.y);
    const leadScore = Math.max(0, 1 - d / 90);
    const zone = passZoneForPower(passPowerRef.current);

    let base = 0;
    let uDelta = 0;
    if (zone === 'gold') {
      base = 12 + Math.floor(Math.random() * 14) + Math.floor(leadScore * 12);
      uDelta = 6;
    } else if (zone === 'blue') {
      base = 5 + Math.floor(Math.random() * 8) + Math.floor(leadScore * 8);
      uDelta = 3;
    } else {
      if (Math.random() < 0.38 - leadScore * 0.22) {
        pickSixFlow();
        return;
      }
      base = 4 + Math.floor(Math.random() * 10) + Math.floor(leadScore * 6);
      uDelta = -2;
    }

    const inspired = unity >= 78 ? Math.floor(Math.random() * 8) : 0;
    const gain = base + inspired;
    finishPlay(gain, uDelta + (leadScore > 0.75 ? 2 : 0), `Pass (${zone}) +${gain} yds`);
  }, [phase, won, lost, leadPos, optimalLead, unity, finishPlay, pickSixFlow]);

  useEffect(() => {
    if (phase !== 'run_timing' || won || lost) return;
    runMarkerRef.current = 0;
    runDirRef.current = 1;
    let raf = 0;
    const loop = () => {
      runMarkerRef.current += runDirRef.current * 1.85;
      if (runMarkerRef.current >= 100) runDirRef.current = -1;
      if (runMarkerRef.current <= 0) runDirRef.current = 1;
      setRunTick((t) => (t + 1) % 10000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, won, lost]);

  const hitRunHole = useCallback(() => {
    if (phase !== 'run_timing' || won || lost) return;
    const m = runMarkerRef.current;
    const greenLo = 44;
    const greenHi = 58;
    let base = 2 + Math.floor(Math.random() * 5);
    if (m >= greenLo && m <= greenHi) {
      base += 6 + Math.floor(Math.random() * 8);
      flash('HIT STICK HOLE');
    }
    const inspired = unity >= 78 ? Math.floor(Math.random() * 8) : 0;
    const gain = base + inspired;
    finishPlay(gain, 4, `Inside run +${gain} yds`);
  }, [phase, won, lost, unity, finishPlay]);

  const runWisdom = useCallback(() => {
    if (phase !== 'pick' || won || lost) return;
    const base = 5 + Math.floor(unity / 22) + Math.floor(Math.random() * 10);
    const inspired = unity >= 78 ? Math.floor(Math.random() * 10) : 0;
    const gain = base + inspired;
    finishPlay(gain, -8, `Wisdom audible +${gain} yds`);
  }, [phase, won, lost, unity, finishPlay]);

  const continueDrive = useCallback(() => {
    if (won || lost) return;
    setPhase('pick');
    setPassPower(0);
    passPowerRef.current = 0;
    setLeadPos({ x: 160, y: 60 });
  }, [won, lost]);

  const reset = () => {
    dispatch({ type: 'RESET' });
    setLog(['Ball on your 25. Reach 100 for a touchdown.']);
    setPhase('pick');
    setLastGain(0);
    setPassPower(0);
    passPowerRef.current = 0;
    passChargingRef.current = false;
    setLeadPos({ x: 160, y: 60 });
  };

  const zoneColor = (z: PassZone) => {
    if (z === 'blue') return 'bg-sky-500/85';
    if (z === 'gold') return 'bg-amber-400/95';
    if (z === 'red') return 'bg-red-500/80';
    return 'bg-white/30';
  };

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-full space-y-5">
      {hudFlash ? (
        <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full border border-[#00f2ff]/50 bg-black/80 text-[10px] font-black uppercase tracking-[0.2em] text-[#00f2ff] shadow-[0_0_24px_rgba(0,242,255,0.25)]">
          {hudFlash}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-2.5 sm:p-3">
          <p className="text-[9px] text-white/45 uppercase tracking-wider">Yard line</p>
          <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">{Math.min(100, yardLine)}</p>
        </div>
        <div className="rounded-xl border border-white/15 bg-white/5 p-2.5 sm:p-3">
          <p className="text-[9px] text-white/45 uppercase tracking-wider">Down</p>
          <p className="text-xl sm:text-2xl font-bold text-[#00f2ff] tabular-nums">{won || lost ? '—' : down}</p>
        </div>
        <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-2.5 sm:p-3">
          <p className="text-[9px] text-white/45 uppercase tracking-wider">Unity</p>
          <p className="text-xl sm:text-2xl font-bold text-cyan-200 tabular-nums">{unity}</p>
        </div>
      </div>

      <div className="h-3 rounded-full bg-black/50 border border-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-[#00f2ff] transition-all duration-300"
          style={{ width: `${Math.min(100, yardLine)}%` }}
        />
      </div>

      {phase === 'pick' && !won && !lost ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              if (phase !== 'pick' || won || lost) return;
              setPhase('run_timing');
            }}
            className="rounded-xl border border-white/15 bg-white/5 py-3.5 text-xs sm:text-sm font-bold text-white hover:border-[#00f2ff]/40"
          >
            Inside run
          </button>
          <button
            type="button"
            onClick={startPassCharge}
            className="rounded-xl border border-white/15 bg-white/5 py-3.5 text-xs sm:text-sm font-bold text-white hover:border-[#00f2ff]/40"
          >
            Shot play
          </button>
          <button
            type="button"
            onClick={runWisdom}
            className="rounded-xl border border-amber-400/35 bg-amber-500/10 py-3.5 text-xs sm:text-sm font-bold text-amber-100 hover:border-amber-400/60"
          >
            Wisdom audible
          </button>
        </div>
      ) : null}

      {phase === 'pass_charge' && !won && !lost ? (
        <div className="space-y-3">
          <p className="text-[11px] text-white/50 text-center">
            Power cycles — tap release in blue (touch), gold (bullet), or red (risk).
          </p>
          <div className="relative h-16 rounded-xl border border-white/15 bg-black/60 overflow-hidden">
            <div className="absolute inset-y-2 left-[8%] right-[68%] rounded-lg bg-sky-500/25 border border-sky-400/40" />
            <div className="absolute inset-y-2 left-[32%] right-[32%] rounded-lg bg-amber-400/25 border border-amber-300/50" />
            <div className="absolute inset-y-2 left-[68%] right-[8%] rounded-lg bg-red-500/20 border border-red-400/35" />
            <div
              className={`absolute top-1 bottom-1 w-2 rounded-full shadow-[0_0_16px_rgba(255,255,255,0.45)] ${zoneColor(passZoneForPower(passPower))}`}
              style={{ left: `calc(${passPower}% - 4px)` }}
            />
          </div>
          <button
            type="button"
            onClick={releasePassCharge}
            className="w-full rounded-xl bg-[#00f2ff]/15 border border-[#00f2ff]/40 py-3 text-xs font-black uppercase tracking-widest text-[#00f2ff]"
          >
            Release pass
          </button>
          <p className="text-[10px] text-white/35 text-center">Over 92% = bad window · sack risk</p>
        </div>
      ) : null}

      {phase === 'pass_lead' && !won && !lost ? (
        <div className="space-y-3">
          <p className="text-[11px] text-white/55 text-center">
            Lead the throw — drag the reticle toward the soft gold window.
          </p>
          <div
            className="relative mx-auto rounded-xl border border-emerald-400/30 bg-[#0c1810] overflow-hidden touch-none cursor-crosshair"
            style={{ width: FIELD_W, height: FIELD_H, maxWidth: '100%' }}
            onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = Math.max(12, Math.min(FIELD_W - 12, e.clientX - r.left));
              const y = Math.max(12, Math.min(FIELD_H - 12, e.clientY - r.top));
              setLeadPos({ x, y });
            }}
          >
            <div
              className="absolute w-16 h-16 rounded-full border border-amber-400/35 bg-amber-400/10"
              style={{ left: optimalLead.x - 32, top: optimalLead.y - 32 }}
            />
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-[#00f2ff] bg-[#00f2ff]/30 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_#00f2ff]"
              style={{ left: leadPos.x, top: leadPos.y }}
            />
            <p className="absolute bottom-2 right-2 text-[9px] text-white/30 uppercase tracking-widest">Lead</p>
          </div>
          <button
            type="button"
            onClick={confirmPassLead}
            className="w-full rounded-xl bg-[#00f2ff] text-black py-3 text-sm font-bold"
          >
            Throw ball
          </button>
        </div>
      ) : null}

      {phase === 'run_timing' && !won && !lost ? (
        <div className="space-y-3">
          <p className="text-[11px] text-white/50 text-center">
            Tap when the lane marker rides the green — timing lane bonus.
          </p>
          <div
            className="relative h-12 rounded-xl border border-white/15 bg-black/60 overflow-hidden"
            data-run-tick={runTick}
          >
            <div className="absolute inset-y-1 left-[42%] right-[40%] rounded-md bg-emerald-500/35 border border-emerald-400/50" />
            <div
              className="absolute top-1 bottom-1 w-1.5 rounded-full bg-white shadow-[0_0_12px_#fff]"
              style={{ left: `calc(${runMarkerRef.current}% - 3px)` }}
              key={runTick}
            />
          </div>
          <button
            type="button"
            onClick={hitRunHole}
            className="w-full rounded-xl border border-emerald-400/40 bg-emerald-500/15 py-3 text-sm font-bold text-emerald-200"
          >
            Hit hole
          </button>
        </div>
      ) : null}

      {phase === 'result' && !won && !lost ? (
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-white tabular-nums">+{lastGain} yards</p>
          <button
            type="button"
            onClick={continueDrive}
            className="rounded-xl bg-[#00f2ff] text-black px-8 py-3 text-sm font-bold"
          >
            Next play
          </button>
        </div>
      ) : null}

      {won ? <p className="text-center text-emerald-400 font-bold text-lg">Touchdown — lights on the scoreboard.</p> : null}
      {lost ? <p className="text-center text-red-400 font-bold">Turnover or turnover on downs.</p> : null}
      {(won || lost) && (
        <button type="button" onClick={reset} className="block mx-auto text-[#00f2ff] underline text-sm font-semibold">
          New game
        </button>
      )}

      <ul className="text-xs text-white/45 space-y-1 border-t border-white/10 pt-4 max-h-40 overflow-y-auto">
        {log.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      <p className="text-[10px] text-white/30 leading-relaxed">
        Pass: cycle power, release in a zone, lead the reticle. Run: green timing window. Unity 78+ adds burst. First down on 8+.
      </p>
    </div>
  );
}
