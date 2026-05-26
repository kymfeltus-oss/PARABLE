"use client";

import { Plus } from "lucide-react";

export type StoryBubbleTheme = "dark" | "light";

type StoryBubbleProps = {
  username: string;
  avatarUrl: string | null;
  previewUrl?: string | null;
  hasUnviewed: boolean;
  isOwn?: boolean;
  isEmptyOwn?: boolean;
  theme?: StoryBubbleTheme;
  onClick: () => void;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? "S").toUpperCase();
}

export default function StoryBubble({
  username,
  avatarUrl,
  previewUrl,
  hasUnviewed,
  isOwn = false,
  isEmptyOwn = false,
  theme = "dark",
  onClick,
}: StoryBubbleProps) {
  const isLight = theme === "light";
  const ringClass = isEmptyOwn
    ? "sanctuary-story-ring-own-empty"
    : hasUnviewed
      ? "sanctuary-story-ring-unviewed"
      : "sanctuary-story-ring-viewed";

  const avatarRingBg = isLight ? "bg-white ring-white" : "bg-[#06111E] ring-[#01040A]";
  const initialsColor = isLight ? "text-[#737373]" : "text-[#94A3B8]";
  const labelClass = isLight
    ? "story-bubble-label text-[#262626] group-hover:text-black"
    : "story-bubble-label text-[#CBD5E1] group-hover:text-[#F8FAFC]";
  const plusClass = isLight
    ? "story-bubble-plus border-[#fafafa] bg-white text-[#00F2FE]"
    : "story-bubble-plus border-[#01040A] bg-[#06111E] text-[#00F2FE]";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F2FE]/60"
      aria-label={isOwn ? "Your story" : `${username}'s story`}
    >
      <div className="relative">
        <div className={`${ringClass} story-bubble-avatar-ring`}>
          <div className={`relative h-[3.65rem] w-[3.65rem] overflow-hidden rounded-full ring-2 ${avatarRingBg}`}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className={`flex h-full w-full items-center justify-center text-xs font-semibold ${initialsColor}`}>
                {initialsFromName(username)}
              </span>
            )}
          </div>
        </div>
        {isOwn ? (
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 shadow-[0_0_12px_rgba(0,242,254,0.35)] ${plusClass}`}
          >
            <Plus className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <span className={`max-w-[4.75rem] truncate text-[11px] font-medium ${labelClass}`}>
        {isOwn ? "Your story" : username}
      </span>
    </button>
  );
}
