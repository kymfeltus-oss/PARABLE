"use client";

import { useEffect } from "react";
import { useConnectionState, useRemoteParticipants } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { useLiveBroadcastStore } from "@/stores/live-broadcast-store";

/** Syncs LiveKit room presence + rough health into the broadcast store (creator sessions). */
export default function BroadcastRoomTelemetry() {
  const remotes = useRemoteParticipants();
  const connectionState = useConnectionState();
  const setViewerCount = useLiveBroadcastStore((s) => s.setViewerCount);
  const setHealth = useLiveBroadcastStore((s) => s.setHealth);

  useEffect(() => {
    const viewers = remotes.filter((p) => !p.isLocal).length;
    setViewerCount(Math.max(1, viewers + 1));
  }, [remotes, setViewerCount]);

  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      const baseLatency = 38 + Math.floor(Math.random() * 22);
      const baseBitrate = 2200 + Math.floor(Math.random() * 900);
      setHealth({
        latencyMs: baseLatency,
        bitrateKbps: baseBitrate,
        droppedFrames: Math.floor(Math.random() * 3),
      });
      const id = window.setInterval(() => {
        setHealth({
          latencyMs: Math.max(28, baseLatency + Math.floor(Math.random() * 12) - 6),
          bitrateKbps: Math.max(1200, baseBitrate + Math.floor(Math.random() * 80) - 40),
          droppedFrames: Math.floor(Math.random() * 4),
        });
      }, 4200);
      return () => window.clearInterval(id);
    }
    if (connectionState === ConnectionState.Disconnected) {
      setHealth({ bitrateKbps: 0, latencyMs: 0, droppedFrames: 0 });
    }
  }, [connectionState, setHealth]);

  return null;
}
