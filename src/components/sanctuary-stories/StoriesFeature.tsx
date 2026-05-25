"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import StoryTray from "./StoryTray";
import StoryModalViewer from "./StoryModalViewer";
import type { StoryBubbleTheme } from "./StoryBubble";
import { useSanctuaryStories } from "@/hooks/useSanctuaryStories";
import { STORY_ACCEPT } from "@/lib/sanctuary-stories/constants";
import "@/styles/sanctuary-stories.css";

type StoriesFeatureProps = {
  theme?: StoryBubbleTheme;
  /** Profile mode: show only this user's stories bubble. */
  focusUserId?: string | null;
  className?: string;
  showUploadStatus?: boolean;
};

export default function StoriesFeature({
  theme = "dark",
  focusUserId = null,
  className = "",
  showUploadStatus = true,
}: StoriesFeatureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    groups,
    currentUserId,
    loading,
    uploading,
    uploadError,
    uploadStory,
    markViewed,
    refresh,
  } = useSanctuaryStories();

  const [viewerUserId, setViewerUserId] = useState<string | null>(null);

  const storyGroups = useMemo(
    () => groups.filter((g) => g.stories.length > 0),
    [groups],
  );

  const viewerGroups = useMemo(() => {
    if (focusUserId) {
      return storyGroups.filter((g) => g.userId === focusUserId);
    }
    return storyGroups;
  }, [storyGroups, focusUserId]);

  const viewerStartIndex = useMemo(() => {
    if (!viewerUserId || focusUserId) return 0;
    const idx = viewerGroups.findIndex((g) => g.userId === viewerUserId);
    return idx >= 0 ? idx : 0;
  }, [viewerGroups, viewerUserId, focusUserId]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleOwnBubbleClick = useCallback(() => {
    const targetId = focusUserId ?? currentUserId;
    const own = groups.find((g) => g.userId === targetId);
    if (own && own.stories.length > 0) {
      setViewerUserId(targetId ?? null);
      return;
    }
    openFilePicker();
  }, [groups, currentUserId, focusUserId, openFilePicker]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const ok = await uploadStory(file);
      if (ok) {
        setViewerUserId(focusUserId ?? currentUserId);
      }
    },
    [uploadStory, currentUserId, focusUserId],
  );

  const rootClass = [
    "sanctuary-stories",
    theme === "light" ? "sanctuary-stories--light" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <input
        ref={fileInputRef}
        type="file"
        accept={STORY_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />

      <StoryTray
        groups={groups}
        currentUserId={currentUserId}
        loading={loading}
        theme={theme}
        focusUserId={focusUserId}
        onOpenGroup={(userId) => setViewerUserId(userId)}
        onAddStory={handleOwnBubbleClick}
      />

      {showUploadStatus && uploading ? (
        <p className="px-4 pb-2 text-center text-xs text-[#94A3B8]">Uploading story…</p>
      ) : null}

      {showUploadStatus && uploadError ? (
        <p className="px-4 pb-2 text-center text-xs text-[#00F2FE]" role="alert">
          {uploadError}
        </p>
      ) : null}

      {viewerUserId && viewerGroups.length > 0 ? (
        <StoryModalViewer
          groups={viewerGroups}
          startGroupIndex={viewerStartIndex}
          currentUserId={currentUserId}
          onClose={() => setViewerUserId(null)}
          onMarkViewed={markViewed}
          onStoryDeleted={() => void refresh()}
        />
      ) : null}
    </div>
  );
}
