"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import TopNavbar from "@/components/TopNavbar";
import SanctuaryCommentSheet from "@/components/sanctuary-home/SanctuaryCommentSheet";
import SanctuaryShareSheet from "@/components/sanctuary-home/SanctuaryShareSheet";
import SanctuaryHomeStoriesStrip from "@/components/SanctuaryHomeStoriesStrip";
import SanctuaryIgHorizontalPager from "@/components/sanctuary-home/ig/SanctuaryIgHorizontalPager";
import SanctuaryIgPostCard from "@/components/sanctuary-home/ig/SanctuaryIgPostCard";
import SanctuaryIgPullRefresh from "@/components/sanctuary-home/ig/SanctuaryIgPullRefresh";
import type { CommentRow } from "@/components/feed/CommentSection";
import { useSanctuaryActivityOptional } from "@/providers/SanctuaryActivityProvider";
import { useMessagesOptional } from "@/providers/MessagesProvider";
import {
  SANCTUARY_ACTIVITY_NAV_KEY,
  type ActivityActor,
  type ActivityNavIntent,
} from "@/lib/sanctuary-activity/types";
import {
  isDemoHomePostId,
  type DemoHomeEvent,
  type DemoHomeFeedPost,
  type DemoHomeTrayItem,
} from "@/lib/demo-personas";
import type { StoryUserGroup } from "@/lib/sanctuary-stories/types";
import { toggleBookmark } from "@/lib/feed";
import { deletePost } from "@/lib/content-delete";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import { sendPostToFollowers } from "@/lib/messages/api";
import { getSanctuaryShareFollowers } from "@/lib/sanctuary-home-interactions";
import {
  copyPostLink,
  dispatchSanctuaryStoryFromPost,
  type BookmarkCollection,
} from "@/lib/sanctuary-post-interactions";
import type { PostOptionsAction } from "@/components/sanctuary-home/ig/SanctuaryIgPostOptionsMenu";

type Props = {
  currentUserId: string;
  currentUserAvatar: string | null;
  currentUsername: string;
  trayItems: DemoHomeTrayItem[];
  storyGroups: StoryUserGroup[];
  feedPosts: DemoHomeFeedPost[];
  upcomingEvents: DemoHomeEvent[];
  registeredEventIds: string[];
  onStoryUpload: (file: File) => Promise<boolean>;
  onMarkStoryViewed: (storyId: string) => void;
  onStoryDeleted?: (storyId: string) => void;
  storyUploading?: boolean;
  storyUploadError?: string | null;
  onEventRegistered?: (eventId: string) => void;
  onLoadMorePosts?: () => void;
  hasMorePosts?: boolean;
  loadingMorePosts?: boolean;
  onRefresh?: () => void | Promise<void>;
  onCreateClick?: () => void;
};

function filterPostsByFeedLabel(posts: DemoHomeFeedPost[], label: string): DemoHomeFeedPost[] {
  if (label === "For You") return posts;
  if (label === "Favorites") return posts.filter((p) => p.has_liked);
  return posts.filter((p) => p.is_verified || p.likes > 200);
}

export default function SanctuaryHomeFeed({
  currentUserId,
  currentUserAvatar,
  currentUsername,
  trayItems,
  storyGroups,
  feedPosts,
  upcomingEvents: _upcomingEvents,
  registeredEventIds: _registeredEventIds,
  onStoryUpload,
  onMarkStoryViewed,
  onStoryDeleted,
  storyUploading = false,
  storyUploadError = null,
  onEventRegistered: _onEventRegistered,
  onLoadMorePosts,
  hasMorePosts = false,
  loadingMorePosts = false,
  onRefresh,
  onCreateClick,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const activity = useSanctuaryActivityOptional();
  const messagesCtx = useMessagesOptional();
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<{ postId: string; t: number } | null>(null);
  const singleTapTimerRef = useRef<number | null>(null);

  const [activeFeedLabel, setActiveFeedLabel] = useState("For You");
  const [posts, setPosts] = useState(feedPosts);
  const [mutedUserIds, setMutedUserIds] = useState<Set<string>>(new Set());
  const [unfollowedUserIds, setUnfollowedUserIds] = useState<Set<string>>(new Set());
  const [likeBusyId, setLikeBusyId] = useState<string | null>(null);
  const [heartBurstPostId, setHeartBurstPostId] = useState<string | null>(null);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [focusCommentInput, setFocusCommentInput] = useState(false);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [saveBusyId, setSaveBusyId] = useState<string | null>(null);
  const [pendingDeletePostId, setPendingDeletePostId] = useState<string | null>(null);
  const [deletePostLoading, setDeletePostLoading] = useState(false);
  const [simulatedCommentsByPost, setSimulatedCommentsByPost] = useState<Record<string, CommentRow[]>>({});
  const shareFollowers = useMemo(() => getSanctuaryShareFollowers(), []);

  const visiblePosts = useMemo(
    () =>
      filterPostsByFeedLabel(posts, activeFeedLabel).filter(
        (p) => !mutedUserIds.has(p.userId) && !unfollowedUserIds.has(p.userId),
      ),
    [posts, activeFeedLabel, mutedUserIds, unfollowedUserIds],
  );
  const explorePosts = useMemo(() => posts, [posts]);
  const reelPosts = useMemo(() => posts.filter((p) => p.post_type === "video"), [posts]);

  useEffect(() => {
    setPosts(feedPosts);
  }, [feedPosts]);

  useEffect(() => {
    activity?.registerTargetPosts(posts);
  }, [activity, posts]);

  const applySimulatedLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)),
    );
  }, []);

  const applySimulatedComment = useCallback((postId: string, text: string, actor: ActivityActor) => {
    const row: CommentRow = {
      id: `sim-comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      post_id: postId,
      user_id: actor.id,
      content: text,
      created_at: new Date().toISOString(),
      profiles: {
        username: actor.username,
        avatar_url: actor.avatar_url,
        full_name: actor.username,
      },
    };
    setSimulatedCommentsByPost((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), row],
    }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)),
    );
  }, []);

  useEffect(() => {
    if (!activity) return;
    activity.registerMutations({
      applyLike: applySimulatedLike,
      applyComment: applySimulatedComment,
    });
    return () => activity.registerMutations(null);
  }, [activity, applySimulatedLike, applySimulatedComment]);

  const scrollToPost = useCallback((postId: string) => {
    window.setTimeout(() => {
      document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(SANCTUARY_ACTIVITY_NAV_KEY);
    if (!raw) return;

    try {
      const intent = JSON.parse(raw) as ActivityNavIntent;
      sessionStorage.removeItem(SANCTUARY_ACTIVITY_NAV_KEY);
      scrollToPost(intent.postId);
      if (intent.openComments) {
        setCommentPostId(intent.postId);
        setFocusCommentInput(true);
      }
    } catch {
      sessionStorage.removeItem(SANCTUARY_ACTIVITY_NAV_KEY);
    }
  }, [posts, scrollToPost]);

  useEffect(() => {
    const el = loadMoreSentinelRef.current;
    if (!el || !onLoadMorePosts || !hasMorePosts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMorePosts && !loadingMorePosts) {
          onLoadMorePosts();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMorePosts, hasMorePosts, loadingMorePosts]);

  const realPostIds = useMemo(
    () => feedPosts.filter((p) => !isDemoHomePostId(p.id)).map((p) => p.id),
    [feedPosts],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (realPostIds.length === 0) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: likes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", realPostIds);

      if (cancelled) return;
      const likedSet = new Set((likes ?? []).map((l) => l.post_id as string));
      setPosts((prev) =>
        prev.map((p) => (realPostIds.includes(p.id) ? { ...p, has_liked: likedSet.has(p.id) } : p)),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [realPostIds, supabase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (realPostIds.length === 0) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", realPostIds);

      if (cancelled) return;
      const savedSet = new Set((bookmarks ?? []).map((b) => b.post_id as string));
      setPosts((prev) =>
        prev.map((p) =>
          realPostIds.includes(p.id) ? { ...p, has_saved: savedSet.has(p.id) } : p,
        ),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [realPostIds, supabase]);

  const triggerHeartBurst = useCallback((postId: string) => {
    setHeartBurstPostId(postId);
    window.setTimeout(() => setHeartBurstPostId(null), 320);
  }, []);

  const handleLikeToggle = useCallback(
    async (postId: string, options?: { forceLike?: boolean }) => {
      const post = posts.find((p) => p.id === postId);
      if (!post || likeBusyId === postId) return;

      const wasLiked = Boolean(post.has_liked);
      if (options?.forceLike && wasLiked) return;

      const nextLiked = options?.forceLike ? true : !wasLiked;

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            has_liked: nextLiked,
            likes: nextLiked
              ? p.likes + (wasLiked ? 0 : 1)
              : Math.max(0, p.likes - (wasLiked ? 1 : 0)),
          };
        }),
      );

      if (isDemoHomePostId(postId)) return;

      setLikeBusyId(postId);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not signed in");

        if (wasLiked && !options?.forceLike) {
          const { error } = await supabase
            .from("post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", user.id);
          if (error) throw error;
        } else if (!wasLiked) {
          const { error } = await supabase.from("post_likes").insert({
            post_id: postId,
            user_id: user.id,
          });
          if (error) throw error;
        }
      } catch {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              has_liked: wasLiked,
              likes: wasLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
            };
          }),
        );
      } finally {
        setLikeBusyId(null);
      }
    },
    [posts, likeBusyId, supabase],
  );

  const handleMediaTap = useCallback(
    (postId: string, onSingleTap?: () => void) => {
      const now = Date.now();
      const last = lastTapRef.current;
      if (last?.postId === postId && now - last.t < 320) {
        lastTapRef.current = null;
        if (singleTapTimerRef.current !== null) {
          window.clearTimeout(singleTapTimerRef.current);
          singleTapTimerRef.current = null;
        }
        triggerHeartBurst(postId);
        void handleLikeToggle(postId, { forceLike: true });
        return;
      }
      lastTapRef.current = { postId, t: now };
      if (onSingleTap) {
        if (singleTapTimerRef.current !== null) {
          window.clearTimeout(singleTapTimerRef.current);
        }
        singleTapTimerRef.current = window.setTimeout(() => {
          singleTapTimerRef.current = null;
          if (lastTapRef.current?.postId === postId) {
            lastTapRef.current = null;
            onSingleTap();
          }
        }, 320);
      }
    },
    [handleLikeToggle, triggerHeartBurst],
  );

  const handleBookmarkToggle = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post || saveBusyId === postId) return;

      const wasSaved = Boolean(post.has_saved);
      const nextSaved = !wasSaved;

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, has_saved: nextSaved } : p)),
      );

      if (isDemoHomePostId(postId)) return;

      setSaveBusyId(postId);
      try {
        await toggleBookmark(postId);
      } catch {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, has_saved: wasSaved } : p)),
        );
      } finally {
        setSaveBusyId(null);
      }
    },
    [posts, saveBusyId],
  );

  const handleBookmarkCollection = useCallback(
    async (postId: string, collection: BookmarkCollection) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, has_saved: true, saved_collection_id: collection.id }
            : p,
        ),
      );

      if (isDemoHomePostId(postId)) return;

      setSaveBusyId(postId);
      try {
        await toggleBookmark(postId);
      } catch {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, has_saved: Boolean(post.has_saved), saved_collection_id: post.saved_collection_id ?? null }
              : p,
          ),
        );
      } finally {
        setSaveBusyId(null);
      }
    },
    [posts],
  );

  const openCommentSheet = useCallback((postId: string) => {
    setFocusCommentInput(true);
    setCommentPostId(postId);
  }, []);

  const openShareSheet = useCallback((postId: string) => {
    setSharePostId(postId);
  }, []);

  const handlePostOption = useCallback(
    (post: DemoHomeFeedPost, action: PostOptionsAction) => {
      switch (action) {
        case "delete-post":
          setPendingDeletePostId(post.id);
          break;
        case "save-link":
          void copyPostLink(post.id).then((ok) => {
            window.alert(ok ? "Post link copied to clipboard." : "Could not copy link.");
          });
          break;
        case "share":
          openShareSheet(post.id);
          break;
        case "report":
          window.alert("Thanks — this post has been flagged for review.");
          break;
        case "mute":
          setMutedUserIds((prev) => new Set(prev).add(post.userId));
          break;
        case "unfollow":
          setUnfollowedUserIds((prev) => new Set(prev).add(post.userId));
          break;
        default:
          break;
      }
    },
    [openShareSheet],
  );

  const confirmDeletePost = useCallback(async () => {
    const postId = pendingDeletePostId;
    if (!postId || deletePostLoading) return;

    if (isDemoHomePostId(postId)) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setPendingDeletePostId(null);
      if (commentPostId === postId) setCommentPostId(null);
      return;
    }

    setDeletePostLoading(true);
    try {
      await deletePost(supabase, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (commentPostId === postId) setCommentPostId(null);
      setPendingDeletePostId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete post.";
      window.alert(msg);
    } finally {
      setDeletePostLoading(false);
    }
  }, [pendingDeletePostId, deletePostLoading, supabase, commentPostId]);

  const commentPostOwnerId = useMemo(() => {
    if (!commentPostId) return null;
    return posts.find((p) => p.id === commentPostId)?.userId ?? null;
  }, [commentPostId, posts]);

  const openActivity = useCallback(() => {
    router.push("/my-sanctuary/activity");
  }, [router]);

  const injectedCommentsForSheet = useMemo(() => {
    if (!commentPostId) return [];
    return simulatedCommentsByPost[commentPostId] ?? [];
  }, [commentPostId, simulatedCommentsByPost]);

  const homeFeedPanel = (
    <SanctuaryIgPullRefresh onRefresh={onRefresh} className="h-full">
      <SanctuaryHomeStoriesStrip
        currentUserId={currentUserId}
        currentUserAvatar={currentUserAvatar}
        currentUsername={currentUsername}
        trayItems={trayItems}
        storyGroups={storyGroups}
        uploading={storyUploading}
        uploadError={storyUploadError}
        onUploadStory={onStoryUpload}
        onMarkViewed={onMarkStoryViewed}
        onStoryDeleted={onStoryDeleted}
      />

      {activeFeedLabel !== "For You" ? (
        <p className="border-b border-[#06111E]/60 px-4 py-2 text-center text-[11px] text-[#64748B]">
          {activeFeedLabel === "Following"
            ? "Following view — curated from creators you engage with most."
            : "Favorites — posts you have liked in this session."}
        </p>
      ) : null}

      {visiblePosts.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-[#64748B]">
          No posts in this feed view yet.
        </div>
      ) : (
        visiblePosts.map((post) => (
          <SanctuaryIgPostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            likeBusy={likeBusyId === post.id}
            heartBurst={heartBurstPostId === post.id}
            hasSaved={Boolean(post.has_saved)}
            savedCollectionId={post.saved_collection_id ?? null}
            onLike={() => void handleLikeToggle(post.id)}
            onComment={() => openCommentSheet(post.id)}
            onShare={() => openShareSheet(post.id)}
            onBookmark={() => void handleBookmarkToggle(post.id)}
            onBookmarkCollection={(collection) => void handleBookmarkCollection(post.id, collection)}
            onPostOption={(action) => handlePostOption(post, action)}
            onMediaTap={() => handleMediaTap(post.id)}
            onVideoTap={() =>
              handleMediaTap(post.id, () => router.push(`/parables/${post.id}`))
            }
          />
        ))
      )}

      {hasMorePosts && activeFeedLabel === "For You" ? (
        <div ref={loadMoreSentinelRef} className="flex justify-center py-8">
          {loadingMorePosts ? (
            <Loader2 className="h-6 w-6 animate-spin text-[#00F2FE]" aria-label="Loading more posts" />
          ) : (
            <span className="text-[11px] uppercase tracking-wider text-[#64748B]">Scroll for more</span>
          )}
        </div>
      ) : null}
    </SanctuaryIgPullRefresh>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#01040A] pb-2 font-sans text-[#F8FAFC]">
      <TopNavbar
        onCreateClick={onCreateClick}
        onFeedChange={setActiveFeedLabel}
        onActivityClick={openActivity}
        hasUnreadNotifications={(activity?.unreadCount ?? 0) > 0}
        unreadMessagesCount={messagesCtx?.unreadCount ?? 0}
      />

      <div className="mx-auto flex h-full min-h-0 w-full max-w-[630px] flex-1 flex-col px-0 lg:px-2">
        <div className="flex min-h-0 min-w-0 flex-col">
          <SanctuaryIgHorizontalPager
            homePanel={homeFeedPanel}
            explorePosts={explorePosts}
            reelPosts={reelPosts}
          />
        </div>
      </div>

      <SanctuaryCommentSheet
        open={Boolean(commentPostId)}
        postId={commentPostId}
        currentUserId={currentUserId}
        postOwnerId={commentPostOwnerId}
        currentUsername={currentUsername}
        currentUserAvatar={currentUserAvatar}
        injectedComments={injectedCommentsForSheet}
        autoFocusInput={focusCommentInput}
        onClose={() => {
          setCommentPostId(null);
          setFocusCommentInput(false);
        }}
        onCommentDeleted={() => {
          if (!commentPostId) return;
          setPosts((prev) =>
            prev.map((p) =>
              p.id === commentPostId ? { ...p, comments: Math.max(0, p.comments - 1) } : p,
            ),
          );
        }}
      />

      <ConfirmDeleteDialog
        open={Boolean(pendingDeletePostId)}
        title="Delete post?"
        description="This permanently removes the post, its praises, and comments. This cannot be undone."
        loading={deletePostLoading}
        onCancel={() => setPendingDeletePostId(null)}
        onConfirm={() => void confirmDeletePost()}
      />

      <SanctuaryShareSheet
        open={Boolean(sharePostId)}
        postId={sharePostId}
        followers={shareFollowers}
        onClose={() => setSharePostId(null)}
        onAddToStory={(postId) => {
          dispatchSanctuaryStoryFromPost(postId);
        }}
        onSend={async (followerIds) => {
          if (!sharePostId) return;
          try {
            await sendPostToFollowers(supabase, currentUserId, followerIds, sharePostId);
            void messagesCtx?.refreshInbox();
          } catch {
            window.alert("Could not share post — ensure DM schema is applied.");
          }
        }}
      />
    </div>
  );
}
