"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import LiveVideoPlayer from "@/components/LiveVideoPlayer";
import KickLiveWatchPanel from "@/components/kick-home/KickLiveWatchPanel";
import ParableLiveChatRail, { ParableLiveChatMobile } from "@/components/kick-home/ParableLiveChatRail";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_AVATAR_FALLBACK, getDemoPersonaById } from "@/lib/demo-personas";
import { getLiveKitClientUrl } from "@/lib/livekit-env";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";
import {
  countFollowers,
  isUserFollowing,
  toggleUserFollow,
} from "@/lib/user-follows";
import type {
  StreamerProfileRecord,
  StreamersApiErrorResponse,
  StreamersApiResponse,
} from "@/lib/streamers-types";
import { createClient } from "@/utils/supabase/client";

type Props = {
  channelId: string;
};

export default function KickWatchExperience({ channelId }: Props) {
  const { userProfile } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [streamer, setStreamer] = useState<StreamerProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followBusy, setFollowBusy] = useState(false);
  const [giftBusy, setGiftBusy] = useState(false);
  const [lkToken, setLkToken] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);

  const observerId = userProfile?.id ?? null;
  const unifiedRoomName = channelId ? unifiedStreamRoomName(channelId) : "";
  const liveKitClientUrl = getLiveKitClientUrl();
  const displayName = userProfile?.username || "Guest";

  const loadStreamer = useCallback(async () => {
    setLoading(true);
    const demo = getDemoPersonaById(channelId);
    if (demo) {
      setStreamer({
        id: demo.id,
        username: demo.username,
        profilePicture: demo.avatar_url,
        streamTitle: demo.posts[0]?.content?.slice(0, 56) || `${demo.full_name} Live`,
        currentViewers: demo.is_live ? 42_953 : 0,
        liveCategory: "IRL",
        status: demo.is_live ? "live" : "offline",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/streamers");
      const data = (await res.json()) as StreamersApiResponse | StreamersApiErrorResponse;
      if (data.ok) {
        setStreamer(data.streamers.find((s) => s.id === channelId) ?? null);
      }
    } catch (err) {
      console.error("KickWatchExperience load:", err);
      setStreamer(null);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    void loadStreamer();
  }, [loadStreamer]);

  useEffect(() => {
    if (!channelId || !observerId) return;
    void (async () => {
      const [followers, following] = await Promise.all([
        countFollowers(supabase, channelId),
        isUserFollowing(supabase, observerId, channelId),
      ]);
      setFollowerCount(followers);
      setIsFollowing(following);
    })();
  }, [channelId, observerId, supabase]);

  useEffect(() => {
    if (!streamer || streamer.status !== "live" || !unifiedRoomName) return;
    let cancelled = false;

    async function fetchToken() {
      setTokenError(null);
      try {
        const identity = observerId
          ? `viewer-${observerId.slice(0, 8)}`
          : `viewer-${crypto.randomUUID().slice(0, 8)}`;
        const res = await fetch("/api/livekit/viewer-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName: unifiedRoomName, identity }),
        });
        const data = (await res.json()) as { token?: string; error?: string };
        if (!res.ok || !data.token) throw new Error(data.error ?? "Token failed");
        if (!cancelled) setLkToken(data.token);
      } catch (err) {
        if (!cancelled) {
          setTokenError(err instanceof Error ? err.message : "Could not connect");
        }
      }
    }

    void fetchToken();
    return () => {
      cancelled = true;
    };
  }, [observerId, streamer, unifiedRoomName]);

  const toggleFollow = async () => {
    if (!observerId || !streamer) {
      alert("Please log in to follow creators.");
      return;
    }
    setFollowBusy(true);
    const result = await toggleUserFollow(supabase, observerId, streamer.id, isFollowing);
    setFollowBusy(false);
    if (!result.ok) {
      alert(result.error ?? "Could not update follow.");
      return;
    }
    setIsFollowing(!isFollowing);
    setFollowerCount((c) => Math.max(0, c + (isFollowing ? -1 : 1)));
  };

  const sendGift = async (sku = "gift_applause") => {
    if (!observerId) {
      alert("Please log in to send gifts.");
      return;
    }
    setGiftBusy(true);
    try {
      const res = await fetch("/api/stream/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: observerId,
          streamerId: streamer?.id,
          giftSku: sku,
          streamId: streamer?.id,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) alert(data.error || "Gift failed.");
    } finally {
      setGiftBusy(false);
    }
  };

  const tags = useMemo(() => {
    if (!streamer) return [];
    return [streamer.liveCategory || "IRL", "English", streamer.username.toLowerCase()];
  }, [streamer]);

  const avatarUrl =
    streamer?.profilePicture || getDemoPersonaById(channelId)?.avatar_url || DEMO_AVATAR_FALLBACK;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!streamer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <p>Channel not found.</p>
        <Link href="/streamers" className="text-sm font-bold text-[#53fc18] hover:underline">
          Back to streamers
        </Link>
      </div>
    );
  }

  const isLive = streamer.status === "live";

  return (
    <div className="min-h-screen bg-black font-inter text-white">
      <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-4 lg:p-6">
        <div className="space-y-4 lg:col-span-3">
          <Link
            href="/streamers"
            className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-[#53fc18]"
          >
            <ArrowLeft size={14} />
            Streamers
          </Link>

          {isLive ? (
            <KickLiveWatchPanel
              streamId={streamer.id}
              username={streamer.username}
              avatarUrl={avatarUrl}
              streamTitle={streamer.streamTitle}
              tags={tags}
              viewerCount={streamer.currentViewers}
              isFollowing={isFollowing}
              followBusy={followBusy}
              giftBusy={giftBusy}
              onFollow={() => void toggleFollow()}
              onGiftSubs={() => void sendGift("gift_applause")}
              onSubscribe={() => alert("Subscriptions coming soon.")}
              loadingVideo={!lkToken && !tokenError}
              videoError={tokenError}
              videoSlot={
                lkToken ? (
                  <LiveVideoPlayer
                    roomName={unifiedRoomName}
                    token={lkToken}
                    serverUrl={liveKitClientUrl}
                    className="h-full w-full"
                  />
                ) : null
              }
            />
          ) : (
            <div className="rounded-lg bg-[#191b1f] p-8 text-center text-slate-400">
              <p className="text-lg font-bold text-white">{streamer.username} is offline</p>
              <p className="mt-2 text-sm">{followerCount.toLocaleString()} followers</p>
              <button
                type="button"
                onClick={() => void toggleFollow()}
                disabled={followBusy}
                className="mt-4 rounded-lg bg-[#53fc18] px-6 py-2 text-sm font-bold text-black"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          )}

          <div className="lg:hidden">
            <ParableLiveChatMobile
              streamKey={streamer.id}
              streamLabel={streamer.username}
              senderDisplayName={displayName}
            />
          </div>
        </div>

        {isLive ? (
          <aside className="hidden min-h-[500px] lg:flex">
            <ParableLiveChatRail
              streamKey={streamer.id}
              streamLabel={streamer.username}
              senderDisplayName={displayName}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
