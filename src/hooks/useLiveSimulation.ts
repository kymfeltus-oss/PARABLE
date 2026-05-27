"use client";

import { useEffect, useRef, useState } from "react";
import {
  SIM_VIEWER_JITTER_MIN_VIEWERS,
  SIM_VIEWER_JITTER_MS,
} from "@/lib/streamers-demo-simulation";
import type { StreamerProfileRecord } from "@/lib/streamers-types";

function jitterDelta(): number {
  return Math.floor(Math.random() * 5) - 2;
}

/**
 * Client-only viewer count theatre for live discovery rows.
 * Baselines are captured from the fetched API payload — never written back to `/api/streamers`.
 */
export function useLiveSimulation(
  streamers: StreamerProfileRecord[],
): StreamerProfileRecord[] {
  const baselinesRef = useRef<Map<string, number>>(new Map());
  const [simulated, setSimulated] = useState<StreamerProfileRecord[]>(streamers);

  useEffect(() => {
    const nextBaselines = new Map<string, number>();
    for (const row of streamers) {
      nextBaselines.set(row.id, row.currentViewers);
    }
    baselinesRef.current = nextBaselines;
    setSimulated(streamers);
  }, [streamers]);

  useEffect(() => {
    if (streamers.length === 0) return;

    const tick = () => {
      setSimulated(
        streamers.map((row) => {
          if (row.status !== "live") return row;
          const base = baselinesRef.current.get(row.id) ?? row.currentViewers;
          const next = Math.max(SIM_VIEWER_JITTER_MIN_VIEWERS, base + jitterDelta());
          return { ...row, currentViewers: next };
        }),
      );
    };

    const id = window.setInterval(tick, SIM_VIEWER_JITTER_MS);
    return () => window.clearInterval(id);
  }, [streamers]);

  return simulated;
}
