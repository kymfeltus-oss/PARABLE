'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GamePrimaryButton, GameSecondaryButton, HudPanel } from './GameShell';

type Mission = { x: number; y: number; r: number; done: boolean; label: string; street: string };
type Building = { x: number; y: number; w: number; h: number };

const W = 920;
const H = 520;

/** Main boulevards — buildings sit on “blocks” between roads (GTA-style grid). */
const ROADS = {
  h: [
    { y: 88, h: 52 },
    { y: 234, h: 56 },
    { y: 382, h: 52 },
  ],
  v: [
    { x: 120, w: 48 },
    { x: 380, w: 52 },
    { x: 620, w: 52 },
    { x: 820, w: 48 },
  ],
};

export default function NarrowRoadGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const car = useRef({ x: 500, y: 260, angle: -Math.PI / 2, speed: 0 });
  const hintPrev = useRef('');
  const [influence, setInfluence] = useState(0);
  const [missions, setMissions] = useState<Mission[]>([
    {
      x: 200,
      y: 118,
      r: 34,
      done: false,
      label: 'Eastside — broken homes',
      street: 'Mercy Ave',
    },
    {
      x: 752,
      y: 262,
      r: 34,
      done: false,
      label: 'Midtown — night shelter run',
      street: 'Hope Blvd',
    },
    {
      x: 500,
      y: 408,
      r: 34,
      done: false,
      label: 'Waterfront — meal line',
      street: 'Grace Pier',
    },
  ]);
  const buildings = useRef<Building[]>([
    { x: 32, y: 28, w: 72, h: 52 },
    { x: 188, y: 28, w: 160, h: 52 },
    { x: 360, y: 28, w: 240, h: 52 },
    { x: 612, y: 28, w: 200, h: 52 },
    { x: 32, y: 152, w: 72, h: 68 },
    { x: 452, y: 152, w: 148, h: 68 },
    { x: 32, y: 298, w: 72, h: 68 },
    { x: 700, y: 152, w: 188, h: 68 },
    { x: 260, y: 298, w: 320, h: 68 },
    { x: 32, y: 438, w: 120, h: 72 },
    { x: 168, y: 438, w: 280, h: 72 },
    { x: 668, y: 298, w: 220, h: 212 },
  ]);
  const [subtitle, setSubtitle] = useState({ primary: '', secondary: '' });
  const [speedUi, setSpeedUi] = useState(0);
  const [won, setWon] = useState(false);
  const missionsRef = useRef(missions);
  missionsRef.current = missions;

  const tryCompleteMission = useCallback(() => {
    const c = car.current;
    setMissions((prev) => {
      let changed = false;
      const next = prev.map((m) => {
        if (m.done) return m;
        const dx = m.x - c.x;
        const dy = m.y - c.y;
        if (dx * dx + dy * dy < (m.r + 22) ** 2) {
          changed = true;
          setInfluence((i) => i + 34);
          return { ...m, done: true };
        }
        return m;
      });
      if (changed && next.every((m) => m.done)) setWon(true);
      return next;
    });
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyE') tryCompleteMission();
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [tryCompleteMission]);

  const setKey = useCallback((code: string, on: boolean) => {
    keys.current[code] = on;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const loop = () => {
      const k = keys.current;
      const c = car.current;
      if (!won) {
        const turn = 0.062 * (1 + Math.min(Math.abs(c.speed) * 0.14, 0.85));
        if (k.ArrowLeft || k.KeyA) c.angle -= turn;
        if (k.ArrowRight || k.KeyD) c.angle += turn;
        if (k.ArrowUp || k.KeyW) c.speed = Math.min(c.speed + 0.22, 5.4);
        else if (k.ArrowDown || k.KeyS) c.speed = Math.max(c.speed - 0.16, -3.1);
        else c.speed *= 0.94;

        const nx = c.x + Math.cos(c.angle) * c.speed;
        const ny = c.y + Math.sin(c.angle) * c.speed;
        let cx = Math.max(22, Math.min(W - 22, nx));
        let cy = Math.max(22, Math.min(H - 22, ny));

        for (const b of buildings.current) {
          if (cx > b.x - 16 && cx < b.x + b.w + 16 && cy > b.y - 16 && cy < b.y + b.h + 16) {
            cx = c.x;
            cy = c.y;
            c.speed *= -0.35;
            break;
          }
        }
        c.x = cx;
        c.y = cy;
      }

      const t = Date.now();
      let nearLabel = '';
      let nearStreet = '';
      for (const m of missionsRef.current) {
        if (m.done) continue;
        const dx = m.x - c.x;
        const dy = m.y - c.y;
        if (dx * dx + dy * dy < (m.r + 30) ** 2) {
          nearLabel = m.label;
          nearStreet = m.street;
          break;
        }
      }

      const nextActive = missionsRef.current.find((m) => !m.done);
      const primary = won
        ? 'MISSION PASSED — City covered in prayer & presence.'
        : nearLabel
          ? `Press E to minister — ${nearStreet}`
          : nextActive
            ? `Go to the outreach marker — ${nextActive.label}`
            : '';
      const secondary = won
        ? ''
        : nearLabel
          ? nearLabel
          : 'WASD / arrows · E interact · Follow the cyan pillar & map blip.';

      const hintKey = `${primary}|${secondary}`;
      if (hintKey !== hintPrev.current) {
        hintPrev.current = hintKey;
        setSubtitle({ primary, secondary });
      }

      // —— World: asphalt + roads ——
      ctx.fillStyle = '#252628';
      ctx.fillRect(0, 0, W, H);

      const asphalt = ctx.createLinearGradient(0, 0, W, H);
      asphalt.addColorStop(0, '#2a2c2f');
      asphalt.addColorStop(1, '#1e1f22');
      ctx.fillStyle = asphalt;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#323438';
      for (const r of ROADS.h) {
        ctx.fillRect(0, r.y, W, r.h);
      }
      for (const r of ROADS.v) {
        ctx.fillRect(r.x, 0, r.w, H);
      }

      // Lane markings (yellow dashed center on main strips)
      ctx.strokeStyle = 'rgba(234,179,8,0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([14, 14]);
      for (const r of ROADS.h) {
        const cy = r.y + r.h / 2;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(W, cy);
        ctx.stroke();
      }
      for (const r of ROADS.v) {
        const cx = r.x + r.w / 2;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 1;
      for (const r of ROADS.h) {
        ctx.strokeRect(0, r.y + 0.5, W, r.h - 1);
      }
      for (const r of ROADS.v) {
        ctx.strokeRect(r.x + 0.5, 0, r.w - 1, H);
      }

      // Crosswalk ticks at a few intersections
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      const cw = (cx: number, cy: number, horiz: boolean) => {
        for (let i = 0; i < 5; i++) {
          if (horiz) ctx.fillRect(cx + i * 10, cy, 6, 2);
          else ctx.fillRect(cx, cy + i * 10, 2, 6);
        }
      };
      cw(380, 234, true);
      cw(620, 234, true);
      cw(500, 88, false);

      // Sidewalks around blocks
      ctx.strokeStyle = 'rgba(180,180,175,0.35)';
      ctx.lineWidth = 4;
      for (const b of buildings.current) {
        ctx.strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
      }

      // Buildings (GTA-ish flat rooftops + lit windows)
      for (const b of buildings.current) {
        const roof = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
        roof.addColorStop(0, '#3d4451');
        roof.addColorStop(0.5, '#2a3038');
        roof.addColorStop(1, '#1a1d22');
        ctx.fillStyle = roof;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        for (let wx = b.x + 5; wx < b.x + b.w - 6; wx += 11) {
          for (let wy = b.y + 6; wy < b.y + b.h - 8; wy += 13) {
            const lit = (Math.floor(t / 450) + wx + wy) % 9 < 4;
            ctx.fillStyle = lit ? 'rgba(254,243,199,0.7)' : 'rgba(30,35,42,0.95)';
            ctx.fillRect(wx, wy, 6, 8);
          }
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(b.x, b.y, b.w, 4);
      }

      // Mission pillars + ground ring (waypoint)
      for (const m of missionsRef.current) {
        if (m.done) continue;
        const pulse = 0.55 + Math.sin(t / 180) * 0.2;
        const colH = 52 + pulse * 28;
        const grd = ctx.createLinearGradient(m.x, m.y - colH, m.x, m.y);
        grd.addColorStop(0, 'rgba(0,242,255,0)');
        grd.addColorStop(0.35, 'rgba(0,242,255,0.55)');
        grd.addColorStop(0.7, 'rgba(34,211,238,0.35)');
        grd.addColorStop(1, 'rgba(0,242,255,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(m.x - 3, m.y - colH, 6, colH);

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * pulse + 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,242,255,0.25)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,242,255,${0.1 + pulse * 0.12})`;
        ctx.fill();
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ecfeff';
        ctx.font = 'bold 9px system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OUTREACH', m.x, m.y + 3);
      }

      // Player car — top-down sedan (GTA-style read)
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);
      const head = ctx.createLinearGradient(18, 0, 150, 0);
      head.addColorStop(0, 'rgba(255,253,240,0.5)');
      head.addColorStop(0.35, 'rgba(255,253,240,0.15)');
      head.addColorStop(1, 'rgba(255,253,240,0)');
      ctx.fillStyle = head;
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(140, -52);
      ctx.lineTo(140, 52);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e3a5f';
      const rw = 22;
      const rh = 11;
      const rr = 5;
      ctx.beginPath();
      ctx.moveTo(-rw + rr, -rh);
      ctx.lineTo(rw - rr, -rh);
      ctx.quadraticCurveTo(rw, -rh, rw, -rh + rr);
      ctx.lineTo(rw, rh - rr);
      ctx.quadraticCurveTo(rw, rh, rw - rr, rh);
      ctx.lineTo(-rw + rr, rh);
      ctx.quadraticCurveTo(-rw, rh, -rw, rh - rr);
      ctx.lineTo(-rw, -rh + rr);
      ctx.quadraticCurveTo(-rw, -rh, -rw + rr, -rh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-6, -9, 20, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-18, -7, 10, 14);
      ctx.fillRect(6, -7, 10, 14);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(-24, -4, 3, 8);
      ctx.restore();

      // Scanline / dusk grade
      ctx.fillStyle = 'rgba(15,23,42,0.12)';
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

      const vig = ctx.createRadialGradient(W * 0.5, H * 0.48, H * 0.2, W * 0.5, H * 0.5, H * 0.92);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // —— Minimap (screen-fixed, GTA corner) ——
      const mmX = 14;
      const mmY = H - 138;
      const mmW = 126;
      const mmH = 110;
      ctx.save();
      ctx.fillStyle = 'rgba(8,10,14,0.82)';
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.fillRect(mmX, mmY, mmW, mmH);
      ctx.strokeRect(mmX + 0.5, mmY + 0.5, mmW - 1, mmH - 1);

      const sx = mmW / W;
      const sy = mmH / H;
      ctx.fillStyle = '#2b2d31';
      for (const r of ROADS.h) {
        ctx.fillRect(mmX, mmY + r.y * sy, mmW, r.h * sy);
      }
      for (const r of ROADS.v) {
        ctx.fillRect(mmX + r.x * sx, mmY, r.w * sx, mmH);
      }
      ctx.fillStyle = '#3f4147';
      for (const b of buildings.current) {
        ctx.fillRect(mmX + b.x * sx, mmY + b.y * sy, b.w * sx, b.h * sy);
      }
      for (const m of missionsRef.current) {
        if (m.done) continue;
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(mmX + m.x * sx, mmY + m.y * sy, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      const px = mmX + c.x * sx;
      const py = mmY + c.y * sy;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(c.angle);
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-5, 4);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-5, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#f2f3f5';
      ctx.font = 'bold 10px system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N', mmX + mmW / 2, mmY + 11);
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(180,180,180,0.9)';
      ctx.font = '8px system-ui,sans-serif';
      ctx.fillText('NARROW CITY', mmX + 6, mmY + mmH - 6);
      ctx.restore();

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [won]);

  const opsDone = missions.filter((m) => m.done).length;

  return (
    <GameShell label="Narrow Road — Open City">
      <>
        <div className="relative font-sans">
          <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block touch-none" />

          {/* Top bar: “radio” + ops + cash-style influence */}
          <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex flex-wrap items-start justify-between gap-2 px-2">
            <div className="flex flex-col gap-1.5">
              <HudPanel className="max-w-[220px] py-1.5">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#949ba4]">Kingdom FM</p>
                <p className="text-[11px] font-bold text-[#f5e6a3]">107.9 — Grace & Worship</p>
              </HudPanel>
              <HudPanel className="py-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#949ba4]">Outreach</p>
                <p className="text-lg font-black tabular-nums leading-tight text-[#00f2ff]">
                  {opsDone}
                  <span className="text-sm font-bold text-white/35"> / 3</span>
                </p>
              </HudPanel>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <HudPanel className="min-w-[120px] py-1.5 text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#949ba4]">Blessings</p>
                <p className="text-xl font-black tabular-nums leading-tight text-[#4ade80]">${influence}</p>
              </HudPanel>
              <HudPanel className="py-1 px-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#949ba4]">Speed</p>
                <p className="text-right text-sm font-black tabular-nums text-[#f2f3f5]">{speedUi} MPH</p>
              </HudPanel>
            </div>
          </div>

          {/* GTA-style subtitle strip (center-bottom) */}
          {!won && (subtitle.primary || subtitle.secondary) ? (
            <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 w-[min(92%,520px)] -translate-x-1/2">
              <div className="border-l-4 border-[#c9a227] bg-black/78 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                {subtitle.primary ? (
                  <p
                    className="text-[15px] font-black leading-snug tracking-wide text-[#fff7c2]"
                    style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #3f2a0a' }}
                  >
                    {subtitle.primary}
                  </p>
                ) : null}
                {subtitle.secondary ? (
                  <p className="mt-0.5 text-[11px] font-semibold leading-snug text-white/75">{subtitle.secondary}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {won ? (
            <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 w-[min(92%,480px)] -translate-x-1/2">
              <div className="border-l-4 border-[#23a559] bg-black/78 px-4 py-2.5">
                <p
                  className="text-center text-[15px] font-black text-[#86efac]"
                  style={{ textShadow: '1px 1px 0 #000' }}
                >
                  {subtitle.primary}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {won ? (
          <p className="mt-3 px-1 text-center text-sm font-bold text-[#23a559]">
            All outreach routes cleared — the city is covered.
          </p>
        ) : (
          <>
            <p className="mt-2 px-1 text-center text-[10px] leading-snug text-[#949ba4]">
              Open-city driving: follow the <span className="font-bold text-[#f5e6a3]">mission text</span>, cyan pillar, and{' '}
              <span className="font-bold text-[#f2f3f5]">minimap</span>. <span className="text-[#f2f3f5]">E</span> to minister
              on-site.
            </p>
            <div className="mt-3 flex flex-col items-center gap-2 sm:hidden select-none">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#949ba4]">Touch</p>
              <div className="grid w-[200px] grid-cols-3 gap-2">
                <span />
                <GameSecondaryButton
                  className="py-3 text-[#00f2ff]"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setKey('ArrowUp', true);
                  }}
                  onPointerUp={() => setKey('ArrowUp', false)}
                  onPointerLeave={() => setKey('ArrowUp', false)}
                  onPointerCancel={() => setKey('ArrowUp', false)}
                >
                  ↑
                </GameSecondaryButton>
                <span />
                <GameSecondaryButton
                  className="py-3 text-[#00f2ff]"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setKey('ArrowLeft', true);
                  }}
                  onPointerUp={() => setKey('ArrowLeft', false)}
                  onPointerLeave={() => setKey('ArrowLeft', false)}
                  onPointerCancel={() => setKey('ArrowLeft', false)}
                >
                  ←
                </GameSecondaryButton>
                <GamePrimaryButton className="py-3 text-xs" onClick={() => tryCompleteMission()}>
                  E
                </GamePrimaryButton>
                <GameSecondaryButton
                  className="py-3 text-[#00f2ff]"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setKey('ArrowRight', true);
                  }}
                  onPointerUp={() => setKey('ArrowRight', false)}
                  onPointerLeave={() => setKey('ArrowRight', false)}
                  onPointerCancel={() => setKey('ArrowRight', false)}
                >
                  →
                </GameSecondaryButton>
                <span />
                <GameSecondaryButton
                  className="py-3 text-[#00f2ff]"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setKey('ArrowDown', true);
                  }}
                  onPointerUp={() => setKey('ArrowDown', false)}
                  onPointerLeave={() => setKey('ArrowDown', false)}
                  onPointerCancel={() => setKey('ArrowDown', false)}
                >
                  ↓
                </GameSecondaryButton>
                <span />
              </div>
            </div>
          </>
        )}
      </>
    </GameShell>
  );
}
