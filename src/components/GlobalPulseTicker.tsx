"use client";

import { useMemo } from "react";
import { Zap } from "lucide-react";
import { useGlobalPulse } from "@/providers/GlobalPulseProvider";

const FALLBACK_MESSAGES = ["PRAISE", "SANCTUARY", "HOPE", "AMEN", "WORSHIP"] as const;

/**
 * Full-bleed ticker above the main header. Uses shared {@link useGlobalPulse} (10s RPC poll).
 */
export default function GlobalPulseTicker() {
  const { pulseScore, keywords } = useGlobalPulse();

  const loopMessages = useMemo(
    () => (keywords.length ? keywords : [...FALLBACK_MESSAGES]),
    [keywords],
  );

  const highEnergy = pulseScore > 1.0;
  const pulseClass = highEnergy
    ? "text-white drop-shadow-[0_0_10px_rgba(0,255,255,0.85)]"
    : "text-cyan-400";

  return (
    <div
      className="relative flex h-8 w-full shrink-0 items-center overflow-hidden whitespace-nowrap border-b border-neutral-800 bg-black"
      style={{ zIndex: 100 }}
    >
      <div className="flex h-full shrink-0 items-center gap-2 border-r border-neutral-800 bg-cyan-950/40 px-3">
        <Zap size={14} className="shrink-0 animate-pulse text-cyan-400" aria-hidden />
        <span className="text-[10px] font-black uppercase tracking-tight text-cyan-400">Global Pulse</span>
      </div>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="animate-marquee items-center gap-12 px-4">
          {[0, 1].map((pass) =>
            loopMessages.map((msg, i) => (
              <span
                key={`${pass}-${i}-${msg}`}
                className={`text-[11px] font-bold uppercase tracking-widest ${pulseClass}`}
              >
                &quot;{msg}&quot;
              </span>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
