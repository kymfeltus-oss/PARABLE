"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Tv,
  UserCheck,
} from "lucide-react";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import {
  DEMO_AVATAR_FALLBACK,
  sanctuaryProfileHref,
  type DemoHomeFeedPost,
} from "@/lib/demo-personas";
import { debugSessionLog } from "@/lib/debug-session-log";
import { useLongPress } from "@/hooks/useLongPress";
import type { BookmarkCollection } from "@/lib/sanctuary-post-interactions";
import SanctuaryIgCaption from "@/components/sanctuary-home/ig/SanctuaryIgCaption";
import SanctuaryIgNeonHeart from "@/components/sanctuary-home/ig/SanctuaryIgNeonHeart";
import SanctuaryIgAudioTag from "@/components/sanctuary-home/ig/SanctuaryIgAudioTag";
import SanctuaryIgPostOptionsMenu, {
  type PostOptionsAction,
} from "@/components/sanctuary-home/ig/SanctuaryIgPostOptionsMenu";
import SanctuaryBookmarkCollectionsMenu from "@/components/sanctuary-home/ig/SanctuaryBookmarkCollectionsMenu";
import { igMediaAspectClass, resolveIgMediaAspect } from "@/components/sanctuary-home/ig/media-aspect";

type Props = {
  post: DemoHomeFeedPost;
  currentUserId?: string;
  likeBusy: boolean;
  heartBurst: boolean;
  hasSaved?: boolean;
  savedCollectionId?: string | null;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
  onBookmarkCollection: (collection: BookmarkCollection) => void;
  onPostOption: (action: PostOptionsAction) => void;
  onMediaTap: () => void;
  onVideoTap: () => void;
};

function mediaFallback(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEMO_AVATAR_FALLBACK;
}

export default function SanctuaryIgPostCard({
  post,
  currentUserId,
  likeBusy,
  heartBurst,
  hasSaved = false,
  savedCollectionId = null,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onBookmarkCollection,
  onPostOption,
  onMediaTap,
  onVideoTap,
}: Props) {
  const aspect = resolveIgMediaAspect(post);
  const aspectClass = igMediaAspectClass(aspect);
  const isVideo = post.post_type === "video";
  const profileHref = sanctuaryProfileHref(post.userId, post.username, currentUserId);
  const optionsAnchorRef = useRef<HTMLButtonElement>(null);
  const bookmarkAnchorRef = useRef<HTMLButtonElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [bookmarkAnchorRect, setBookmarkAnchorRect] = useState<DOMRect | null>(null);

  const bookmarkLongPress = useLongPress(
    () => {
      const rect = bookmarkAnchorRef.current?.getBoundingClientRect() ?? null;
      setBookmarkAnchorRect(rect);
      setCollectionsOpen(true);
    },
    onBookmark,
    { delayMs: 500 },
  );

  const logProfileNav = () => {
    // #region agent log
    debugSessionLog(
      "SanctuaryIgPostCard:profile-nav",
      "profile link clicked",
      {
        href: profileHref,
        postUserId: post.userId,
        isOwnPost: Boolean(currentUserId && post.userId === currentUserId),
        runId: "post-fix",
      },
      "H-profile",
    );
    // #endregion
  };

  return (
    <article id={`post-${post.id}`} className="border-b border-[#06111E]/90 bg-[#01040A] scroll-mt-[56px]">
      <header className="relative flex h-[60px] items-center gap-2.5 px-3">
        <Link href={profileHref} onClick={logProfileNav} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.avatar_url}
            alt=""
            className="h-8 w-8 rounded-full object-cover ring-1 ring-[#06111E]"
            onError={fallbackAvatarOnError}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            onClick={logProfileNav}
            className="flex items-center gap-1 truncate text-[13px] font-semibold text-[#F8FAFC] hover:text-[#00F2FE]"
          >
            {post.username}
            {post.is_verified ? (
              <UserCheck className="h-3.5 w-3.5 shrink-0 text-[#00F2FE]" aria-label="Verified" />
            ) : null}
          </Link>
        </div>
        <button
          ref={optionsAnchorRef}
          type="button"
          onClick={() => setOptionsOpen((open) => !open)}
          className="p-1 text-[#94A3B8] hover:text-[#F8FAFC]"
          aria-label="More options"
          aria-expanded={optionsOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
        <SanctuaryIgPostOptionsMenu
          open={optionsOpen}
          anchorRef={optionsAnchorRef}
          username={post.username}
          isOwnPost={Boolean(currentUserId && post.userId === currentUserId)}
          onAction={onPostOption}
          onClose={() => setOptionsOpen(false)}
        />
      </header>

      <div className={`relative w-full bg-[#06111E] ${aspectClass}`}>
        {isVideo ? (
          <button
            type="button"
            onClick={onVideoTap}
            className="relative flex h-full w-full items-center justify-center"
            aria-label="Double tap to like, single tap to play"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.media_url}
              alt=""
              className="h-full w-full object-cover"
              onError={mediaFallback}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="rounded-full border border-[#00F2FE]/40 bg-[#01040A]/75 p-3.5">
                <Tv className="h-7 w-7 text-[#00F2FE]" />
              </div>
            </div>
            <SanctuaryIgNeonHeart show={heartBurst} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onMediaTap}
            className="relative block h-full w-full"
            aria-label="Double tap to like"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.media_url}
              alt=""
              className="h-full w-full object-cover"
              onError={mediaFallback}
            />
            <SanctuaryIgNeonHeart show={heartBurst} />
          </button>
        )}
      </div>

      <div className="flex h-[50px] items-center gap-4 px-3">
        <button
          type="button"
          onClick={onLike}
          disabled={likeBusy}
          className="disabled:opacity-50"
          aria-pressed={post.has_liked}
          aria-label="Like"
        >
          <Heart
            className={`h-[26px] w-[26px] transition ${
              post.has_liked ? "fill-[#EF4444] text-[#EF4444]" : "text-[#F8FAFC] hover:text-[#94A3B8]"
            }`}
          />
        </button>
        <button type="button" onClick={onComment} className="text-[#F8FAFC] hover:text-[#94A3B8]" aria-label="Comment">
          <MessageCircle className="h-[26px] w-[26px]" />
        </button>
        <button type="button" onClick={onShare} className="text-[#F8FAFC] hover:text-[#94A3B8]" aria-label="Share">
          <Share2 className="h-[26px] w-[26px]" />
        </button>
        <button
          ref={bookmarkAnchorRef}
          type="button"
          className="relative ml-auto text-[#F8FAFC] hover:text-[#94A3B8]"
          aria-pressed={hasSaved}
          aria-label="Save"
          {...bookmarkLongPress}
        >
          <Bookmark
            className={`h-[26px] w-[26px] transition ${
              hasSaved ? "fill-[#00F2FE] text-[#00F2FE]" : "text-[#F8FAFC]"
            }`}
          />
        </button>
        <SanctuaryBookmarkCollectionsMenu
          open={collectionsOpen}
          anchorRect={bookmarkAnchorRect}
          activeCollectionId={savedCollectionId}
          onSelect={onBookmarkCollection}
          onClose={() => setCollectionsOpen(false)}
        />
      </div>

      <p className="px-3 pb-1 text-[13px] font-semibold text-[#F8FAFC]">
        {post.likes.toLocaleString()} likes
      </p>
      <SanctuaryIgCaption username={post.username} profileHref={profileHref} caption={post.caption} />
      {post.audio ? <SanctuaryIgAudioTag audio={post.audio} /> : null}
      {likeBusy ? (
        <div className="flex items-center gap-2 px-3 pb-2 text-[11px] text-[#64748B]">
          <Loader2 className="h-3 w-3 animate-spin" />
          Syncing…
        </div>
      ) : null}
    </article>
  );
}
