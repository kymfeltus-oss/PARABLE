"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFeed } from "@/hooks/useFeed";
import { useProfileLayoutData } from "@/hooks/useProfileLayoutData";
import { useProfilePostsLive } from "@/hooks/useProfilePostsLive";
import { useSanctuaryStories } from "@/hooks/useSanctuaryStories";
import SanctuaryCreationMenuSheet from "@/components/sanctuary-home/SanctuaryCreationMenuSheet";
import SanctuaryHomeFeed from "@/components/SanctuaryHomeFeed";
import { createFlowHref } from "@/lib/create-flow/routes";
import { buildMergedHomeFeed, getSanctuaryHomeMode } from "@/lib/sanctuary-home-mode";
import { SANCTUARY_STORY_FROM_POST_EVENT } from "@/lib/sanctuary-post-interactions";
import { useCreationMenuEngine } from "@/hooks/useCreationMenuEngine";
import { getProfileLayout, type SanctuaryLayoutData } from "./actions";
import { fetchSanctuaryEventRegistrations, loadMoreSanctuaryHomePosts } from "./event-actions";
import type { SanctuaryHomeServerPayload } from "./home-data";
import { createClient } from "@/utils/supabase/client";
import type { DemoHomeFeedPost } from "@/lib/demo-personas";

type Props = {
  initialData: SanctuaryLayoutData;
  currentUserId: string;
  initialRegisteredEventIds?: string[];
  initialHomePayload?: SanctuaryHomeServerPayload;
};

function resolveAvatarSrc(
  profileUrl: string | null | undefined,
  authUrl: string | undefined,
): string | null {
  if (authUrl && authUrl !== "/logo.svg" && !authUrl.includes("logo.svg")) return authUrl;
  const raw = profileUrl?.trim();
  if (!raw || raw === "/logo.svg" || raw.includes("logo.svg")) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:") || raw.startsWith("/")) {
    return raw;
  }
  const { data } = createClient().storage.from("avatars").getPublicUrl(raw);
  return data.publicUrl || null;
}

/**
 * Sanctuary home shell — merges live Supabase feed/stories with demo personas in hybrid mode.
 */
export default function MySanctuaryHomeClientView({
  initialData,
  currentUserId,
  initialRegisteredEventIds = [],
  initialHomePayload = { posts: [], liveStreams: [], events: [], postsNextCursor: null },
}: Props) {
  const { refreshProfile, avatarUrl } = useAuth();
  const { layoutData, setLayoutData } = useProfileLayoutData({ initialData });
  const mode = getSanctuaryHomeMode();
  const { posts: livePosts, refresh: refreshFeed } = useFeed(currentUserId);
  const {
    groups: liveStoryGroups,
    refresh: refreshStories,
    uploadStory,
    markViewed,
    uploading: storyUploading,
    uploadError: storyUploadError,
  } = useSanctuaryStories();

  const [registeredEventIds, setRegisteredEventIds] = useState(initialRegisteredEventIds);
  const [extraServerPosts, setExtraServerPosts] = useState<DemoHomeFeedPost[]>([]);
  const [postsCursor, setPostsCursor] = useState<string | null>(
    initialHomePayload.postsNextCursor ?? null,
  );
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);

  const {
    creationMenuOpen,
    openCreationMenu,
    closeCreationMenu,
    selectCreationAction,
    launchCreationAction,
  } = useCreationMenuEngine();

  const serverPosts = useMemo(() => {
    const seen = new Set(initialHomePayload.posts.map((p) => p.id));
    const appended = extraServerPosts.filter((p) => !seen.has(p.id));
    return [...initialHomePayload.posts, ...appended];
  }, [initialHomePayload.posts, extraServerPosts]);

  const merged = useMemo(
    () =>
      buildMergedHomeFeed({
        mode,
        livePosts,
        liveStoryGroups,
        serverPosts,
        serverLiveStreams: initialHomePayload.liveStreams,
        serverEvents: initialHomePayload.events,
      }),
    [mode, livePosts, liveStoryGroups, serverPosts, initialHomePayload.liveStreams, initialHomePayload.events],
  );

  const loadMorePosts = useCallback(async () => {
    if (!postsCursor || loadingMorePosts) return;
    setLoadingMorePosts(true);
    try {
      const page = await loadMoreSanctuaryHomePosts(postsCursor);
      setExtraServerPosts((prev) => {
        const seen = new Set([
          ...initialHomePayload.posts.map((p) => p.id),
          ...prev.map((p) => p.id),
        ]);
        return [...prev, ...page.posts.filter((p) => !seen.has(p.id))];
      });
      setPostsCursor(page.nextCursor);
    } finally {
      setLoadingMorePosts(false);
    }
  }, [postsCursor, loadingMorePosts, initialHomePayload.posts]);

  const reloadLayout = useCallback(async () => {
    const fresh = await getProfileLayout(currentUserId, currentUserId);
    setLayoutData(fresh);
    refreshProfile();
    void refreshFeed();
    void refreshStories();
    const regs = await fetchSanctuaryEventRegistrations(currentUserId);
    setRegisteredEventIds(regs);
  }, [currentUserId, setLayoutData, refreshProfile, refreshFeed, refreshStories]);

  useEffect(() => {
    const onPosted = () => {
      void reloadLayout();
    };
    const onStoryPublished = () => {
      void reloadLayout();
    };
    window.addEventListener("parable:sanctuary-posted", onPosted);
    window.addEventListener("parable:story-published", onStoryPublished);
    return () => {
      window.removeEventListener("parable:sanctuary-posted", onPosted);
      window.removeEventListener("parable:story-published", onStoryPublished);
    };
  }, [reloadLayout]);

  useProfilePostsLive(currentUserId, reloadLayout);

  const handleEventRegistered = useCallback((eventId: string) => {
    setRegisteredEventIds((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]));
  }, []);

  useEffect(() => {
    const onStoryFromPost = (event: Event) => {
      const postId = (event as CustomEvent<{ postId: string }>).detail?.postId;
      if (!postId) return;
      launchCreationAction("story", createFlowHref("story", { prefill: postId }));
    };
    window.addEventListener(SANCTUARY_STORY_FROM_POST_EVENT, onStoryFromPost);
    return () => window.removeEventListener(SANCTUARY_STORY_FROM_POST_EVENT, onStoryFromPost);
  }, [launchCreationAction]);

  if (!layoutData.profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#01040A] px-6 text-center text-sm text-[#94A3B8]">
        Profile data setup pending…
      </div>
    );
  }

  const profile = layoutData.profile;
  const displayAvatar = resolveAvatarSrc(profile.avatar_url, avatarUrl);
  const displayUsername = profile.username?.trim() || profile.full_name?.trim() || "You";

  return (
    <>
      <SanctuaryHomeFeed
        currentUserId={currentUserId}
        currentUserAvatar={displayAvatar}
        currentUsername={displayUsername}
        trayItems={merged.trayItems}
        storyGroups={merged.storyGroups}
        feedPosts={merged.feedPosts}
        upcomingEvents={merged.upcomingEvents}
        registeredEventIds={registeredEventIds}
        onStoryUpload={uploadStory}
        onMarkStoryViewed={markViewed}
        onStoryDeleted={() => void refreshStories()}
        storyUploading={storyUploading}
        storyUploadError={storyUploadError}
        onEventRegistered={handleEventRegistered}
        onLoadMorePosts={postsCursor ? () => void loadMorePosts() : undefined}
        hasMorePosts={Boolean(postsCursor)}
        loadingMorePosts={loadingMorePosts}
        onRefresh={reloadLayout}
        onCreateClick={openCreationMenu}
      />

      <SanctuaryCreationMenuSheet
        open={creationMenuOpen}
        onClose={closeCreationMenu}
        onSelect={selectCreationAction}
      />
    </>
  );
}
