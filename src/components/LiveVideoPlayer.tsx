"use client";

import "@livekit/components-styles";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { getLiveKitClientUrl } from "@/lib/livekit-env";
import BroadcastRoomTelemetry from "@/components/kick-home/BroadcastRoomTelemetry";
import { KickStreamPlayerChromeLiveKit } from "@/components/kick-home/KickStreamPlayerChrome";

export type LiveVideoPlayerProps = {
  roomName?: string;
  token: string;
  serverUrl?: string;
  className?: string;
  onDisconnected?: () => void;
  onError?: (message: string) => void;
  /** Render wired player chrome inside the LiveKit room. */
  showChrome?: boolean;
  /** Sync creator telemetry when publishing from studio. */
  syncBroadcastTelemetry?: boolean;
};

export default function LiveVideoPlayer({
  roomName,
  token,
  serverUrl = getLiveKitClientUrl(),
  className,
  onDisconnected,
  onError,
  showChrome = true,
  syncBroadcastTelemetry = false,
}: LiveVideoPlayerProps) {
  if (!token) {
    return (
      <div
        className={[
          "absolute inset-0 flex flex-col items-center justify-center bg-black text-zinc-400",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#00f2fe] border-t-transparent" />
        <p className="text-sm">Connecting to media edge server…</p>
        {roomName ? (
          <p className="mt-1 font-mono text-[10px] text-zinc-600">room: {roomName}</p>
        ) : null}
      </div>
    );
  }

  const shell = ["absolute inset-0 flex items-center justify-center bg-black", className]
    .filter(Boolean)
    .join(" ");

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={serverUrl}
      connect
      data-lk-theme="default"
      className={shell}
      onDisconnected={onDisconnected}
      onError={(e) => onError?.(e?.message ?? "LiveKit error")}
    >
      <ActiveStreamRenderer roomName={roomName} />
      <RoomAudioRenderer />
      {syncBroadcastTelemetry ? <BroadcastRoomTelemetry /> : null}
      {showChrome ? (
        <KickStreamPlayerChromeLiveKit isLive engine="livekit" />
      ) : null}
    </LiveKitRoom>
  );
}

function ActiveStreamRenderer({ roomName }: { roomName?: string }) {
  const tracks = useTracks([Track.Source.ScreenShare, Track.Source.Camera], {
    onlySubscribed: true,
  });

  const remoteVideo = tracks.filter(
    (ref) => ref.participant && !ref.participant.isLocal && ref.publication,
  );

  const activeTrack =
    remoteVideo.find((ref) => ref.source === Track.Source.ScreenShare) ??
    remoteVideo.find((ref) => ref.source === Track.Source.Camera) ??
    remoteVideo[0];

  if (!activeTrack) {
    return (
      <div className="px-4 text-center">
        <div className="mb-2 inline-block rounded bg-zinc-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Offline
        </div>
        <p className="text-xs text-zinc-500">Streamer is not broadcasting live right now.</p>
        {roomName ? (
          <p className="mt-2 font-mono text-[10px] text-zinc-600">livekit://{roomName}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <VideoTrack trackRef={activeTrack} className="h-full w-full object-contain" />
    </div>
  );
}

export { LiveVideoPlayer };
