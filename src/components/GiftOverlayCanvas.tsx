"use client";

import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  AMEN_WORSHIP_EMOJIS,
  emojiForGiftSku,
  emojiForReactionKind,
  type WorshipReactionKind,
} from "@/lib/worship-reactions";
import {
  AMEN_REACTION_EVENT,
  LOCAL_WORSHIP_REACTION_EVENT,
  WORSHIP_REACTION_EVENT,
  streamInteractionChannelName,
  type LocalWorshipReactionDetail,
} from "@/lib/stream-interactions";
import type { EmojiBurstHandle } from "@/components/streaming/EmojiBurstOverlay";
import {
  EmojiScreenBurstOverlay,
  type EmojiScreenBurstHandle,
} from "@/components/stream/EmojiScreenBurstOverlay";

type LiveKitBurst = { id: string; emoji: string };

type GiftOverlayCanvasProps = {
  streamId: string;
  enabled: boolean;
  clipToPlayer?: boolean;
  liveKitBursts?: LiveKitBurst[];
  /** When set, remote bursts use the shared streaming overlay (no duplicate layer). */
  burstOverlayRef?: RefObject<EmojiBurstHandle | null>;
};

export default function GiftOverlayCanvas({
  streamId,
  enabled,
  liveKitBursts = [],
  burstOverlayRef,
}: GiftOverlayCanvasProps) {
  const screenBurstRef = useRef<EmojiScreenBurstHandle | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const seenLiveKitBurstIds = useRef(new Set<string>());
  const usesExternalBurst = Boolean(burstOverlayRef);

  const fireBurst = useCallback(
    (emoji: string) => {
      if (burstOverlayRef?.current) {
        burstOverlayRef.current.triggerBurst(emoji);
        return;
      }
      screenBurstRef.current?.triggerBurst(emoji);
    },
    [burstOverlayRef],
  );

  const fireAmenWave = useCallback(() => {
    const target = burstOverlayRef?.current ?? screenBurstRef.current;
    if (!target) return;
    for (let i = 0; i < 4; i++) {
      const emoji =
        AMEN_WORSHIP_EMOJIS[Math.floor(Math.random() * AMEN_WORSHIP_EMOJIS.length)] ?? "🙏";
      target.triggerBurst(emoji);
    }
  }, [burstOverlayRef]);

  useEffect(() => {
    if (!enabled || liveKitBursts.length === 0) return;
    const fresh = liveKitBursts.filter((b) => !seenLiveKitBurstIds.current.has(b.id));
    if (fresh.length === 0) return;
    for (const burst of fresh) {
      seenLiveKitBurstIds.current.add(burst.id);
      fireBurst(burst.emoji);
    }
  }, [enabled, liveKitBursts, fireBurst]);

  useEffect(() => {
    if (!enabled || !streamId) return;

    const giftChannel = supabase
      .channel(`realtime-stream-gifts:${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stream_gifts",
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          const giftId = (payload.new as { gift_id?: string })?.gift_id;
          if (!giftId) return;

          const { data: gift } = await supabase
            .from("gift_catalog")
            .select("sku")
            .eq("id", giftId)
            .maybeSingle();

          fireBurst(emojiForGiftSku(gift?.sku));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(giftChannel);
    };
  }, [enabled, streamId, supabase, fireBurst]);

  useEffect(() => {
    if (!enabled || !streamId) return;

    const interactionChannel = supabase
      .channel(streamInteractionChannelName(streamId))
      .on("broadcast", { event: AMEN_REACTION_EVENT }, () => {
        fireAmenWave();
      })
      .on(
        "broadcast",
        { event: WORSHIP_REACTION_EVENT },
        ({ payload }) => {
          const p = payload as { kind?: WorshipReactionKind; emoji?: string } | undefined;
          const emoji =
            p?.emoji ?? (p?.kind ? emojiForReactionKind(p.kind) : "✨");
          if (p?.kind === "amen") {
            fireAmenWave();
            return;
          }
          fireBurst(emoji);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(interactionChannel);
    };
  }, [enabled, streamId, supabase, fireAmenWave, fireBurst]);

  useEffect(() => {
    if (!enabled || usesExternalBurst) return;

    const onLocalReaction = (event: Event) => {
      const detail = (event as CustomEvent<LocalWorshipReactionDetail>).detail;
      const emoji = detail?.emoji ?? "✨";
      if (detail?.kind === "amen") {
        fireAmenWave();
        return;
      }
      fireBurst(emoji);
    };

    window.addEventListener(LOCAL_WORSHIP_REACTION_EVENT, onLocalReaction);
    return () => window.removeEventListener(LOCAL_WORSHIP_REACTION_EVENT, onLocalReaction);
  }, [enabled, usesExternalBurst, fireAmenWave, fireBurst]);

  if (!enabled || usesExternalBurst) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <EmojiScreenBurstOverlay ref={screenBurstRef} />
    </div>
  );
}
