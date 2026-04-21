"use client";

import "@livekit/components-styles";

import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import type { RoomOptions } from "livekit-client";

export type ParableLivePlayerProps = {
  token: string;
  serverUrl: string;
  /** Merged with the default room shell classes. */
  className?: string;
  /** Passed to `LiveKitRoom` — defaults favor smooth playback across browsers. */
  roomOptions?: RoomOptions;
};

const defaultRoomOptions: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  stopLocalTrackOnUnpublish: true,
};

/**
 * Sanctuary / Hub viewer: connects with a pre-fetched token and renders the LiveKit
 * `VideoConference` prefab plus `RoomAudioRenderer` so remote audio works everywhere.
 */
const defaultShell =
  "h-full w-full min-h-0 bg-black border-2 border-cyan-400 rounded-lg overflow-hidden";

export function ParableLivePlayer({ token, serverUrl, className, roomOptions }: ParableLivePlayerProps) {
  const shell = [defaultShell, className?.trim()].filter(Boolean).join(" ");

  return (
    <LiveKitRoom
      video
      audio
      token={token}
      serverUrl={serverUrl}
      connect
      className={shell}
      options={{ ...defaultRoomOptions, ...roomOptions }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

export default ParableLivePlayer;
