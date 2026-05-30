"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Radio } from "lucide-react";
import LiveVideoPlayer from "@/components/LiveVideoPlayer";
import HybridStreamPlayer from "@/components/watch/HybridStreamPlayer";
import KickLiveWatchPanel from "@/components/kick-home/KickLiveWatchPanel";
import KickWatchAboutPanel from "@/components/kick-home/KickWatchAboutPanel";
import ParableLiveChatRail from "@/components/kick-home/ParableLiveChatRail";
import WorshipReactionHud from "@/components/kick-home/WorshipReactionHud";
import StreamersHubLiveChat from "@/components/streamers/StreamersHubLiveChat";
import ParableHeroVideo from "@/components/kick-home/ParableHeroVideo";
import KickStreamPlayerChrome from "@/components/kick-home/KickStreamPlayerChrome";
import CreatorCommandStrip from "@/components/kick-home/CreatorCommandStrip";
import { useAuth } from "@/hooks/useAuth";
import { useStreamWorkspaceMode } from "@/hooks/useStreamWorkspaceMode";
import {
  DEMO_AVATAR_FALLBACK,
  getDemoPersonaById,
  getDemoPersonaByUsername,
} from "@/lib/demo-personas";
import {
  getDemoWatchRecordById,
  isDemoRailWatchChannel,
} from "@/lib/streamers-demo-simulation";
import { demoStreamMp4ForChannel } from "@/lib/demo-hls-stream";
import { getLiveKitClientUrl } from "@/lib/livekit-env";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";
import { useLiveBroadcastStore } from "@/stores/live-broadcast-store";
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
import {
  emojiForReactionKind,
  skuForReactionKind,
  type WorshipReactionKind,
} from "@/lib/worship-reactions";
import {
  WORSHIP_REACTION_EVENT,
  dispatchLocalWorshipReaction,
  streamInteractionChannelName,
} from "@/lib/stream-interactions";
import { debugSessionLog } from "@/lib/debug-session-log";
import { resolveStreamChatRoomId } from "@/lib/stream-chat-room";
import { useLiveKitCelebrationReceiver } from "@/hooks/useLiveKitCelebrationReceiver";
import { isParableAdminProfile, profileRowToStreamerRecord } from "@/lib/categories";
import AdminCategoryOverrideHud from "@/components/kick-home/AdminCategoryOverrideHud";
import type { RealtimeChannel } from "@supabase/supabase-js";

const PROFILE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  channelId: string;
  /** Amazon IVS playback URL from server profile row (real creators). */
  ivsPlaybackUrl?: string;
};

export default function KickWatchExperience({ channelId, ivsPlaybackUrl = "" }: Props) {
  const { userProfile } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const interactionChannelRef = useRef<RealtimeChannel | null>(null);

  const [streamer, setStreamer] = useState<StreamerProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followBusy, setFollowBusy] = useState(false);
  const [giftBusy, setGiftBusy] = useState(false);
  const [lkToken, setLkToken] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"chat" | "about">("chat");
  const [broadcasterCategoryId, setBroadcasterCategoryId] = useState<string | null>(null);

  const observerId = userProfile?.id ?? null;
  const isAdmin = isParableAdminProfile(userProfile);
  const broadcasterProfileId = useMemo(() => {
    const resolved = resolveStreamChatRoomId(channelId);
    if (resolved) return resolved;
    if (PROFILE_UUID_RE.test(channelId)) return channelId;
    return null;
  }, [channelId]);
  const unifiedRoomName = channelId ? unifiedStreamRoomName(channelId) : "";
  const liveKitClientUrl = getLiveKitClientUrl();
  const displayName = userProfile?.username || "Guest";

  const { isCreatorHub } = useStreamWorkspaceMode({
    channelId,
    userId: observerId,
  });
  const liveRoomCount = useLiveBroadcastStore((s) => s.viewerCount);
  const chatVariant = isCreatorHub ? "creator" : "viewer";

  const loadStreamer = useCallback(async () => {
    setLoading(true);
    const railDemo = getDemoWatchRecordById(channelId);
    if (railDemo) {
      setStreamer(railDemo);
      setLoading(false);
      return;
    }

    const demo = getDemoPersonaById(channelId);
    if (demo) {
      setStreamer({
        id: channelId,
        username: demo.full_name,
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
    if (!broadcasterProfileId) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, username, avatar_url, viewer_count, current_category, is_live, stream_title, category_id, display_name, full_name",
        )
        .eq("id", broadcasterProfileId)
        .maybeSingle();
      if (cancelled || !data) return;
      setBroadcasterCategoryId(data.category_id ?? null);
      if (data.is_live) {
        setStreamer(profileRowToStreamerRecord(data));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [broadcasterProfileId, supabase]);

  useEffect(() => {
    if (!broadcasterProfileId) return;
    const ch = supabase
      .channel(`profile-category-${broadcasterProfileId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${broadcasterProfileId}`,
        },
        (payload) => {
          const row = payload.new as {
            current_category?: string | null;
            category_id?: string | null;
            stream_title?: string | null;
            viewer_count?: number | null;
          };
          if (row.category_id != null) setBroadcasterCategoryId(row.category_id);
          setStreamer((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              liveCategory: row.current_category?.trim() || prev.liveCategory,
              streamTitle: row.stream_title?.trim() || prev.streamTitle,
              currentViewers:
                typeof row.viewer_count === "number" ? row.viewer_count : prev.currentViewers,
            };
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [broadcasterProfileId, supabase]);

  useEffect(() => {
    if (!channelId) return;
    const ch = supabase.channel(streamInteractionChannelName(channelId));
    ch.subscribe();
    interactionChannelRef.current = ch;
    return () => {
      void supabase.removeChannel(ch);
      interactionChannelRef.current = null;
    };
  }, [channelId, supabase]);

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

  const demoTheatreEligible =
    isDemoRailWatchChannel(channelId) || Boolean(getDemoPersonaById(channelId));

  useEffect(() => {
    if (!streamer || streamer.status !== "live" || !unifiedRoomName) return;
    if (demoTheatreEligible) {
      setLkToken("");
      setTokenError(null);
      return;
    }
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
          setLkToken("");
          setTokenError(err instanceof Error ? err.message : "Could not connect");
        }
      }
    }

    void fetchToken();
    return () => {
      cancelled = true;
    };
  }, [channelId, demoTheatreEligible, observerId, streamer, unifiedRoomName]);

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

  const sendGift = useCallback(
    async (sku = "gift_clap") => {
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
    },
    [observerId, streamer],
  );

  const isLive = streamer?.status === "live";

  const liveKitBursts = useLiveKitCelebrationReceiver({
    streamId: streamer?.id,
    enabled: Boolean(isLive && streamer?.id),
  });

  const executeSubscriptionPurchase = useCallback(async () => {
    if (!streamer) return;
    if (!observerId) {
      alert("Please log in to subscribe.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_connect_id")
      .eq("id", streamer.id)
      .maybeSingle();

    const streamerStripeAccountId = profile?.stripe_connect_id?.trim();
    if (!streamerStripeAccountId) {
      alert("Creator has not linked a Stripe Connect payout account yet.");
      return;
    }

    try {
      const response = await fetch("/api/checkout/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamerId: streamer.id,
          streamerStripeAccountId,
          userId: observerId,
          tierPriceInCents: 499,
        }),
      });
      const session = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (session.checkoutUrl) {
        window.location.href = session.checkoutUrl;
        return;
      }
      alert(session.error ?? "Checkout session could not be created.");
    } catch (err) {
      console.error("Subscription checkout failed:", err);
      alert("Network error while starting checkout.");
    }
  }, [observerId, streamer, supabase]);

  const emitWorshipReaction = useCallback(
    (kind: WorshipReactionKind) => {
      const emoji = emojiForReactionKind(kind);
      const ch = interactionChannelRef.current;
      const hasChannel = Boolean(ch);

      const showLocalBurst = () => {
        dispatchLocalWorshipReaction({ kind, emoji });
      };

      if (ch) {
        void ch
          .send({
            type: "broadcast",
            event: WORSHIP_REACTION_EVENT,
            payload: { kind, emoji },
          })
          .then((result) => {
            // #region agent log
            debugSessionLog({
              runId: "post-fix",
              hypothesisId: "H2",
              location: "KickWatchExperience.tsx:emitSendResult",
              message: "broadcast send result",
              data: { kind, hasChannel, error: result !== "ok" ? String(result) : null },
            });
            // #endregion
            if (result !== "ok") showLocalBurst();
          });
      } else {
        // #region agent log
        debugSessionLog({
          runId: "post-fix",
          hypothesisId: "H2",
          location: "KickWatchExperience.tsx:emitNoChannel",
          message: "no channel — local burst only",
          data: { kind, channelId },
        });
        // #endregion
        showLocalBurst();
      }

      if (kind === "offering" && observerId && streamer) {
        void sendGift(skuForReactionKind("offering"));
      }
    },
    [observerId, streamer, sendGift, channelId],
  );

  const tags = useMemo(() => {
    if (!streamer) return [];
    return [streamer.liveCategory || "IRL", "English", streamer.username.toLowerCase()];
  }, [streamer]);

  const avatarUrl =
    streamer?.profilePicture || getDemoPersonaById(channelId)?.avatar_url || DEMO_AVATAR_FALLBACK;

  const displayViewerCount =
    isCreatorHub && liveRoomCount > 0 ? liveRoomCount : (streamer?.currentViewers ?? 0);

  const useDemoTheatrePlayer = Boolean(
    streamer?.status === "live" && !lkToken && demoTheatreEligible,
  );

  const useHybridIvsPlayer = Boolean(
    streamer?.status === "live" &&
      !demoTheatreEligible &&
      ivsPlaybackUrl.trim().length > 0,
  );

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
        <Link href="/streamers" className="text-sm font-bold text-[#00f2fe] hover:underline">
          Back to streamers
        </Link>
      </div>
    );
  }

  const videoSlot = useHybridIvsPlayer ? (
    <HybridStreamPlayer
      streamId={channelId}
      isLive={isLive ?? false}
      ivsPlaybackUrl={ivsPlaybackUrl}
      className="h-full w-full"
    />
  ) : lkToken ? (
    <LiveVideoPlayer
      roomName={unifiedRoomName}
      token={lkToken}
      serverUrl={liveKitClientUrl}
      className="h-full w-full"
      showChrome
      syncBroadcastTelemetry={isCreatorHub}
    />
  ) : useDemoTheatrePlayer ? (
    <>
      <ParableHeroVideo
        streamUrl={demoStreamMp4ForChannel(channelId)}
        mp4FallbackUrl={demoStreamMp4ForChannel(channelId)}
        className="absolute inset-0 h-full w-full"
        videoRef={demoVideoRef}
      />
      <KickStreamPlayerChrome
        engine="html5"
        videoRef={demoVideoRef}
        isLive
        playerRootSelector="[data-watch-player-root]"
      />
    </>
  ) : null;

  const personaBio =
    getDemoPersonaById(channelId) ??
    getDemoPersonaByUsername(streamer.username) ??
    null;
  const channelBio =
    personaBio?.bio ??
    `Watch ${streamer.username} live on PARABLE — chat, reactions, and community.`;

  const adminOverlay =
    isAdmin && broadcasterProfileId && isLive ? (
      <AdminCategoryOverrideHud
        broadcasterProfileId={broadcasterProfileId}
        currentCategoryId={broadcasterCategoryId}
        currentCategoryName={streamer?.liveCategory}
        onCategoryChange={(name, categoryId) => {
          setBroadcasterCategoryId(categoryId);
          setStreamer((prev) => (prev ? { ...prev, liveCategory: name } : prev));
        }}
      />
    ) : null;

  const livePanelProps = {
    streamId: streamer.id,
    username: streamer.username,
    avatarUrl,
    streamTitle: streamer.streamTitle,
    tags,
    viewerCount: displayViewerCount,
    isFollowing,
    followBusy,
    giftBusy,
    onFollow: () => void toggleFollow(),
    onGiftSubs: () => void sendGift("gift_clap"),
    onWorshipReaction: emitWorshipReaction,
    onSubscribe: () => alert("Subscriptions coming soon."),
    loadingVideo:
      !lkToken && !useDemoTheatrePlayer && !useHybridIvsPlayer && !tokenError,
    videoError: tokenError && !useDemoTheatrePlayer && !useHybridIvsPlayer ? tokenError : null,
    videoSlot,
    adminOverlay,
  };

  return (
    <>
      {/* ——— Kick mobile watch (< md) ——— */}
      <div className="flex h-[100dvh] w-screen flex-col overflow-hidden bg-slate-950 font-inter text-white md:hidden">
        {isLive ? (
          <>
            <KickLiveWatchPanel {...livePanelProps} shell="mobile" />
            {isCreatorHub ? <CreatorCommandStrip className="top-14!" /> : null}

            <div
              className="flex shrink-0 items-center border-b border-slate-800 bg-slate-950"
              role="tablist"
              aria-label="Stream sections"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === "chat"}
                onClick={() => setMobileTab("chat")}
                className={[
                  "flex-1 py-3 text-center text-sm font-bold transition",
                  mobileTab === "chat"
                    ? "border-b-2 border-green-500 text-white"
                    : "border-b-2 border-transparent text-slate-400",
                ].join(" ")}
              >
                Chat
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === "about"}
                onClick={() => setMobileTab("about")}
                className={[
                  "flex-1 py-3 text-center text-sm font-bold transition",
                  mobileTab === "about"
                    ? "border-b-2 border-green-500 text-white"
                    : "border-b-2 border-transparent text-slate-400",
                ].join(" ")}
              >
                About
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {mobileTab === "chat" ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <StreamersHubLiveChat
                    streamKey={streamer.id}
                    streamLabel={streamer.username}
                    senderDisplayName={displayName}
                    variant={chatVariant}
                    fillHeight
                    showHeader={false}
                    composerPlacement="viewport-fixed"
                    showReactionToggle
                    enableQuickReactions
                    reactionHud={
                      <WorshipReactionHud
                        layout="mobile-drawer"
                        onReaction={emitWorshipReaction}
                        disabled={giftBusy}
                      />
                    }
                    className="min-h-0 flex-1 border-0 bg-transparent shadow-none"
                  />
                </div>
              ) : (
                <KickWatchAboutPanel
                  username={streamer.username}
                  avatarUrl={avatarUrl}
                  streamTitle={streamer.streamTitle}
                  tags={tags}
                  viewerCount={displayViewerCount}
                  followerCount={followerCount}
                  bio={channelBio}
                  liveCategory={streamer.liveCategory || "IRL"}
                  isFollowing={isFollowing}
                  followBusy={followBusy}
                  giftBusy={giftBusy}
                  onFollow={() => void toggleFollow()}
                  onGiftSubs={() => void sendGift("gift_clap")}
                  onSubscribe={() => void executeSubscriptionPurchase()}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center text-slate-400">
            <p className="text-lg font-bold text-white">{streamer.username} is offline</p>
            <p className="text-sm">{followerCount.toLocaleString()} followers</p>
            <button
              type="button"
              onClick={() => void toggleFollow()}
              disabled={followBusy}
              className="rounded-lg bg-green-500 px-6 py-2 text-sm font-bold text-black"
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        )}
      </div>

      {/* ——— Desktop watch (≥ md) ——— */}
      <div className="hidden min-h-screen bg-black md:block">
        <div className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-4 md:p-6">
          <div className="min-w-0 space-y-4 md:col-span-3">
            <Link
              href="/streamers"
              className="inline-flex min-w-0 items-center gap-2 truncate text-xs text-white/50 hover:text-[#00f2fe]"
            >
              <ArrowLeft size={14} className="shrink-0" />
              Streamers
            </Link>

            {isLive ? (
              <div className="relative min-w-0">
                <KickLiveWatchPanel {...livePanelProps} shell="desktop" />
                {isCreatorHub ? <CreatorCommandStrip className="top-14!" /> : null}
              </div>
            ) : (
              <div className="rounded-lg bg-[#191b1f] p-8 text-center text-slate-400">
                <p className="truncate text-lg font-bold text-white">{streamer.username} is offline</p>
                <p className="mt-2 text-sm">{followerCount.toLocaleString()} followers</p>
                <button
                  type="button"
                  onClick={() => void toggleFollow()}
                  disabled={followBusy}
                  className="mt-4 rounded-lg bg-[#00f2fe] px-6 py-2 text-sm font-bold text-black"
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            )}
          </div>

          {isLive ? (
            <aside className="hidden min-h-[500px] min-w-0 md:flex">
              <ParableLiveChatRail
                streamKey={streamer.id}
                streamLabel={streamer.username}
                senderDisplayName={displayName}
                variant={chatVariant}
              />
            </aside>
          ) : null}
        </div>
      </div>
    </>
  );
}
