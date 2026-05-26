"use client";

import { useMemo, type CSSProperties } from "react";
import { Activity, Loader2 } from "lucide-react";
import { useGlobalPulse } from "@/providers/GlobalPulseProvider";

const GRID_COLS = 8;
const GRID_ROWS = 5;
const CELLS = GRID_COLS * GRID_ROWS;
const SCORE_CAP = 1.45;
const SCORE_MIN = 0.1;
const SCORE_MAX = 1.5;

/** Deep blue (calm) → cyan / near-white (high energy). `t` in [0, 1]. */
function rgbAtSentiment(t: number): [number, number, number] {
  const s = Math.min(1, Math.max(0, t));
  const r = Math.round(8 + s * 220);
  const g = Math.round(28 + s * 220);
  const b = Math.round(72 + s * 183);
  return [r, g, b];
}

function cellHeat(norm: number, index: number): number {
  const row = Math.floor(index / GRID_COLS);
  const col = index % GRID_COLS;
  const cx = (GRID_COLS - 1) / 2;
  const cy = (GRID_ROWS - 1) / 2;
  const dist = Math.hypot(col - cx, row - cy) / Math.hypot(cx, cy);
  const wave = 0.5 + 0.5 * Math.sin(index * 1.7 + norm * 12);
  return Math.min(1, Math.max(0, norm * (1 - dist * 0.45) + wave * 0.12));
}

function energyLabel(score: number): string {
  if (score > 1.0) return "High energy";
  if (score >= 0.75) return "Elevated";
  if (score >= 0.45) return "Warming";
  return "Calm";
}

/** Map network pulse to 0..1 for glow + heatmap (score expected ~0.1–1.5). */
function scoreToGlowIntensity(score: number): number {
  const s = Math.min(SCORE_MAX, Math.max(SCORE_MIN, score));
  return (s - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
}

type Props = {
  className?: string;
};

/**
 * Lobby pulse bento — same `get_global_pulse` as the ticker. Outer ring uses `animate-pulse`
 * + shadow strength from `pulseData.score` (0.1–1.5).
 */
export function LobbyPulseHeatmap({ className = "" }: Props) {
  const { pulseScore, keywords, loading, error } = useGlobalPulse();

  const glowIntensity = useMemo(() => scoreToGlowIntensity(pulseScore), [pulseScore]);

  const glowRingStyle = useMemo(() => {
    const blurPx = 10 + glowIntensity * 52;
    const alpha = 0.1 + glowIntensity * 0.55;
    return {
      boxShadow: `0 0 ${blurPx}px rgba(0, 242, 255, ${alpha}), 0 0 ${blurPx * 0.45}px rgba(236, 254, 255, ${alpha * 0.6})`,
    } as CSSProperties;
  }, [glowIntensity]);

  const normSentiment = useMemo(
    () => Math.min(1, Math.max(0, pulseScore / SCORE_CAP)),
    [pulseScore],
  );

  const [r, g, b] = useMemo(() => rgbAtSentiment(normSentiment), [normSentiment]);
  const label = useMemo(() => energyLabel(pulseScore), [pulseScore]);

  return (
    <div className={["relative rounded-xl", className].filter(Boolean).join(" ")}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-pulse rounded-xl"
        style={glowRingStyle}
      />
      <div
        className={[
          "parable-live-surface relative rounded-xl border p-4 shadow-[0_0_40px_rgba(0,242,255,0.06)]",
          pulseScore > 1.0 ? "shadow-[0_0_48px_rgba(0,242,255,0.18)] ring-1 ring-[#00f2ff]/25" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 shrink-0 text-[#00f2ff]" aria-hidden />
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#00f2ff]/90">Lobby pulse</p>
            </div>
            <h3 className="mt-1 text-sm font-semibold text-white">Global network heatmap</h3>
            <p className="mt-1 max-w-md text-[11px] leading-relaxed text-white/45">
              Same pulse as the ticker — glow intensity follows score (0.1–1.5×). Updates every 10 seconds.
            </p>
          </div>
          <div className="text-right">
            {loading ? (
              <Loader2 className="ml-auto h-5 w-5 animate-spin text-[#00f2ff]/50" aria-label="Loading pulse" />
            ) : (
              <>
                <p className="text-lg font-bold tabular-nums text-white">{pulseScore.toFixed(2)}×</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#00f2ff]/80">{label}</p>
              </>
            )}
          </div>
        </div>

        <div
          className="relative mt-4 overflow-hidden rounded-lg border border-white/[0.08]"
          style={{
            boxShadow: `inset 0 0 48px rgba(${r},${g},${b},0.35)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `linear-gradient(145deg, rgb(8, 20, 40) 0%, rgb(${r},${g},${b}) 55%, rgba(240,253,255,0.95) 100%)`,
              opacity: 0.35 + normSentiment * 0.55,
            }}
          />
          <div
            className="relative grid aspect-[8/3.2] w-full gap-[3px] p-2"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: CELLS }, (_, i) => {
              const heat = cellHeat(normSentiment, i);
              const [cr, cg, cb] = rgbAtSentiment(heat * normSentiment);
              return (
                <div
                  key={i}
                  className="min-h-[6px] rounded-[2px] transition-all duration-700 ease-out"
                  style={{
                    backgroundColor: `rgb(${cr},${cg},${cb})`,
                    opacity: 0.35 + heat * 0.65,
                    boxShadow:
                      heat * normSentiment > 0.65 ? `0 0 12px rgba(240,253,255,0.35)` : undefined,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1 text-[10px] text-white/40">
          <p className="flex flex-wrap gap-x-2 gap-y-0.5">
            <span className="text-white/45">Pulse keywords:</span>
            <span className="font-semibold tracking-wide text-[#00f2ff]/90">
              {keywords.slice(0, 6).join(" · ") || "—"}
            </span>
          </p>
          {error ? <span className="text-amber-400/90">RPC: {error}</span> : null}
        </div>
      </div>
    </div>
  );
}
