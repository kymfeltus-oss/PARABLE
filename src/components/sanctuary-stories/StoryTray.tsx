"use client";

import { useMemo, useRef } from "react";
import StoryBubble, { type StoryBubbleTheme } from "./StoryBubble";
import type { StoryUserGroup } from "@/lib/sanctuary-stories/types";

type StoryTrayProps = {
  groups: StoryUserGroup[];
  currentUserId: string | null;
  loading?: boolean;
  theme?: StoryBubbleTheme;
  /** When set, only show this user's story bubble (profile mode). */
  focusUserId?: string | null;
  onOpenGroup: (userId: string) => void;
  onAddStory: () => void;
};

export default function StoryTray({
  groups,
  currentUserId,
  loading = false,
  theme = "dark",
  focusUserId = null,
  onOpenGroup,
  onAddStory,
}: StoryTrayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayGroups = useMemo(() => {
    if (focusUserId) {
      return groups.filter((g) => g.userId === focusUserId);
    }
    if (!currentUserId) return groups;
    const own = groups.find((g) => g.userId === currentUserId);
    const rest = groups.filter((g) => g.userId !== currentUserId);
    if (own) return [own, ...rest];
    return groups;
  }, [groups, currentUserId, focusUserId]);

  const showOwnBubble = Boolean(currentUserId && (!focusUserId || focusUserId === currentUserId));
  const focusGroup = focusUserId ? groups.find((g) => g.userId === focusUserId) : null;
  const showFocusBubble = Boolean(focusUserId && focusUserId !== currentUserId && focusGroup?.stories.length);

  if (loading && displayGroups.length === 0 && !showOwnBubble) {
    return (
      <section className="sanctuary-stories sanctuary-stories-tray px-3 py-3 sm:px-4">
        <div className="sanctuary-stories-tray-scroll flex gap-3 overflow-x-auto pb-1">
          {Array.from({ length: focusUserId ? 1 : 6 }).map((_, i) => (
            <div key={i} className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5">
              <div className="h-[3.85rem] w-[3.85rem] animate-pulse rounded-full bg-[#06111E]/20" />
              <div className="h-2.5 w-10 animate-pulse rounded bg-[#06111E]/15" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!showOwnBubble && !showFocusBubble && displayGroups.filter((g) => g.stories.length > 0).length === 0) {
    return null;
  }

  return (
    <section className="sanctuary-stories sanctuary-stories-tray px-3 py-3 sm:px-4" aria-label="Stories">
      <div
        ref={scrollRef}
        className="sanctuary-stories-tray-scroll flex gap-3 overflow-x-auto overscroll-x-contain pb-1 touch-pan-x"
      >
        {showOwnBubble ? (
          <StoryBubble
            username="You"
            avatarUrl={displayGroups.find((g) => g.userId === currentUserId)?.avatarUrl ?? null}
            previewUrl={(() => {
              const latest = displayGroups.find((g) => g.userId === currentUserId)?.stories.at(-1);
              return latest?.mediaType === "image" ? latest.mediaUrl : null;
            })()}
            hasUnviewed={false}
            isOwn
            theme={theme}
            isEmptyOwn={!displayGroups.find((g) => g.userId === currentUserId)?.stories.length}
            onClick={onAddStory}
          />
        ) : null}

        {showFocusBubble && focusGroup ? (
          <StoryBubble
            username={focusGroup.username}
            avatarUrl={focusGroup.avatarUrl}
            previewUrl={
              focusGroup.stories.at(-1)?.mediaType === "image"
                ? focusGroup.stories.at(-1)?.mediaUrl ?? null
                : null
            }
            hasUnviewed={focusGroup.hasUnviewed}
            theme={theme}
            onClick={() => onOpenGroup(focusGroup.userId)}
          />
        ) : null}

        {!focusUserId
          ? displayGroups
              .filter((g) => g.userId !== currentUserId && g.stories.length > 0)
              .map((group) => (
                <StoryBubble
                  key={group.userId}
                  username={group.username}
                  avatarUrl={group.avatarUrl}
                  previewUrl={
                    group.stories.at(-1)?.mediaType === "image"
                      ? group.stories.at(-1)?.mediaUrl ?? null
                      : null
                  }
                  hasUnviewed={group.hasUnviewed}
                  theme={theme}
                  onClick={() => onOpenGroup(group.userId)}
                />
              ))
          : null}
      </div>
    </section>
  );
}
