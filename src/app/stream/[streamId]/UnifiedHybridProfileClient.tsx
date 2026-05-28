"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LiveVideoPlayer from "@/components/LiveVideoPlayer";
import KickLiveWatchPanel from "@/components/kick-home/KickLiveWatchPanel";
import ParableHeroVideo from "@/components/kick-home/ParableHeroVideo";
import KickStreamPlayerChrome from "@/components/kick-home/KickStreamPlayerChrome";
import CreatorCommandStrip from "@/components/kick-home/CreatorCommandStrip";
import InstagramProfileView from "@/components/profile/InstagramProfileView";
import StreamersHubLiveChat from "@/components/streamers/StreamersHubLiveChat";
import { useAuth } from "@/hooks/useAuth";
import { useStreamWorkspaceMode } from "@/hooks/useStreamWorkspaceMode";
import { demoStreamMp4ForChannel } from "@/lib/demo-hls-stream";
import { useLiveBroadcastStore } from "@/stores/live-broadcast-store";
import {
  DEMO_AVATAR_FALLBACK,
  demoAvatarPath,
  getDemoPersonaById,
} from "@/lib/demo-personas";
import { getLiveKitClientUrl } from "@/lib/livekit-env";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";
import {
  countFollowers,
  countFollowing,
  isUserFollowing,
  toggleUserFollow,
} from "@/lib/user-follows";
import type { InstagramMediaItem, InstagramProfileData } from "@/lib/profile/instagram-profile-data";
import { createClient } from "@/utils/supabase/client";
import type { StreamProfileRow } from "@/components/StreamWorkspaceClient";

export type CreatorProfile = {
  id: string;
  username: string;
  avatar_url: string;
  is_live: boolean;
  viewer_count: number;
  current_category: string;
  stream_title: string;
  bio: string;
};

type UnifiedHybridProfileClientProps = {
  streamId: string;
  initialProfile: StreamProfileRow | null;
  viewerUserId: string;
};

const PROFILE_SELECT =
  "id, username, display_name, full_name, avatar_url, is_live, role, bio";

const GIFT_OPTIONS = [
  { sku: "gift_applause", label: "Applause 👏", cost: "50c" },
  { sku: "gift_controller", label: "Arcade 🎮", cost: "200c" },
  { sku: "gift_trophy", label: "Trophy 🏆", cost: "1000c" },
] as const;

function mapProfileRow(row: StreamProfileRow & { role?: string | null; bio?: string | null }): CreatorProfile {
  const demo = getDemoPersonaById(row.id);
  const username = row.username?.trim() || demo?.username || "creator";
  const display =
    row.full_name?.trim() ||
    (row as { display_name?: string | null }).display_name?.trim() ||
    demo?.full_name ||
    username;

  return {
    id: row.id,
    username,
    avatar_url:
      row.avatar_url?.trim() ||
      demo?.avatar_url ||
      demoAvatarPath(username) ||
      DEMO_AVATAR_FALLBACK,
    is_live: row.is_live === true || demo?.is_live === true,
    viewer_count: demo?.is_live ? 42_953 : 0,
    current_category: row.role?.trim() || demo?.role || "IRL",
    stream_title:
      demo?.posts[0]?.content?.slice(0, 56) ||
      `${display} Live`,
    bio: row.bio?.trim() || demo?.bio || "",
  };
}

function buildStreamTags(creator: CreatorProfile): string[] {
  return [
    creator.current_category,
    "English",
    creator.username.toLowerCase().replace(/\s+/g, ""),
  ];
}

export default function UnifiedHybridProfileClient({
  streamId,
  initialProfile,
  viewerUserId,
}: UnifiedHybridProfileClientProps) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [creator, setCreator] = useState<CreatorProfile | null>(() =>
    initialProfile ? mapProfileRow(initialProfile) : null,
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [archiveMedia, setArchiveMedia] = useState<InstagramMediaItem[]>([]);
  const [loading, setLoading] = useState(!initialProfile);
  const [followBusy, setFollowBusy] = useState(false);
  const [viewMode, setViewMode] = useState<"gamer" | "clean">("gamer");
  const [lkToken, setLkToken] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [sendingGiftSku, setSendingGiftSku] = useState<string | null>(null);

  const unifiedRoomName = streamId ? unifiedStreamRoomName(streamId) : "";
  const liveKitClientUrl = getLiveKitClientUrl();
  const observerId = userProfile?.id ?? viewerUserId;
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const { isCreatorHub } = useStreamWorkspaceMode({
    channelId: streamId,
    userId: observerId,
  });
  const liveRoomCount = useLiveBroadcastStore((s) => s.viewerCount);
  const chatVariant = isCreatorHub ? "creator" : "viewer";

  const loadProfileData = useCallback(async () => {
    setLoading(true);

    let profileRow: StreamProfileRow | null = initialProfile;
    if (!profileRow) {
      const demo = getDemoPersonaById(streamId);
      if (demo) {
        profileRow = {
          id: demo.id,
          username: demo.username,
          full_name: demo.full_name,
          avatar_url: demo.avatar_url,
          is_live: demo.is_live,
        };
      } else {
        const { data } = await supabase
          .from("profiles")
          .select(PROFILE_SELECT)
          .eq("id", streamId)
          .maybeSingle();
        profileRow = (data as StreamProfileRow | null) ?? null;
      }
    } else {
      const { data } = await supabase
        .from("profiles")
        .select(PROFILE_SELECT)
        .eq("id", streamId)
        .maybeSingle();
      if (data) profileRow = data as StreamProfileRow;
    }

    if (!profileRow) {
      setCreator(null);
      setLoading(false);
      return;
    }

    const mapped = mapProfileRow(profileRow);
    setCreator(mapped);

    const [followers, following, postsRes, followState] = await Promise.all([
      countFollowers(supabase, streamId),
      countFollowing(supabase, streamId),
      supabase
        .from("posts")
        .select("id, media_url, post_type", { count: "exact" })
        .eq("profile_id", streamId)
        .neq("post_type", "story")
        .in("post_type", ["image", "video", "carousel", "gallery"])
        .order("created_at", { ascending: false })
        .limit(24),
      observerId ? isUserFollowing(supabase, observerId, streamId) : Promise.resolve(false),
    ]);

    setFollowerCount(followers);
    setFollowingCount(following);
    setPostCount(postsRes.count ?? postsRes.data?.length ?? 0);
    setIsFollowing(followState);

    const media: InstagramMediaItem[] = (postsRes.data ?? []).map((row) => ({
      id: String(row.id),
      url: (row.media_url as string) ?? "",
      isVideo: row.post_type === "video",
    }));
    setArchiveMedia(media);
    setLoading(false);
  }, [initialProfile, observerId, streamId, supabase]);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    if (!creator?.is_live || !streamId || !unifiedRoomName) return;
    let cancelled = false;

    async function fetchViewerAccess() {
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
        if (!res.ok || !data.token) {
          throw new Error(data.error ?? "Viewer token request failed");
        }
        if (!cancelled) setLkToken(data.token);
      } catch (err) {
        console.error("UnifiedHybridProfile: LiveKit token", err);
        if (!cancelled) {
          setTokenError(err instanceof Error ? err.message : "Could not authorize viewer access");
        }
      }
    }

    void fetchViewerAccess();
    return () => {
      cancelled = true;
    };
  }, [creator?.is_live, observerId, streamId, unifiedRoomName]);

  const toggleFollowRelationship = async () => {
    if (!observerId || !creator) {
      alert("Please log in to follow creators.");
      return;
    }

    setFollowBusy(true);
    const result = await toggleUserFollow(supabase, observerId, creator.id, isFollowing);
    setFollowBusy(false);

    if (!result.ok) {
      console.error("toggleFollowRelationship:", result.error);
      alert(result.error ?? "Could not update follow status.");
      return;
    }

    setIsFollowing((prev) => !prev);
    setFollowerCount((prev) => Math.max(0, prev + (isFollowing ? -1 : 1)));
  };

  const sendVirtualGift = async (sku: string) => {
    if (!observerId) {
      alert("Please log in to purchase gifts.");
      return;
    }

    setSendingGiftSku(sku);
    try {
      const res = await fetch("/api/stream/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: observerId,
          streamerId: creator?.id,
          giftSku: sku,
          streamId: creator?.id,
        }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        data = { error: raw.trim() || `Gift failed (HTTP ${res.status}).` };
      }
      if (!res.ok) alert(data.error || "Transaction declined.");
    } catch (err) {
      console.error("sendVirtualGift:", err);
      alert("Network error while sending gift. Please try again.");
    } finally {
      setSendingGiftSku(null);
    }
  };

  const instagramData: InstagramProfileData | null = useMemo(() => {
    if (!creator) return null;
    return {
      username: creator.username,
      postsCount: postCount,
      followersCount: followerCount,
      followingCount,
      fullName: creator.username,
      bio: creator.bio,
      avatarUrl: creator.avatar_url,
      highlights: [],
      posts: archiveMedia,
      saved: [],
      tagged: [],
    };
  }, [archiveMedia, creator, followerCount, followingCount, postCount]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E11] text-xs italic text-slate-500">
        Syncing unified social profile spaces…
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0B0E11] text-slate-400">
        <p className="text-sm">Creator profile not found.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-bold text-emerald-400 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const showKickLive = creator.is_live && viewMode === "gamer";
  const displayViewerCount =
    isCreatorHub && liveRoomCount > 0 ? liveRoomCount : creator.viewer_count;
  const useDemoTheatrePlayer = Boolean(
    creator.is_live && !lkToken && getDemoPersonaById(streamId),
  );

  const videoSlot = lkToken ? (
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
        streamUrl={demoStreamMp4ForChannel(streamId)}
        mp4FallbackUrl={demoStreamMp4ForChannel(streamId)}
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

  return (
    <div className="flex min-h-screen select-none flex-col bg-[#0B0E11] font-inter text-[#E2E8F0]">
      <header className="flex w-full items-center justify-between border-b border-[#242F37] bg-[#191F24] p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full p-1.5 text-slate-400 hover:bg-[#242F37] hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-black text-emerald-400">PARABLE DUAL-MODE HUB</span>
        </div>
        <button
          type="button"
          onClick={() => setViewMode(viewMode === "clean" ? "gamer" : "clean")}
          className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold text-black transition-all hover:bg-emerald-400"
        >
          {viewMode === "gamer" ? "📺 Clean Social View" : "💥 High-Energy Gamer View"}
        </button>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 overflow-y-auto p-6">
        {showKickLive ? (
          <div className="grid items-start gap-4 lg:grid-cols-4">
            <div className="relative min-w-0 space-y-0 lg:col-span-3">
              <KickLiveWatchPanel
                streamId={creator.id}
                username={creator.username}
                avatarUrl={creator.avatar_url}
                streamTitle={creator.stream_title}
                tags={buildStreamTags(creator)}
                viewerCount={displayViewerCount}
                isFollowing={isFollowing}
                followBusy={followBusy}
                giftBusy={sendingGiftSku !== null}
                onFollow={() => void toggleFollowRelationship()}
                onGiftSubs={() => void sendVirtualGift("gift_applause")}
                onSubscribe={() => alert("Subscriptions coming soon.")}
                loadingVideo={!lkToken && !useDemoTheatrePlayer && !tokenError}
                videoError={tokenError && !useDemoTheatrePlayer ? tokenError : null}
                videoSlot={videoSlot}
              />
              {isCreatorHub ? <CreatorCommandStrip className="!top-14" /> : null}
              <p className="px-4 py-2 text-center text-[10px] text-slate-500">
                {followerCount.toLocaleString()} followers · unified via user_follows
              </p>
            </div>

            <aside className="flex h-[500px] flex-col rounded-2xl border border-[#242F37] bg-[#191F24] p-0 shadow-xl">
              <StreamersHubLiveChat
                streamKey={creator.id}
                streamLabel={creator.username}
                senderDisplayName={userProfile?.username ?? "You"}
                variant={chatVariant}
                fillHeight
                showHeader
              />
            </aside>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-6">
            {instagramData ? (
              <InstagramProfileView
                data={instagramData}
                isFollowing={isFollowing}
                actionLoading={followBusy}
                onFollowToggle={() => void toggleFollowRelationship()}
                mediaHref={(item) => `/post/${item.id}`}
              />
            ) : null}
            {!creator.is_live ? (
              <p className="text-center text-xs text-slate-500">
                Offline — showing archived posts and VOD grid. Go live to unlock Kick mode.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
