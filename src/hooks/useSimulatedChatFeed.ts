"use client";

import { useEffect, useState } from "react";
import {
  pickRandomSimChatLine,
  SIM_CHAT_MAX_DELAY_MS,
  SIM_CHAT_MAX_MESSAGES,
  SIM_CHAT_MIN_DELAY_MS,
} from "@/lib/streamers-sim-chat-messages";
import type { StreamChatMessage } from "@/hooks/useStreamChat";

function randomDelayMs(): number {
  return SIM_CHAT_MIN_DELAY_MS + Math.floor(Math.random() * (SIM_CHAT_MAX_DELAY_MS - SIM_CHAT_MIN_DELAY_MS));
}

type Options = {
  enabled: boolean;
  streamKey: string | null | undefined;
};

/** Dev-gated synthetic chat lines merged in `StreamersHubLiveChat` (not persisted to Supabase). */
export function useSimulatedChatFeed({ enabled, streamKey }: Options): StreamChatMessage[] {
  const [messages, setMessages] = useState<StreamChatMessage[]>([]);

  useEffect(() => {
    if (!enabled || !streamKey) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if (cancelled) return;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        const line = pickRandomSimChatLine();
        const entry: StreamChatMessage = {
          id: `sim-${streamKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user: line.user,
          text: line.text,
          avatarUrl: line.avatarUrl,
          simulated: true,
        };
        setMessages((prev) => [...prev, entry].slice(-SIM_CHAT_MAX_MESSAGES));
        schedule();
      }, randomDelayMs());
    };

    schedule();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      setMessages([]);
    };
  }, [enabled, streamKey]);

  return messages;
}
