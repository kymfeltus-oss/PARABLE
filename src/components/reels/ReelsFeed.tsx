"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Music2,
  Plus,
  Send,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { REEL_VISIBILITY_THRESHOLD } from "@/lib/reels/constants";
import type { ReelFeedItem } from "@/lib/reels/types";
import { useReelsAudio } from "@/providers/ReelsAudioProvider";
import SanctuaryCommentSheet from "@/components/sanctuary-home/SanctuaryCommentSheet";
import SanctuaryShareSheet from "@/components/sanctuary-home/SanctuaryShareSheet";
import { getSanctuaryShareFollowers } from "@/lib/sanctuary-home-interactions";

type Props = {
  reels: ReelFeedItem[];
  currentUserId?: string | null;
  currentUserAvatar: string | null;
  currentUsername: string;
  onLike?: (reelId: string, nextLikes: number) => void;
  onViewLeave?: (reelId: string, watchRatio: number) => void;
  onReelDeleted?: (reelId: string) => void;
};

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${Math.round(value / 1000)}K`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function ReelCaption({ caption }: { caption: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = caption.length > 96;

  if (!caption) return null;

  return (
    <p className="mt-1 text-sm leading-snug text-white/95 drop-shadow-md">
      <span className={expanded ? "" : "line-clamp-2"}>{caption}</span>
      {long && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="ml-1 font-semibold text-white/70 hover:text-white"
        >
          …more
        </button>
      ) : null}
    </p>
  );
}

function ReelSlide({
  reel,
  scrollRoot,
  isGloballyActive,
  likeCount,
  liked,
  onLike,
  onActivate,
  onDeactivate,
  onOpenComments,
  onOpenShare,
  canDelete,
  onDelete,
}: {
  reel: ReelFeedItem;
  scrollRoot: HTMLDivElement | null;
  isGloballyActive: boolean;
  likeCount: number;
  liked: boolean;
  onLike: () => void;
  onActivate: () => void;
  onDeactivate: (watchRatio: number) => void;
  onOpenComments: () => void;
  onOpenShare: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasActiveRef = useRef(false);
  const { muted, toggleMuted, flashMuteIndicator } = useReelsAudio();
  const [following, setFollowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { ref, inView, entry } = useInView({
    root: scrollRoot,
    threshold: REEL_VISIBILITY_THRESHOLD,
  });

  const visibilityRatio = entry?.intersectionRatio ?? 0;
  const shouldPlay = inView && visibilityRatio >= REEL_VISIBILITY_THRESHOLD;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;

    if (shouldPlay) {
      onActivate();
      wasActiveRef.current = true;
      void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      if (wasActiveRef.current) {
        onDeactivate(visibilityRatio);
        wasActiveRef.current = false;
      }
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
      setIsPlaying(false);
    }
  }, [shouldPlay, muted, onActivate, onDeactivate, visibilityRatio]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <article
      ref={ref}
      data-reel-slide
      data-reel-id={reel.id}
      className="relative flex h-full w-full shrink-0 snap-start snap-always items-center justify-center bg-black"
    >
      <div className="absolute inset-0 overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.thumbnailUrl}
          className="h-full w-full object-cover"
          loop
          playsInline
          muted={muted}
          preload="metadata"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />

      {canDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="pointer-events-auto absolute left-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-red-600/80"
          aria-label="Delete reel"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}

      <button
        type="button"
        aria-label={muted ? "Unmute reel" : "Mute reel"}
        onClick={() => {
          if (isGloballyActive) toggleMuted();
        }}
        className="absolute inset-0 z-10"
      />

      {flashMuteIndicator && isGloballyActive ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 backdrop-blur-md">
          {muted ? <VolumeX className="h-8 w-8 text-white" /> : <Volume2 className="h-8 w-8 text-white" />}
        </div>
      ) : null}

      <div className="pointer-events-auto absolute bottom-20 right-4 z-20 flex flex-col items-center gap-6 text-white">
        <div className="relative">
          <Link href={`/profile/${reel.author.username}`} className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reel.author.avatarUrl ?? "/demo/avatars/default.svg"}
              alt=""
              className="h-11 w-11 rounded-full border-2 border-white object-cover"
              onError={fallbackAvatarOnError}
            />
          </Link>
          {!following ? (
            <button
              type="button"
              aria-label={`Follow @${reel.author.username}`}
              onClick={() => setFollowing(true)}
              className="absolute -bottom-1 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-[#00F2FE] text-[#01040A] shadow-lg"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            </button>
          ) : null}
        </div>

        <button type="button" onClick={onLike} className="flex flex-col items-center gap-1">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition active:scale-90">
            <Heart
              className={`h-6 w-6 ${liked ? "text-[#EF4444]" : "text-white"}`}
              fill={liked ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </span>
          <span className="text-[10px] font-bold tabular-nums">{formatCount(likeCount)}</span>
        </button>

        <button type="button" onClick={onOpenComments} className="flex flex-col items-center gap-1">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition active:scale-90">
            <MessageCircle className="h-6 w-6" strokeWidth={2} />
          </span>
          <span className="text-[10px] font-bold tabular-nums">{formatCount(reel.commentsCount)}</span>
        </button>

        <button type="button" onClick={onOpenShare} className="flex flex-col items-center gap-1">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition active:scale-90">
            <Send className="h-6 w-6 -rotate-12" strokeWidth={2} />
          </span>
          <span className="text-[10px] font-bold">Share</span>
        </button>

        <div
          className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 ${
            isPlaying && isGloballyActive ? "animate-[spin_4s_linear_infinite]" : ""
          }`}
          aria-hidden
        >
          <Music2 className="h-4 w-4 text-[#00F2FE]" />
          <span className="absolute inset-1 rounded-full border border-white/10" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-4 right-16 z-20 text-white">
        <p className="text-sm font-bold drop-shadow-md">@{reel.author.username}</p>
        <ReelCaption caption={reel.caption} />
        <div className="mt-2 overflow-hidden whitespace-nowrap">
          <p className="inline-block animate-marquee text-xs font-semibold text-white/85">
            ♫ {reel.audioTitle} · {reel.author.fullName}
          </p>
        </div>
      </div>
    </article>
  );
}

/** Vertical snap reels feed with intersection-observer playback. */
export default function ReelsFeed({
  reels,
  currentUserId,
  currentUserAvatar,
  currentUsername,
  onLike,
  onViewLeave,
  onReelDeleted,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const [activeReelId, setActiveReelId] = useState<string | null>(reels[0]?.id ?? null);
  const [likeState, setLikeState] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [commentReelId, setCommentReelId] = useState<string | null>(null);
  const [shareReelId, setShareReelId] = useState<string | null>(null);
  const [pendingDeleteReelId, setPendingDeleteReelId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const shareFollowers = getSanctuaryShareFollowers();

  useEffect(() => {
    setScrollRoot(scrollRef.current);
  }, []);

  useEffect(() => {
    setLikeState((prev) => {
      const next = { ...prev };
      for (const reel of reels) {
        if (!next[reel.id]) {
          next[reel.id] = { count: reel.likesCount, liked: false };
        }
      }
      return next;
    });
  }, [reels]);

  const handleLike = useCallback(
    (reelId: string) => {
      setLikeState((prev) => {
        const current = prev[reelId] ?? { count: 0, liked: false };
        if (current.liked) return prev;
        const nextCount = current.count + 1;
        onLike?.(reelId, nextCount);
        return { ...prev, [reelId]: { count: nextCount, liked: true } };
      });
    },
    [onLike],
  );

  const handleActivate = useCallback((reelId: string) => {
    setActiveReelId(reelId);
  }, []);

  const handleDeactivate = useCallback(
    (reelId: string, watchRatio: number) => {
      onViewLeave?.(reelId, watchRatio);
    },
    [onViewLeave],
  );

  const confirmDeleteReel = useCallback(async () => {
    const reelId = pendingDeleteReelId;
    if (!reelId || deleteLoading || reelId.startsWith("demo-reel-")) return;

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/reels/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reelId }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Failed to delete reel.");
      setPendingDeleteReelId(null);
      onReelDeleted?.(reelId);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not delete reel.");
    } finally {
      setDeleteLoading(false);
    }
  }, [pendingDeleteReelId, deleteLoading, onReelDeleted]);

  if (reels.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-black px-6 text-center text-white">
        <p className="text-lg font-semibold">No reels yet</p>
        <p className="mt-2 text-sm text-white/60">Create a vertical video to kick off the feed.</p>
        <Link
          href="/create/reel"
          className="mt-6 rounded-full bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#01040A]"
        >
          Create reel
        </Link>
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="h-[calc(100vh-64px)] w-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Reels feed"
      >
        {reels.map((reel) => {
          const likes = likeState[reel.id] ?? { count: reel.likesCount, liked: false };
          return (
            <div key={reel.id} className="h-[calc(100vh-64px)] w-full">
              <ReelSlide
                reel={reel}
                scrollRoot={scrollRoot}
                isGloballyActive={activeReelId === reel.id}
                likeCount={likes.count}
                liked={likes.liked}
                onLike={() => handleLike(reel.id)}
                onActivate={() => handleActivate(reel.id)}
                onDeactivate={(ratio) => handleDeactivate(reel.id, ratio)}
                onOpenComments={() => setCommentReelId(reel.id)}
                onOpenShare={() => setShareReelId(reel.id)}
                canDelete={Boolean(currentUserId && reel.userId === currentUserId && !reel.id.startsWith("demo-reel-"))}
                onDelete={() => setPendingDeleteReelId(reel.id)}
              />
            </div>
          );
        })}
      </div>

      <SanctuaryCommentSheet
        open={Boolean(commentReelId)}
        postId={commentReelId}
        currentUsername={currentUsername}
        currentUserAvatar={currentUserAvatar}
        onClose={() => setCommentReelId(null)}
      />

      <SanctuaryShareSheet
        open={Boolean(shareReelId)}
        postId={shareReelId}
        followers={shareFollowers}
        onClose={() => setShareReelId(null)}
      />

      <ConfirmDeleteDialog
        open={Boolean(pendingDeleteReelId)}
        title="Delete reel?"
        description="This permanently removes the reel from the feed."
        loading={deleteLoading}
        onCancel={() => setPendingDeleteReelId(null)}
        onConfirm={() => void confirmDeleteReel()}
      />
    </>
  );
}
