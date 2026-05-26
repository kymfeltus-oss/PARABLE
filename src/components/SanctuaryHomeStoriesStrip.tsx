"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import type { DemoHomeTrayItem } from "@/lib/demo-personas";
import type { StoryUserGroup } from "@/lib/sanctuary-stories/types";
import { STORY_ACCEPT } from "@/lib/sanctuary-stories/constants";
import StoryModalViewer from "@/components/sanctuary-stories/StoryModalViewer";
import "@/styles/sanctuary-stories.css";

type Props = {
  currentUserId: string;
  currentUserAvatar: string | null;
  currentUsername: string;
  trayItems: DemoHomeTrayItem[];
  storyGroups: StoryUserGroup[];
  uploading?: boolean;
  uploadError?: string | null;
  onUploadStory: (file: File) => Promise<boolean>;
  onMarkViewed: (storyId: string) => void;
  onStoryDeleted?: (storyId: string) => void;
};

/** Instagram-spec stories tray: 114px height, 56px ring, 48px avatar. */
export default function SanctuaryHomeStoriesStrip({
  currentUserId,
  currentUserAvatar,
  currentUsername,
  trayItems,
  storyGroups,
  uploading = false,
  uploadError = null,
  onUploadStory,
  onMarkViewed,
  onStoryDeleted,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewerUserId, setViewerUserId] = useState<string | null>(null);

  const ownGroup = useMemo(
    () => storyGroups.find((g) => g.userId === currentUserId) ?? null,
    [storyGroups, currentUserId],
  );

  const viewerGroups = useMemo(
    () => storyGroups.filter((g) => g.stories.length > 0),
    [storyGroups],
  );

  const viewerStartIndex = useMemo(() => {
    if (!viewerUserId) return 0;
    const idx = viewerGroups.findIndex((g) => g.userId === viewerUserId);
    return idx >= 0 ? idx : 0;
  }, [viewerGroups, viewerUserId]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleOwnBubbleClick = useCallback(() => {
    if (ownGroup && ownGroup.stories.length > 0) {
      setViewerUserId(currentUserId);
      return;
    }
    openFilePicker();
  }, [ownGroup, currentUserId, openFilePicker]);

  const handleTrayClick = useCallback(
    (item: DemoHomeTrayItem) => {
      if (item.is_live) {
        router.push(`/stream/${item.userId}`);
        return;
      }
      const group = storyGroups.find((g) => g.userId === item.userId && g.stories.length > 0);
      if (group || item.has_unviewed_story) {
        setViewerUserId(item.userId);
      }
    },
    [router, storyGroups],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const ok = await onUploadStory(file);
      if (ok) setViewerUserId(currentUserId);
    },
    [onUploadStory, currentUserId],
  );

  const others = trayItems.filter((t) => t.userId !== currentUserId);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={STORY_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="h-[114px] shrink-0 border-b border-[#06111E]/80 bg-[#01040A]">
        <div className="flex h-full items-center gap-3 overflow-x-auto overflow-y-hidden px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={handleOwnBubbleClick}
            className="flex w-[72px] shrink-0 flex-col items-center gap-1"
            aria-label="Add or view your story"
          >
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00F2FE] via-[#0EA5E9] to-[#7DD3FC] p-[4px]">
                <div className="h-full w-full rounded-full bg-[#01040A] p-[4px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUserAvatar ?? "/demo/avatars/default.svg"}
                    alt={currentUsername}
                    className="h-12 w-12 rounded-full object-cover"
                    onError={fallbackAvatarOnError}
                  />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#01040A] bg-[#00F2FE] text-[#01040A]">
                <Plus className="h-3 w-3" strokeWidth={3} />
              </span>
            </div>
            <span className="max-w-[72px] truncate text-[11px] text-[#CBD5E1]">Your story</span>
          </button>

          {others.map((item) => {
            const ringClass = item.is_live
              ? "bg-gradient-to-tr from-[#00F2FE] via-[#0EA5E9] to-[#00F2FE] animate-pulse"
              : item.has_unviewed_story
                ? "bg-gradient-to-tr from-[#00F2FE] via-[#0EA5E9] to-[#7DD3FC]"
                : "bg-[#334155]/60";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTrayClick(item)}
                className="flex w-[72px] shrink-0 flex-col items-center gap-1"
              >
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <div className={`absolute inset-0 rounded-full p-[4px] ${ringClass}`}>
                    <div className="h-full w-full rounded-full bg-[#01040A] p-[4px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.avatar_url}
                        alt={item.username}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={fallbackAvatarOnError}
                      />
                    </div>
                  </div>
                  {item.is_live ? (
                    <span className="absolute -bottom-1 left-1/2 z-10 -translate-x-1/2 rounded bg-[#00F2FE] px-1 py-0.5 text-[7px] font-black uppercase text-[#01040A]">
                      Live
                    </span>
                  ) : null}
                </div>
                <span className="max-w-[72px] truncate text-[11px] text-[#CBD5E1]">{item.username}</span>
              </button>
            );
          })}
        </div>
      </div>

      {uploading ? <p className="px-3 py-1 text-center text-[11px] text-[#94A3B8]">Uploading story…</p> : null}
      {uploadError ? (
        <p className="px-3 py-1 text-center text-[11px] text-[#EF4444]" role="alert">
          {uploadError}
        </p>
      ) : null}

      {viewerUserId && viewerGroups.length > 0 ? (
        <StoryModalViewer
          groups={viewerGroups}
          startGroupIndex={viewerStartIndex}
          currentUserId={currentUserId}
          onClose={() => setViewerUserId(null)}
          onMarkViewed={onMarkViewed}
          onStoryDeleted={onStoryDeleted}
        />
      ) : null}
    </>
  );
}
