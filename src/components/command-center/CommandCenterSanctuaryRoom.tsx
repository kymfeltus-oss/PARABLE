"use client";

import "@livekit/components-styles";

import { useMemo } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRemoteParticipants,
  VideoConference,
} from "@livekit/components-react";
import type { RoomOptions } from "livekit-client";

const roomOptions: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: {
    resolution: { width: 1280, height: 720, frameRate: 30 },
  },
};

function SanctuaryRemoteCount({ roomName }: { roomName: string }) {
  const remotes = useRemoteParticipants();
  const count = remotes.length;

  const label = useMemo(() => {
    if (count === 0) return "No remote viewers yet";
    if (count === 1) return "1 viewer in the Sanctuary";
    return `${count} viewers in the Sanctuary`;
  }, [count]);

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-[20] flex max-w-[min(100%,20rem)] flex-col gap-0.5 rounded-lg border border-[#00f2ff]/30 bg-black/75 px-3 py-2 text-left shadow-lg backdrop-blur-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00f2ff]/90">Sanctuary · {roomName}</p>
      <p className="text-xs font-semibold tabular-nums text-white">{label}</p>
    </div>
  );
}

export type CommandCenterSanctuaryRoomProps = {
  token: string;
  serverUrl: string;
  roomName?: string;
  onDisconnected?: () => void;
  onError?: (message: string) => void;
  className?: string;
};

/**
 * Command Center live shell: publisher camera via `VideoConference`, remote tally via `useRemoteParticipants`.
 */
export function CommandCenterSanctuaryRoom({
  token,
  serverUrl,
  roomName = "Sanctuary",
  onDisconnected,
  onError,
  className,
}: CommandCenterSanctuaryRoomProps) {
  const shell =
    [className?.trim(), "relative h-full min-h-[200px] w-full min-w-0 overflow-hidden bg-black"].filter(Boolean).join(" ");

  return (
    <LiveKitRoom
      video
      audio
      token={token}
      serverUrl={serverUrl}
      connect
      data-lk-theme="default"
      options={roomOptions}
      className={shell}
      onDisconnected={onDisconnected}
      onError={(e) => onError?.(e?.message ?? "LiveKit error")}
    >
      <SanctuaryRemoteCount roomName={roomName} />
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
