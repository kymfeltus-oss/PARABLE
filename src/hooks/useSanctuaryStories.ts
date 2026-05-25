"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StoriesFeedResponse, StoryUserGroup } from "@/lib/sanctuary-stories/types";
import { STORY_MAX_BYTES } from "@/lib/sanctuary-stories/constants";
import { STORIES_SCHEMA_SETUP_HINT } from "@/lib/sanctuary-stories/schema-errors";

type UseSanctuaryStoriesResult = {
  groups: StoryUserGroup[];
  currentUserId: string | null;
  loading: boolean;
  uploading: boolean;
  uploadError: string | null;
  refresh: () => Promise<void>;
  uploadStory: (file: File) => Promise<boolean>;
  markViewed: (storyId: string) => void;
};

export function useSanctuaryStories(): UseSanctuaryStoriesResult {
  const [groups, setGroups] = useState<StoryUserGroup[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const viewedPending = useRef(new Set<string>());
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stories", { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 401) {
            setGroups([]);
            setCurrentUserId(null);
            return;
          }
          if (res.status === 503) {
            setGroups([]);
            return;
          }
          throw new Error("Failed to load stories.");
        }
      const data = (await res.json()) as StoriesFeedResponse;
      setGroups(data.groups ?? []);
      setCurrentUserId(data.currentUserId ?? null);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onStoryPublished = () => {
      void refresh();
    };
    window.addEventListener("parable:story-published", onStoryPublished);
    return () => window.removeEventListener("parable:story-published", onStoryPublished);
  }, [refresh]);

  const uploadStory = useCallback(
    async (file: File): Promise<boolean> => {
      setUploadError(null);

      if (file.size > STORY_MAX_BYTES) {
        setUploadError("Story media must be 10 MB or smaller.");
        return false;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("media", file);

        const res = await fetch("/api/stories", { method: "POST", body: formData });
        const payload = (await res.json().catch(() => ({}))) as { error?: string };

        if (!res.ok) {
          const hint =
            res.status === 503
              ? STORIES_SCHEMA_SETUP_HINT
              : (payload.error ?? "Upload failed.");
          setUploadError(hint);
          return false;
        }

        await refresh();
        window.dispatchEvent(new CustomEvent("parable:story-published"));
        return true;
      } catch {
        setUploadError("Upload failed. Please try again.");
        return false;
      } finally {
        setUploading(false);
      }
    },
    [refresh],
  );

  const markViewed = useCallback((storyId: string) => {
    if (viewedPending.current.has(storyId)) return;
    viewedPending.current.add(storyId);

    setGroups((prev) =>
      prev.map((group) => {
        const stories = group.stories.map((s) => (s.id === storyId ? { ...s, viewed: true } : s));
        const viewerId = currentUserIdRef.current;
        const hasUnviewed =
          viewerId !== null && group.userId !== viewerId && stories.some((s) => !s.viewed);
        return { ...group, stories, hasUnviewed };
      }),
    );

    void fetch("/api/stories/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId }),
    }).catch(() => {
      viewedPending.current.delete(storyId);
    });
  }, []);

  return {
    groups,
    currentUserId,
    loading,
    uploading,
    uploadError,
    refresh,
    uploadStory,
    markViewed,
  };
}
