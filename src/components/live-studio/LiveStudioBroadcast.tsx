"use client";

import "@livekit/components-styles";

import { LiveKitRoom } from "@livekit/components-react";
import type { RoomOptions } from "livekit-client";
import LiveRoomStage from "@/components/livekit/LiveRoomStage";
import BroadcastRoomTelemetry from "@/components/kick-home/BroadcastRoomTelemetry";

type LiveStudioBroadcastProps = {
  token: string;
  serverUrl: string;
  roomName: string;
  camOn: boolean;
  micOn: boolean;
  roomOptions: RoomOptions;
  onDisconnected: () => void;
  onError: (message: string) => void;
  onMediaError: (message: string) => void;
};

export default function LiveStudioBroadcast({
  token,
  serverUrl,
  roomName,
  camOn,
  micOn,
  roomOptions,
  onDisconnected,
  onError,
  onMediaError,
}: LiveStudioBroadcastProps) {
  return (
    <LiveKitRoom
      data-lk-theme="default"
      token={token}
      serverUrl={serverUrl}
      options={roomOptions}
      connect
      audio={false}
      video={false}
      onDisconnected={onDisconnected}
      onError={(err) => {
        console.error("LiveKit error:", err);
        onError(err?.message || "LiveKit connection error.");
      }}
      className="absolute inset-0 relative z-0 h-full w-full min-h-0 min-w-0"
    >
      <LiveRoomStage camOn={camOn} micOn={micOn} onError={onMediaError} />
      <BroadcastRoomTelemetry />
      <div className="absolute top-2 left-2 z-10 pointer-events-none rounded-sm border border-white/10 bg-black/55 px-2 py-1 backdrop-blur-sm">
        <p className="text-[9px] font-black uppercase tracking-[4px] text-[#00f2ff]/90">Live</p>
        <p className="text-[10px] font-bold italic text-white/70">{roomName}</p>
      </div>
    </LiveKitRoom>
  );
}
