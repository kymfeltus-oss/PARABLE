'use client';

import { useCallback, useEffect, useState } from 'react';
import GameShell, { GamePrimaryButton, GameSecondaryButton, HudPanel } from './GameShell';

export default function ArmorUpGame() {
  const [now, setNow] = useState(0);
  const [truth, setTruth] = useState(0);
  const [spirit, setSpirit] = useState(0);
  const [grace, setGrace] = useState(0);
  const [citadel, setCitadel] = useState(0);
  const [storm, setStorm] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [coolUntil, setCoolUntil] = useState({ t: 0, s: 0, g: 0 });

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 150);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (won || lost) return;
    const id = window.setInterval(() => {
      setStorm((s) => {
        if (s >= 99.5) {
          setLost(true);
          return 100;
        }
        return s + 0.22;
      });
    }, 120);
    return () => clearInterval(id);
  }, [won, lost]);

  const harvest = useCallback(
    (kind: 't' | 's' | 'g') => {
      if (won || lost) return;
      const t = Date.now();
      if (kind === 't' && t < coolUntil.t) return;
      if (kind === 's' && t < coolUntil.s) return;
      if (kind === 'g' && t < coolUntil.g) return;
      const next = t + 850;
      setCoolUntil((c) => ({ ...c, [kind]: next }));
      if (kind === 't') setTruth((v) => v + 1);
      if (kind === 's') setSpirit((v) => v + 1);
      if (kind === 'g') setGrace((v) => v + 1);
    },
    [won, lost, coolUntil.t, coolUntil.s, coolUntil.g]
  );

  const build = useCallback(() => {
    if (won || lost) return;
    if (truth < 1 || spirit < 1 || grace < 1) return;
    setTruth((v) => v - 1);
    setSpirit((v) => v - 1);
    setGrace((v) => v - 1);
    setCitadel((c) => {
      const n = c + 22;
      if (n >= 100) setWon(true);
      return Math.min(100, n);
    });
    setStorm((s) => Math.max(0, s - 5));
  }, [won, lost, truth, spirit, grace]);

  const giftShield = useCallback(() => {
    if (won || lost) return;
    if (truth < 2 || spirit < 2) return;
    setTruth((v) => v - 2);
    setSpirit((v) => v - 2);
    setStorm((s) => Math.max(0, s - 20));
  }, [won, lost, truth, spirit]);

  const reset = () => {
    setTruth(0);
    setSpirit(0);
    setGrace(0);
    setCitadel(0);
    setStorm(0);
    setWon(false);
    setLost(false);
    setCoolUntil({ t: 0, s: 0, g: 0 });
  };

  const t = Date.now();

  return (
    <GameShell label="Armor Up">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-[#1a1028] via-[#10121a] to-[#0b0c0f] px-3 py-4 sm:px-5 sm:py-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_15%_-10%,rgba(139,92,246,0.22),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_95%_110%,rgba(0,242,255,0.1),transparent_45%)]" />
        <div className="relative space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <HudPanel className="border-violet-500/25 bg-[#1e1f22]/90">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#c4b5fd]">Shadow storm</p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-[#3f4147] bg-black/60">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-red-500 transition-all duration-100"
                  style={{ width: `${Math.min(100, storm)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs font-bold tabular-nums text-[#b5bac1]">
                {Math.round(storm)} <span className="text-[#949ba4] font-semibold">/ 100</span>
              </p>
            </HudPanel>
            <HudPanel className="border-cyan-500/30 bg-[#1e1f22]/90">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#67e8f9]">Citadel of light</p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-[#3f4147] bg-black/60">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-[#00f2ff] transition-all duration-200"
                  style={{ width: `${citadel}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs font-bold tabular-nums text-[#b5bac1]">
                {citadel} <span className="text-[#949ba4] font-semibold">/ 100</span>
              </p>
            </HudPanel>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <GameSecondaryButton
              onClick={() => harvest('t')}
              disabled={won || lost || t < coolUntil.t}
              className="px-4 py-2.5 text-sm"
            >
              Harvest Truth
            </GameSecondaryButton>
            <GameSecondaryButton
              onClick={() => harvest('s')}
              disabled={won || lost || t < coolUntil.s}
              className="px-4 py-2.5 text-sm"
            >
              Harvest Spirit
            </GameSecondaryButton>
            <GameSecondaryButton
              onClick={() => harvest('g')}
              disabled={won || lost || t < coolUntil.g}
              className="px-4 py-2.5 text-sm"
            >
              Harvest Grace
            </GameSecondaryButton>
          </div>

          <HudPanel className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#949ba4]">Stockpile</p>
            <p className="mt-1 text-sm font-bold text-[#f2f3f5]">
              <span className="tabular-nums text-[#67e8f9]">{truth}</span>
              <span className="mx-1 text-[#949ba4]">Truth</span>
              <span className="text-[#949ba4]">·</span>
              <span className="mx-1 tabular-nums text-fuchsia-300">{spirit}</span>
              <span className="text-[#949ba4]">Spirit</span>
              <span className="text-[#949ba4]">·</span>
              <span className="mx-1 tabular-nums text-amber-200">{grace}</span>
              <span className="text-[#949ba4]">Grace</span>
            </p>
          </HudPanel>

          <div className="flex flex-wrap justify-center gap-3">
            <GamePrimaryButton onClick={build} disabled={won || lost || truth < 1 || spirit < 1 || grace < 1}>
              Build segment
            </GamePrimaryButton>
            <GameSecondaryButton
              onClick={giftShield}
              disabled={won || lost || truth < 2 || spirit < 2}
              className="border-fuchsia-500/40 text-fuchsia-200 hover:border-fuchsia-400/60 hover:text-fuchsia-100"
            >
              Gift shield
            </GameSecondaryButton>
          </div>

          {won ? (
            <p className="text-center text-sm font-bold text-[#23a559]">Citadel holds — light wins.</p>
          ) : null}
          {lost ? <p className="text-center text-sm font-bold text-[#ed4245]">Storm wins — try again.</p> : null}
          {(won || lost) && (
            <GameSecondaryButton onClick={reset} className="mx-auto block">
              Play again
            </GameSecondaryButton>
          )}
        </div>
      </div>
    </GameShell>
  );
}
