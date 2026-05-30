"use client";

import { useEffect, useRef, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import { getLiveKitClientUrl } from "@/lib/livekit-env";
import { parseCelebrationPayload } from "@/lib/livekit-celebration";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";

type CelebrationBurst = { id: string; emoji: string };

type Options = {
  streamId: string | null | undefined;
  enabled: boolean;
};

/**
 * Viewer-side LiveKit data pipe — subscribes to CELEBRATION_BURST from the streamer cockpit.
 */
export function useLiveKitCelebrationReceiver({ streamId, enabled }: Options) {
  const [bursts, setBursts] = useState<CelebrationBurst[]>([]);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    if (!enabled || !streamId) {
      setBursts([]);
      return;
    }

    let cancelled = false;
    const room = new Room();
    roomRef.current = room;

    const onData = (payload: Uint8Array) => {
      const event = parseCelebrationPayload(payload);
      if (!event) return;
      const burst = { id: crypto.randomUUID(), emoji: event.emoji };
      setBursts((prev) => [...prev, burst]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burst.id));
      }, 3000);
    };

    room.on(RoomEvent.DataReceived, onData);

    void (async () => {
      try {
        const roomName = unifiedStreamRoomName(streamId);
        const identity = `viewer-celebration-${crypto.randomUUID().slice(0, 8)}`;
        const res = await fetch("/api/livekit/get-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName,
            participantIdentity: identity,
            isPublisher: false,
          }),
        });
        const data = (await res.json()) as {
          token?: string;
          serverUrl?: string;
          url?: string;
          error?: string;
        };
        if (!res.ok || !data.token) {
          throw new Error(data.error ?? "Token failed");
        }
        if (cancelled) return;
        const serverUrl = data.serverUrl ?? data.url ?? getLiveKitClientUrl();
        await room.connect(serverUrl, data.token);
      } catch (err) {
        console.error("[useLiveKitCelebrationReceiver]", err);
      }
    })();

    return () => {
      cancelled = true;
      room.off(RoomEvent.DataReceived, onData);
      void room.disconnect();
      roomRef.current = null;
    };
  }, [enabled, streamId]);

  return bursts;
}
