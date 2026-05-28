"use client";

import { useMemo } from "react";
import { useLiveBroadcastStore } from "@/stores/live-broadcast-store";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";

type Options = {
  channelId?: string | null;
  userId?: string | null;
};

/**
 * Resolves viewer vs creator command-hub mode for streaming surfaces.
 */
export function useStreamWorkspaceMode({ channelId, userId }: Options) {
  const isPublishing = useLiveBroadcastStore((s) => s.isPublishing);
  const publisherUserId = useLiveBroadcastStore((s) => s.publisherUserId);
  const publisherRailKey = useLiveBroadcastStore((s) => s.publisherRailKey);
  const roomName = useLiveBroadcastStore((s) => s.roomName);

  return useMemo(() => {
    const ownsByUser =
      Boolean(isPublishing && userId && publisherUserId && userId === publisherUserId);
    const ownsByRail =
      Boolean(isPublishing && channelId && publisherRailKey && channelId === publisherRailKey);
    const ownsByRoom =
      Boolean(
        isPublishing &&
          channelId &&
          roomName &&
          roomName === unifiedStreamRoomName(channelId),
      );

    const isCreatorHub = ownsByUser || ownsByRail || ownsByRoom;

    return {
      isPublishing,
      isCreatorHub,
      isViewer: !isCreatorHub,
      publisherRailKey,
      roomName,
    };
  }, [channelId, isPublishing, publisherRailKey, publisherUserId, roomName, userId]);
}
