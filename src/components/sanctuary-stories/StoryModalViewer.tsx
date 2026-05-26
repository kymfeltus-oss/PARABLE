"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { deleteStory } from "@/lib/content-delete";
import type { StoryUserGroup } from "@/lib/sanctuary-stories/types";
import { STORY_IMAGE_DURATION_MS } from "@/lib/sanctuary-stories/constants";
import { formatTimeAgo } from "@/lib/sanctuary-stories/format-time-ago";

type StoryModalViewerProps = {
  groups: StoryUserGroup[];
  startGroupIndex: number;
  currentUserId?: string | null;
  onClose: () => void;
  onMarkViewed: (storyId: string) => void;
  onStoryDeleted?: (storyId: string) => void;
};

const HOLD_PAUSE_MS = 180;
const SWIPE_CLOSE_PX = 110;
const TAP_MAX_MS = 280;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? "S").toUpperCase();
}

export default function StoryModalViewer({
  groups,
  startGroupIndex,
  currentUserId,
  onClose,
  onMarkViewed,
  onStoryDeleted,
}: StoryModalViewerProps) {
  const supabase = createClient();
  const [groupIndex, setGroupIndex] = useState(startGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [heartBurst, setHeartBurst] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [dragY, setDragY] = useState(0);
  const [deletingStory, setDeletingStory] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const elapsedOffsetRef = useRef(0);
  const durationRef = useRef<number>(STORY_IMAGE_DURATION_MS);
  const holdTimerRef = useRef<number | null>(null);
  const holdPausedRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const swipeActiveRef = useRef(false);

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  const clearTimer = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const pausePlayback = useCallback(() => {
    setPaused(true);
    clearTimer();
    const video = videoRef.current;
    if (video && story?.mediaType === "video" && !video.paused) {
      video.pause();
      return;
    }
    if (story?.mediaType === "image") {
      elapsedOffsetRef.current += performance.now() - startedAtRef.current;
    }
  }, [clearTimer, story?.mediaType]);

  const resumePlayback = useCallback(() => {
    setPaused(false);
    holdPausedRef.current = false;
    swipeActiveRef.current = false;
    const video = videoRef.current;
    if (story?.mediaType === "video" && video) {
      void video.play().catch(() => undefined);
    }
  }, [story?.mediaType]);

  const goNext = useCallback(() => {
    if (!group) return;
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
      setProgress(0);
      elapsedOffsetRef.current = 0;
      return;
    }
    if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
      setProgress(0);
      elapsedOffsetRef.current = 0;
      return;
    }
    onClose();
  }, [group, storyIndex, groupIndex, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setProgress(0);
      elapsedOffsetRef.current = 0;
      return;
    }
    if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((i) => i - 1);
      setStoryIndex(Math.max(0, (prevGroup?.stories.length ?? 1) - 1));
      setProgress(0);
      elapsedOffsetRef.current = 0;
    }
  }, [storyIndex, groupIndex, groups]);

  const startImageTimer = useCallback(() => {
    clearTimer();
    durationRef.current = STORY_IMAGE_DURATION_MS;
    startedAtRef.current = performance.now();
    const tick = (now: number) => {
      if (paused || holdPausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - startedAtRef.current + elapsedOffsetRef.current;
      const pct = Math.min(1, elapsed / durationRef.current);
      setProgress(pct);
      if (pct >= 1) {
        goNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [clearTimer, goNext, paused]);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("button, input, textarea")) return;
      pointerStartRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      swipeActiveRef.current = false;
      clearHoldTimer();
      holdTimerRef.current = window.setTimeout(() => {
        holdPausedRef.current = true;
        pausePlayback();
      }, HOLD_PAUSE_MS);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [clearHoldTimer, pausePlayback],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const start = pointerStartRef.current;
      if (!start) return;
      const dy = e.clientY - start.y;
      if (dy > 12) {
        swipeActiveRef.current = true;
        clearHoldTimer();
        if (!holdPausedRef.current) {
          holdPausedRef.current = true;
          pausePlayback();
        }
        setDragY(Math.min(dy, 220));
      }
    },
    [clearHoldTimer, pausePlayback],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      clearHoldTimer();
      const start = pointerStartRef.current;
      pointerStartRef.current = null;

      if (swipeActiveRef.current && dragY >= SWIPE_CLOSE_PX) {
        onClose();
        return;
      }

      if (holdPausedRef.current) {
        setDragY(0);
        resumePlayback();
        if (story?.mediaType === "image") {
          startedAtRef.current = performance.now();
        }
        return;
      }

      if (!start) return;
      const dt = Date.now() - start.t;
      const dy = Math.abs(e.clientY - start.y);
      if (dt <= TAP_MAX_MS && dy < 24) {
        const rect = e.currentTarget.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width;
        if (xPct < 0.3) goPrev();
        else goNext();
      }
      setDragY(0);
    },
    [clearHoldTimer, dragY, goNext, goPrev, onClose, resumePlayback, story?.mediaType],
  );

  useEffect(() => {
    setGroupIndex(startGroupIndex);
    setStoryIndex(0);
    setProgress(0);
    elapsedOffsetRef.current = 0;
    setDragY(0);
    setMuted(true);
  }, [startGroupIndex]);

  useEffect(() => {
    if (!story) return;
    onMarkViewed(story.id);
  }, [story?.id, onMarkViewed]);

  useEffect(() => {
    if (!story || paused) return;
    clearTimer();
    setProgress(0);
    elapsedOffsetRef.current = 0;

    if (story.mediaType === "video") {
      const video = videoRef.current;
      if (!video) return;

      const onMeta = () => {
        durationRef.current =
          Number.isFinite(video.duration) && video.duration > 0
            ? video.duration * 1000
            : STORY_IMAGE_DURATION_MS * 3;
        video.muted = muted;
        void video.play().catch(() => undefined);
      };

      const onTime = () => {
        if (paused || holdPausedRef.current) return;
        if (!video.duration) return;
        setProgress(Math.min(1, video.currentTime / video.duration));
      };

      const onEnded = () => goNext();

      video.addEventListener("loadedmetadata", onMeta);
      video.addEventListener("timeupdate", onTime);
      video.addEventListener("ended", onEnded);
      if (video.readyState >= 1) onMeta();

      return () => {
        video.removeEventListener("loadedmetadata", onMeta);
        video.removeEventListener("timeupdate", onTime);
        video.removeEventListener("ended", onEnded);
        video.pause();
        clearTimer();
      };
    }

    startImageTimer();
    return clearTimer;
  }, [story, clearTimer, goNext, startImageTimer, paused, muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted, story?.id]);

  useEffect(() => {
    if (!paused && story?.mediaType === "image") {
      startImageTimer();
    }
    return clearTimer;
  }, [paused, story?.mediaType, startImageTimer, clearTimer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") {
        e.preventDefault();
        if (paused) resumePlayback();
        else pausePlayback();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goNext, goPrev, pausePlayback, resumePlayback, paused]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      clearHoldTimer();
    };
  }, [clearHoldTimer]);

  if (!group || !story) return null;

  const handleHeart = () => {
    setHeartBurst(true);
    window.setTimeout(() => setHeartBurst(false), 900);
  };

  const handleDeleteStory = async () => {
    if (!story || deletingStory) return;
    if (!window.confirm("Delete this story permanently?")) return;

    setDeletingStory(true);
    try {
      await deleteStory(supabase, story.id);
      onStoryDeleted?.(story.id);
      onClose();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not delete story.");
    } finally {
      setDeletingStory(false);
    }
  };

  const isOwnStory = Boolean(currentUserId && group?.userId === currentUserId);
  const dismissOpacity = Math.max(0.35, 1 - dragY / 280);

  return (
    <div
      className="sanctuary-stories sanctuary-story-modal fixed inset-0 z-[100] flex flex-col"
      style={{ backgroundColor: `rgba(1, 4, 10, ${dismissOpacity})` }}
    >
      <div
        className="relative mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col transition-transform duration-150 ease-out"
        style={{ transform: dragY > 0 ? `translateY(${dragY}px) scale(${1 - dragY / 1200})` : undefined }}
      >
        {/* Progress bars */}
        <div className="absolute inset-x-0 top-0 z-30 flex gap-1 px-3 pt-3 sm:px-4">
          {group.stories.map((s, i) => (
            <div key={s.id} className="sanctuary-story-progress-track flex-1">
              <div
                className="sanctuary-story-progress-fill"
                style={{
                  width: i < storyIndex ? "100%" : i === storyIndex ? `${progress * 100}%` : "0%",
                  transition: paused ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-3 pb-2 pt-8 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#06111E] ring-1 ring-[#0EA5E9]/40">
              {group.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={group.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[#94A3B8]">
                  {initialsFromName(group.username)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#F8FAFC]">{group.username}</p>
              <p className="text-[11px] text-[#94A3B8]">{formatTimeAgo(story.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isOwnStory ? (
              <button
                type="button"
                onClick={() => void handleDeleteStory()}
                disabled={deletingStory}
                className="rounded-full p-2 text-[#F87171] transition hover:bg-[#06111E]/80 disabled:opacity-50"
                aria-label="Delete story"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            ) : null}
            {story.mediaType === "video" ? (
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="rounded-full p-2 text-[#F8FAFC] transition hover:bg-[#06111E]/80"
                aria-label={muted ? "Unmute story" : "Mute story"}
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#F8FAFC] transition hover:bg-[#06111E]/80"
              aria-label="Close story"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* 9:16 media + gestures */}
        <div
          className="sanctuary-story-media-shell relative flex min-h-0 flex-1 items-center justify-center bg-[#01040A] px-0"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="sanctuary-story-media-frame">
            {story.mediaType === "video" ? (
              <video
                ref={videoRef}
                key={story.id}
                src={story.mediaUrl}
                className="sanctuary-story-media"
                playsInline
                muted={muted}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={story.id} src={story.mediaUrl} alt="" className="sanctuary-story-media" />
            )}
          </div>

          {paused ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white/90">
                Paused
              </span>
            </div>
          ) : null}

          {heartBurst ? (
            <div className="sanctuary-story-heart-float pointer-events-none absolute inset-0 flex items-center justify-center">
              <Heart className="h-24 w-24 fill-[#00F2FE] text-[#00F2FE] drop-shadow-[0_0_24px_rgba(0,242,254,0.65)]" />
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="relative z-30 border-t border-[#06111E] bg-[#020712]/95 px-3 py-3 sm:px-4">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a message"
              className="min-w-0 flex-1 rounded-full border border-[#06111E] bg-[#06111E] px-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#0EA5E9]/50 focus:outline-none focus:ring-1 focus:ring-[#00F2FE]/40"
            />
            <button
              type="button"
              onClick={handleHeart}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#00F2FE] transition hover:bg-[#06111E] hover:shadow-[0_0_16px_rgba(0,242,254,0.25)]"
              aria-label="React with heart"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
