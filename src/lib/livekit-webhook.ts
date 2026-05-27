import type { WebhookEvent } from "livekit-server-sdk";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";

const PROFILE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ROOM_PREFIX = "parable-live-";

export type LiveKitPresenceUpdate = {
  profileId: string;
  isLive: boolean;
  source: "ingress" | "room";
  streamKey?: string;
  roomName?: string;
};

export function extractIngressStreamKey(event: WebhookEvent): string | null {
  const ingress = event.ingressInfo;
  const key =
    ingress?.streamKey?.trim() ||
    (ingress as { stream_key?: string } | undefined)?.stream_key?.trim();
  return key || null;
}

export function profileIdFromParableRoom(roomName: string | undefined): string | null {
  if (!roomName?.startsWith(ROOM_PREFIX)) return null;
  const id = roomName.slice(ROOM_PREFIX.length).trim();
  return PROFILE_UUID_RE.test(id) ? id : null;
}

export function resolvePresenceFromWebhook(event: WebhookEvent): LiveKitPresenceUpdate | null {
  const name = event.event;

  if (name === "ingress_started" || name === "ingress_ended") {
    const streamKey = extractIngressStreamKey(event);
    if (!streamKey) return null;
    const roomName = event.ingressInfo?.roomName?.trim();
    const fromRoom = profileIdFromParableRoom(roomName);
    return {
      profileId: fromRoom ?? "",
      isLive: name === "ingress_started",
      source: "ingress",
      streamKey,
      roomName: roomName || undefined,
    };
  }

  if (name === "room_started" || name === "room_finished") {
    const roomName = event.room?.name?.trim();
    const profileId = profileIdFromParableRoom(roomName);
    if (!profileId) return null;
    return {
      profileId,
      isLive: name === "room_started",
      source: "room",
      roomName: roomName || unifiedStreamRoomName(profileId),
    };
  }

  return null;
}
