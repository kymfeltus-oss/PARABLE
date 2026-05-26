"use client";

import type { ReactNode } from "react";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

type Props = {
  name: string;
  /** @ handle, optional */
  handle?: string | null;
  avatarUrl?: string | null;
  statusText?: string | null;
  children: ReactNode;
};

/**
 * Discord-style hover “User Card” for feed headers — hover avatar or name to see status.
 */
export default function FeedUserProfileHover({
  name,
  handle,
  avatarUrl,
  statusText,
  children,
}: Props) {
  const handleLine = handle
    ? handle.startsWith("@")
      ? handle
      : `@${handle.replace(/^@/, "")}`
    : null;
  const status =
    statusText?.trim() ||
    null;

  return (
    <div
      className="group/feed-user relative isolate flex min-w-0 max-w-full flex-1 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#5865f2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      tabIndex={0}
    >
      {children}
      <div
        className="pointer-events-none invisible absolute left-0 top-full z-[200] pt-2 opacity-0 shadow-none transition-all duration-200 ease-out group-hover/feed-user:visible group-hover/feed-user:opacity-100 group-hover/feed-user:duration-150 group-focus-within/feed-user:visible group-focus-within/feed-user:opacity-100"
        role="tooltip"
      >
        <div className="pointer-events-auto w-[min(288px,calc(100vw-2.5rem))] overflow-hidden rounded-lg border border-[#1f2023] bg-[#111214] text-left shadow-[0_12px_40px_rgba(0,0,0,0.65)] ring-1 ring-black/50">
          <div className="h-11 bg-gradient-to-br from-[#5865f2]/50 via-[#404eed]/25 to-transparent" aria-hidden />
          <div className="-mt-7 px-3 pb-3 pt-0">
            <div className="flex items-end gap-2">
              <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full border-[3px] border-[#111214] bg-[#2b2d31] ring-2 ring-[#5865f2]/40">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={fallbackAvatarOnError}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#b5bac1]">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 pb-0.5">
                <p className="truncate text-[15px] font-semibold leading-tight text-[#ececec] drop-shadow-sm">
                  {name}
                </p>
                {handleLine ? (
                  <p className="truncate text-[12px] font-medium text-[#949ba4]">{handleLine}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-3 rounded-md border border-[#2b2d31] bg-[#1e1f22] px-2.5 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#6d7078]">Status</p>
              <p className="mt-1 text-[13px] leading-snug text-[#dbdee1]">
                {status || (
                  <span className="text-[#6d7078] italic">No status set</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
