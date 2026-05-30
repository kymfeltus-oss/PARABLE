"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  streamInteractionChannelName,
  WORSHIP_REACTION_EVENT,
} from "@/lib/stream-interactions";
import type { RealtimeChannel } from "@supabase/supabase-js";

type SendReactionPayload = {
  emoji: string;
  kind?: string;
};

/**
 * Shared Supabase Realtime broadcast channel for a stream room.
 * Used by chat rails, mobile watch composer, and player overlay listeners.
 */
export function useStreamInteractionChannel(streamId: string | null | undefined) {
  const supabase = useMemo(() => createClient(), []);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!streamId?.trim()) {
      channelRef.current = null;
      setSubscribed(false);
      return;
    }

    const ch = supabase.channel(streamInteractionChannelName(streamId.trim()));
    ch.subscribe((status) => {
      setSubscribed(status === "SUBSCRIBED");
    });
    channelRef.current = ch;

    return () => {
      setSubscribed(false);
      channelRef.current = null;
      void supabase.removeChannel(ch);
    };
  }, [streamId, supabase]);

  const sendReactionBurst = useCallback(
    (payload: SendReactionPayload) => {
      const ch = channelRef.current;
      if (!ch || !subscribed) return false;
      void ch.send({
        type: "broadcast",
        event: WORSHIP_REACTION_EVENT,
        payload: {
          emoji: payload.emoji,
          kind: payload.kind,
          timestamp: Date.now(),
        },
      });
      return true;
    },
    [subscribed],
  );

  return { sendReactionBurst, subscribed, channelName: streamId ? streamInteractionChannelName(streamId) : null };
}
