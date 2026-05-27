"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import StreamWorkspace from "@/components/StreamWorkspace";
import LiveVideoPlayer from "@/components/LiveVideoPlayer";
import { getLiveKitClientUrl } from "@/lib/livekit-env";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";

export type StreamProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_live?: boolean | null;
};

type StreamWorkspaceClientProps = {
  streamId: string;
  initialProfile: StreamProfileRow | null;
  initialPulse: number;
  viewerUserId: string | null;
};

export default function StreamWorkspaceClient({
  streamId,
  initialProfile,
  initialPulse,
  viewerUserId,
}: StreamWorkspaceClientProps) {
  const router = useRouter();
  const [profile] = useState<StreamProfileRow | null>(initialProfile);
  const [lkToken, setLkToken] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);

  const unifiedRoomName = streamId ? unifiedStreamRoomName(streamId) : "";

  useEffect(() => {
    if (!streamId || !unifiedRoomName) return;
    let cancelled = false;

    async function fetchViewerAccess() {
      setTokenError(null);
      try {
        const randomIdentity = viewerUserId
          ? `viewer-${viewerUserId.slice(0, 8)}`
          : `viewer-${crypto.randomUUID().substring(0, 8)}`;
        const res = await fetch("/api/livekit/viewer-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName: unifiedRoomName, identity: randomIdentity }),
        });
        const data = (await res.json()) as { token?: string; error?: string };
        if (!res.ok || !data.token) {
          throw new Error(data.error ?? "Viewer token request failed");
        }
        if (!cancelled) setLkToken(data.token);
      } catch (err) {
        console.error("Failed loading unified room token allocation context:", err);
        if (!cancelled) {
          setTokenError(err instanceof Error ? err.message : "Could not authorize viewer access");
        }
      }
    }

    void fetchViewerAccess();
    return () => {
      cancelled = true;
    };
  }, [streamId, unifiedRoomName, viewerUserId]);

  const displayName = profile?.full_name?.trim() || profile?.username?.trim() || "Broadcaster";
  const liveKitClientUrl = getLiveKitClientUrl();
  const playbackUrl = `${liveKitClientUrl}/${unifiedRoomName}`;

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col bg-[#01040A] text-[#F8FAFC]">
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-[#94A3B8]">
          Stream not found.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#01040A] text-[#F8FAFC]">
      <div className="flex items-center gap-2 border-b border-[#06111E] px-3 py-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full p-2 text-[#94A3B8] hover:bg-[#06111E] hover:text-[#F8FAFC]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <p className="text-xs text-[#94A3B8]">
          Sanctuary stream workspace · {unifiedRoomName || "…"}
          {initialPulse > 0 ? (
            <span className="ml-2 text-cyan-400/80">Pulse {initialPulse.toFixed(2)}</span>
          ) : null}
        </p>
      </div>

      {!lkToken && !tokenError ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[#94A3B8]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Connecting to stream…
        </div>
      ) : (
        <StreamWorkspace
          streamId={profile.id}
          playbackUrl={playbackUrl}
          creatorName={displayName}
          initialViewMode="clean"
          videoSlot={
            <div className="absolute inset-0 h-full w-full">
              {tokenError ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-900 px-4 text-center text-sm text-red-300">
                  {tokenError}
                </div>
              ) : (
                <LiveVideoPlayer
                  roomName={unifiedRoomName}
                  token={lkToken}
                  serverUrl={liveKitClientUrl}
                  className="h-full w-full rounded-none border-0"
                />
              )}
            </div>
          }
        />
      )}
    </div>
  );
}
