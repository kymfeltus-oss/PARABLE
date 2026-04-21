"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/utils/supabase/client";

const FALLBACK_KEYWORDS = ["PRAISE", "SANCTUARY", "HOPE", "AMEN", "WORSHIP"] as const;
const POLL_MS = 10_000;

type PulseRow = {
  pulse_score: number;
  recent_keywords: string[] | null;
};

export type GlobalPulseValue = {
  pulseScore: number;
  keywords: string[];
  loading: boolean;
  error: string | null;
};

const GlobalPulseContext = createContext<GlobalPulseValue | null>(null);

/**
 * Single 10s poll for `get_global_pulse` — shared by {@link GlobalPulseTicker}, Lobby Pulse, and Flight deck styling.
 */
export function GlobalPulseProvider({ children }: { children: React.ReactNode }) {
  const [pulseScore, setPulseScore] = useState(0.5);
  const [keywords, setKeywords] = useState<string[]>([...FALLBACK_KEYWORDS]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPulse = useCallback(async () => {
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("get_global_pulse");

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    setError(null);

    const raw = Array.isArray(data) ? data[0] : data;
    if (!raw || typeof raw !== "object") {
      setLoading(false);
      return;
    }

    const row = raw as PulseRow;
    const score = typeof row.pulse_score === "number" ? row.pulse_score : 0.5;
    const kw = row.recent_keywords;
    const msgs =
      Array.isArray(kw) && kw.length > 0
        ? kw.map((s) => String(s).trim()).filter(Boolean)
        : [...FALLBACK_KEYWORDS];

    setPulseScore(score);
    setKeywords(msgs);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchPulse();
    const id = window.setInterval(() => void fetchPulse(), POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchPulse]);

  const value = useMemo<GlobalPulseValue>(
    () => ({ pulseScore, keywords, loading, error }),
    [pulseScore, keywords, loading, error],
  );

  return <GlobalPulseContext.Provider value={value}>{children}</GlobalPulseContext.Provider>;
}

export function useGlobalPulse(): GlobalPulseValue {
  const ctx = useContext(GlobalPulseContext);
  if (!ctx) {
    throw new Error("useGlobalPulse must be used within GlobalPulseProvider");
  }
  return ctx;
}
