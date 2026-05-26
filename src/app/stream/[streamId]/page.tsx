"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import StreamWorkspace from "@/components/StreamWorkspace";
import ParableLivePlayer from "@/components/ParableLivePlayer";
import { createClient } from "@/utils/supabase/client";
import { getDemoPersonaById } from "@/lib/demo-personas";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_live?: boolean | null;
};

const LIVEKIT_SERVER_URL =
  process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "wss://parable-gkh2cjih.livekit.cloud";

export default function StreamViewerPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = String((params as { streamId?: string }).streamId ?? "");
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [lkToken, setLkToken] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);

  const unifiedRoomName = streamId ? unifiedStreamRoomName(streamId) : "";

  useEffect(() => {
    if (!streamId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const demo = getDemoPersonaById(streamId);
      if (demo) {
        if (!cancelled) {
          setProfile({
            id: demo.id,
            username: demo.username,
            full_name: demo.full_name,
            avatar_url: demo.avatar_url,
            is_live: demo.is_live,
          });
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, is_live")
        .eq("id", streamId)
        .maybeSingle();

      if (!cancelled) {
        setProfile((data as ProfileRow | null) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [streamId, supabase]);

  useEffect(() => {
    if (!streamId || !unifiedRoomName) return;
    let cancelled = false;

    async function fetchViewerAccess() {
      setTokenError(null);
      try {
        const randomIdentity = `viewer-${crypto.randomUUID().substring(0, 8)}`;
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
  }, [streamId, unifiedRoomName]);

  const displayName = profile?.full_name?.trim() || profile?.username?.trim() || "Broadcaster";
  const playbackUrl = `${LIVEKIT_SERVER_URL}/${unifiedRoomName}`;

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
        </p>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[#94A3B8]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Connecting to stream…
        </div>
      ) : !profile ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-[#94A3B8]">
          Stream not found.
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
                <ParableLivePlayer token={lkToken} serverUrl={LIVEKIT_SERVER_URL} className="h-full w-full rounded-none border-0" />
              )}
            </div>
          }
        />
      )}
    </div>
  );
}
