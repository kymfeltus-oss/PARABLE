"use client";

import { useEffect, useRef, useState } from "react";
import type { KickCategoryItem } from "@/lib/kick-home-data";

function parseWatchingLabel(label: string): number {
  const t = label.trim().toUpperCase();
  if (t.endsWith("M")) return Math.round(parseFloat(t) * 1_000_000) || 0;
  if (t.endsWith("K")) return Math.round(parseFloat(t) * 1_000) || 0;
  return parseInt(t.replace(/,/g, ""), 10) || 0;
}

function formatWatchingCount(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return n.toLocaleString();
}

/**
 * Client-only category "watching" theatre — baselines from `KickCategoryItem.watching`.
 */
export function useCategoryActivitySimulation(
  categories: KickCategoryItem[],
): KickCategoryItem[] {
  const baselinesRef = useRef<Map<string, number>>(new Map());
  const [simulated, setSimulated] = useState(categories);

  useEffect(() => {
    const nextBaselines = new Map<string, number>();
    for (const cat of categories) {
      nextBaselines.set(cat.id, parseWatchingLabel(cat.watching));
    }
    baselinesRef.current = nextBaselines;
    setSimulated(categories);
  }, [categories]);

  useEffect(() => {
    if (categories.length === 0) return;

    const tick = () => {
      setSimulated(
        categories.map((cat) => {
          const base = baselinesRef.current.get(cat.id) ?? parseWatchingLabel(cat.watching);
          const spread = Math.max(800, Math.round(base * 0.008));
          const delta = Math.floor(Math.random() * (spread * 2 + 1)) - spread;
          const next = Math.max(Math.round(base * 0.92), base + delta);
          return { ...cat, watching: formatWatchingCount(next) };
        }),
      );
    };

    const id = window.setInterval(tick, 4200);
    return () => window.clearInterval(id);
  }, [categories]);

  return simulated;
}
