"use client";

import "@livekit/components-styles";

import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";

export type ParableLivePlayerProps = {
  token: string;
  serverUrl: string;
  className?: string;
};

function EmptySettings() {
  return null;
}

/**
 * Subscribe-only LiveKit viewer — no local publish paths; remote A/V via VideoConference prefab.
 */
export default function ParableLivePlayer({ token, serverUrl, className }: ParableLivePlayerProps) {
  if (!token || !serverUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900 font-sans text-sm italic text-slate-400">
        Awaiting live signal authorization...
      </div>
    );
  }

  const shell = [
    "relative h-full w-full overflow-hidden rounded-xl border border-slate-800 bg-black",
    className?.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shell}>
      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={serverUrl}
        connect
        data-lk-theme="default"
        className="flex h-full w-full flex-col justify-center"
      >
        <VideoConference SettingsComponent={EmptySettings} style={{ height: "100%", width: "100%" }} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

export { ParableLivePlayer };
