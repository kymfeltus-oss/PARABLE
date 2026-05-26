'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const ROUNDS = 8;
const W = 560;
const H = 360;
const HOOP = { x: 438, y: 128, rimR: 9 };
const PLAYER_ANCHOR_Y = 248;
const GRAVITY = 980;
const BPM = 96;
const BEAT_MS = 60000 / BPM;

type Phase = 'idle' | 'charging' | 'in_air' | 'outcome';

type Floater = { text: string; t: number; color: string };

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export default function KingdomHoopsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<Phase>('idle');
  const chargeRef = useRef(0);
  const chargeStartRef = useRef(0);
  const ballRef = useRef({ x: 116, y: PLAYER_ANCHOR_Y - 44, vx: 0, vy: 0 });
  const playerXRef = useRef(108);
  const defenderRef = useRef({ x: 280, targetX: 260 });
  const staminaRef = useRef(88);
  const streakRef = useRef(0);
  const possessionDoneRef = useRef(false);
  const rhythmBonusRef = useRef(false);
  const floatersRef = useRef<Floater[]>([]);
  const spaceDownRef = useRef(false);

  const [, setFrame] = useState(0);
  const bump = () => setFrame((n) => n + 1);

  const [score, setScore] = useState(0);
  const [staminaUi, setStaminaUi] = useState(88);
  const [shots, setShots] = useState(0);
  const [done, setDone] = useState(false);
  const [hudHint, setHudHint] = useState(
    'Hold click or Space to gather · release to shoot · A/D to slide for corner badge.'
  );

  const cornerBadge = useCallback(() => {
    const px = playerXRef.current;
    return px < 95 || px > 125;
  }, []);

  const addFloater = (text: string, color: string) => {
    floatersRef.current.push({ text, t: performance.now(), color });
  };

  const resetRound = useCallback(() => {
    phaseRef.current = 'idle';
    possessionDoneRef.current = false;
    chargeRef.current = 0;
    const px = playerXRef.current;
    ballRef.current = { x: px + 8, y: PLAYER_ANCHOR_Y - 44, vx: 0, vy: 0 };
    defenderRef.current = { x: 280 + Math.random() * 40, targetX: 240 + Math.random() * 50 };
    bump();
  }, []);

  const endShotRef = useRef<(pts: number, line: string, excellent: boolean) => void>(() => {});

  endShotRef.current = (pts: number, line: string, excellent: boolean) => {
    const hadRhythm = rhythmBonusRef.current;
    rhythmBonusRef.current = false;
    const gained = hadRhythm ? pts * 2 : pts;

    if (excellent) addFloater('EXCELLENT RELEASE', '#00f2ff');
    if (hadRhythm && pts > 0) addFloater('PERFECT VIBE ×2', '#fbbf24');

    setScore((sc) => {
      const nextScore = sc + gained;
      setShots((sh) => {
        const nextShots = sh + 1;
        if (nextShots >= ROUNDS) {
          setDone(true);
          setHudHint(`Final score ${nextScore} pts — run it back.`);
        } else {
          setHudHint(line);
        }
        return nextShots;
      });
      return nextScore;
    });

    streakRef.current = pts >= 2 ? streakRef.current + 1 : 0;
    staminaRef.current = Math.max(18, staminaRef.current - (pts > 0 ? 6 : 12));
    setStaminaUi(staminaRef.current);

    window.setTimeout(() => {
      resetRound();
    }, 850);
  };

  const tryScorePhysics = useCallback(() => {
    const b = ballRef.current;
    const hoop = HOOP;
    const d = dist(b, hoop);
    const descending = b.vy > 0;
    if (descending && d < 22 && b.y > hoop.y - 6 && b.y < hoop.y + 28) {
      return { made: true as const };
    }
    if (descending && d < 36 && d > 18) {
      return { made: false as const, kind: 'rim' as const };
    }
    if (b.y > H - 24 || b.x > W + 50 || b.x < -50) {
      return { made: false as const, kind: 'miss' as const };
    }
    return null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let frameN = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      frameN++;

      if (phaseRef.current === 'charging') {
        const t = (now - chargeStartRef.current) / 1000;
        const fatigue = 1 + (100 - staminaRef.current) / 100;
        chargeRef.current = Math.min(1, (t * 0.52) / fatigue);
        const def = defenderRef.current;
        def.x += (def.targetX - def.x) * dt * 2.4;
        def.targetX -= dt * 14;
        if (def.targetX < 172) def.targetX = 172;
      }

      if (phaseRef.current === 'in_air' && !possessionDoneRef.current) {
        const b = ballRef.current;
        b.vy += GRAVITY * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const res = tryScorePhysics();
        if (res) {
          possessionDoneRef.current = true;
          phaseRef.current = 'outcome';
          b.vx = 0;
          b.vy = 0;
          if (res.made) {
            addFloater('BUCKET', '#34d399');
            endShotRef.current(3, 'Nothing but net.', true);
          } else if (res.kind === 'rim') {
            endShotRef.current(1, 'Iron — stay square.', false);
          } else {
            endShotRef.current(0, 'Miss — read the closeout.', false);
          }
        }
      }

      staminaRef.current = Math.min(100, staminaRef.current + dt * 3.5);
      if (frameN % 12 === 0) setStaminaUi(Math.round(staminaRef.current));

      const px = playerXRef.current;
      const py = PLAYER_ANCHOR_Y;
      const b = ballRef.current;
      const def = defenderRef.current;
      const phase = phaseRef.current;
      const charge = chargeRef.current;

      ctx.fillStyle = '#070a12';
      ctx.fillRect(0, 0, W, H);

      const grd = ctx.createLinearGradient(0, H * 0.32, 0, H);
      grd.addColorStop(0, 'rgba(15,23,42,0.92)');
      grd.addColorStop(1, 'rgba(6,10,20,1)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, H * 0.32, W, H * 0.68);

      ctx.strokeStyle = 'rgba(0,242,255,0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const y = H * 0.36 + i * 16;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y + i * 2);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(255,255,255,0.035)';
      for (let i = 0; i < 24; i++) {
        const sway = Math.sin(now / 420 + i * 0.7) * 4;
        ctx.fillRect(32 + i * 21, 36 + sway, 8, 48);
      }

      ctx.strokeStyle = 'rgba(249,115,22,0.28)';
      ctx.lineWidth = 2;
      ctx.strokeRect(312, 76, 210, 8);

      ctx.fillStyle = 'rgba(30,41,59,0.92)';
      ctx.fillRect(398, 92, 10, 78);
      ctx.strokeStyle = 'rgba(0,242,255,0.22)';
      ctx.strokeRect(398, 92, 10, 78);

      ctx.beginPath();
      ctx.arc(HOOP.x, HOOP.y, HOOP.rimR, 0, Math.PI * 2);
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fill();

      const defY = py - 72;
      ctx.fillStyle = 'rgba(239,68,68,0.22)';
      ctx.beginPath();
      ctx.arc(def.x, defY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = streakRef.current >= 3 ? 'rgba(248,113,113,0.95)' : 'rgba(248,113,113,0.4)';
      ctx.lineWidth = streakRef.current >= 3 ? 3 : 1.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '10px system-ui';
      ctx.fillText('DEF', def.x - 10, defY + 4);

      const auraR = 24 + streakRef.current * 7 + (phase === 'charging' ? charge * 22 : 0);
      ctx.strokeStyle = 'rgba(0,242,255,0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, auraR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(15,23,42,0.96)';
      ctx.fillRect(px - 18, py - 54, 36, 54);
      ctx.strokeStyle = 'rgba(0,242,255,0.32)';
      ctx.strokeRect(px - 18, py - 54, 36, 54);

      if (phase === 'charging') {
        const idealLo = 0.42;
        const idealHi = 0.62;
        const contest = Math.min(1, (268 - def.x) / 110);
        const badgeWiden = cornerBadge() ? 0.07 : 0;
        const lo = Math.max(0.2, idealLo - badgeWiden - contest * 0.09);
        const hi = Math.min(0.92, idealHi + badgeWiden + contest * 0.02);
        const sweep = Math.min(1, charge / 0.85) * Math.PI * 1.12 - Math.PI * 0.52;
        ctx.strokeStyle = 'rgba(16,185,129,0.35)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(px, py - 8, 48, -Math.PI * 0.52, -Math.PI * 0.52 + Math.PI * 1.12);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(52,211,153,0.8)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(px, py - 8, 48, -Math.PI * 0.52 + lo * Math.PI * 1.12, -Math.PI * 0.52 + hi * Math.PI * 1.12);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(251,191,36,0.95)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py - 8, 48, -0.52 * Math.PI + sweep - 0.045, -0.52 * Math.PI + sweep + 0.045);
        ctx.stroke();
      }

      const hotRelease = phase === 'charging' && charge > 0.45 && charge < 0.68;
      const ballGrad = ctx.createRadialGradient(b.x - 3, b.y - 3, 2, b.x, b.y, 14);
      ballGrad.addColorStop(0, '#fff7ed');
      ballGrad.addColorStop(0.5, hotRelease ? '#fbbf24' : '#fb923c');
      ballGrad.addColorStop(1, '#7c2d12');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const beat = (now % BEAT_MS) / BEAT_MS;
      ctx.fillStyle = 'rgba(0,242,255,0.2)';
      ctx.fillRect(W - 8, H - 86 + beat * 68, 5, 10);

      floatersRef.current = floatersRef.current.filter((f) => now - f.t < 950);
      for (const f of floatersRef.current) {
        const age = (now - f.t) / 950;
        ctx.globalAlpha = 1 - age;
        ctx.fillStyle = f.color;
        ctx.font = 'bold 12px system-ui';
        ctx.fillText(f.text, W / 2 - ctx.measureText(f.text).width / 2, 52 + age * 18);
        ctx.globalAlpha = 1;
      }

      if (cornerBadge()) {
        ctx.fillStyle = 'rgba(251,191,36,0.85)';
        ctx.font = '9px system-ui';
        ctx.fillText('Corner Specialist · wider green', 10, H - 10);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cornerBadge, tryScorePhysics]);

  const beginCharge = useCallback(() => {
    if (done || shots >= ROUNDS) return;
    if (phaseRef.current !== 'idle') return;
    phaseRef.current = 'charging';
    chargeStartRef.current = performance.now();
    chargeRef.current = 0;
    setHudHint('Release in the green arc — defender closes in and shrinks the window.');
    bump();
  }, [done, shots]);

  const releaseShot = useCallback(() => {
    if (phaseRef.current !== 'charging') return;
    const charge = chargeRef.current;
    const def = defenderRef.current;
    const contest = Math.min(1, (268 - def.x) / 110);
    const idealLo = 0.42;
    const idealHi = 0.62;
    const badgeWiden = cornerBadge() ? 0.07 : 0;
    const lo = Math.max(0.2, idealLo - badgeWiden - contest * 0.09);
    const hi = Math.min(0.92, idealHi + badgeWiden + contest * 0.02);
    const staminaErr = ((100 - staminaRef.current) / 100) * 0.1;
    const jitter = (Math.random() - 0.5) * staminaErr;
    const inGreen = charge >= lo && charge <= hi;
    const now = performance.now();
    const mod = now % BEAT_MS;
    const beatNear = mod < 95 || BEAT_MS - mod < 95;
    rhythmBonusRef.current = beatNear && inGreen;

    const px = playerXRef.current;
    const py = PLAYER_ANCHOR_Y - 44;
    const tx = HOOP.x;
    const ty = HOOP.y;
    const dx = tx - px;
    const dy = ty - py;
    let angle = Math.atan2(dy, dx);
    if (!inGreen) {
      angle += (charge < lo ? -0.2 : 0.24) * (0.55 + contest * 0.45) + jitter;
    } else {
      angle += jitter * 0.3;
    }
    const powerMul = 0.8 + charge * 0.42;
    const speed = (inGreen ? 405 : 345 + charge * 95) * powerMul;
    ballRef.current.x = px;
    ballRef.current.y = py;
    ballRef.current.vx = Math.cos(angle) * speed;
    ballRef.current.vy = Math.sin(angle) * speed;
    phaseRef.current = 'in_air';
    bump();
  }, [cornerBadge, done, shots]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA') playerXRef.current = Math.max(72, playerXRef.current - 9);
      if (e.code === 'KeyD') playerXRef.current = Math.min(142, playerXRef.current + 9);
      if (e.code === 'Space') {
        e.preventDefault();
        if (!spaceDownRef.current) {
          spaceDownRef.current = true;
          beginCharge();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        spaceDownRef.current = false;
        releaseShot();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [beginCharge, releaseShot]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    beginCharge();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    releaseShot();
  };

  const reset = () => {
    setScore(0);
    setShots(0);
    setDone(false);
    streakRef.current = 0;
    staminaRef.current = 88;
    setStaminaUi(88);
    playerXRef.current = 108;
    phaseRef.current = 'idle';
    possessionDoneRef.current = false;
    chargeRef.current = 0;
    floatersRef.current = [];
    ballRef.current = { x: 116, y: PLAYER_ANCHOR_Y - 44, vx: 0, vy: 0 };
    setHudHint('Hold click or Space to gather · release to shoot · A/D to slide for corner badge.');
    bump();
  };

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-full">
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3">
        <div className="flex justify-between items-start">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Shot <span className="text-white tabular-nums">{done ? ROUNDS : shots + 1}</span>
            <span className="text-white/30"> / {ROUNDS}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Score</p>
            <p className="text-xl font-bold text-[#00f2ff] tabular-nums leading-none">{score}</p>
          </div>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="w-32">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/35 mb-1">Stamina</p>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${staminaUi}%` }}
              />
            </div>
          </div>
          <p className="text-[9px] text-white/30 text-right max-w-[210px] leading-snug">
            Rhythm at {BPM} BPM — release on the pulse in the green arc for double points.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-orange-400/25 overflow-hidden bg-black shadow-[0_0_40px_rgba(251,146,60,0.08)]">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto block touch-none cursor-pointer active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>

      <p className="mt-3 text-[11px] text-center text-white/45 min-h-[2.25rem] px-2">{hudHint}</p>

      <div className="mt-2 flex justify-center gap-3 text-[10px] text-white/35 uppercase tracking-widest flex-wrap">
        <span>Gather / release</span>
        <span className="text-white/20">·</span>
        <span>A/D corner</span>
        <span className="text-white/20">·</span>
        <span>Ball physics + contest</span>
      </div>

      {done ? (
        <button
          type="button"
          onClick={reset}
          className="mt-4 block mx-auto text-[#00f2ff] text-sm font-semibold hover:underline"
        >
          Play again
        </button>
      ) : null}
    </div>
  );
}
