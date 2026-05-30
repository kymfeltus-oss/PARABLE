import type { ReactNode } from "react";

export interface StreamTelemetry {
  status: "OFFLINE" | "LIVE" | "STANDBY";
  bitrateKbps: number;
  fps: number;
  viewerCount: number;
  uptimeSeconds: number;
}

export interface StreamMetadata {
  title: string;
  category: string;
}

export interface EmojiBurstItem {
  id: string;
  emoji: string;
  x: number;
  scale: number;
  delay: number;
  duration: number;
}

export interface CreatorStudioControlRoomProps {
  headerSlot: ReactNode;
  telemetrySlot: ReactNode;
  videoSlot: ReactNode;
  metadataSlot: ReactNode;
  chatSlot: ReactNode;
}

export interface UserLivePlayerViewProps {
  playerSlot: ReactNode;
  overlaySlot: ReactNode;
  reactionHudSlot: ReactNode;
  metaBarSlot: ReactNode;
  chatRailSlot: ReactNode;
}
