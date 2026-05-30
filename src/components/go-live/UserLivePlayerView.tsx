"use client";

import type { UserLivePlayerViewProps } from "@/lib/go-live-layout-types";

export default function UserLivePlayerView({
  playerSlot,
  overlaySlot,
  reactionHudSlot,
  metaBarSlot,
  chatRailSlot,
}: UserLivePlayerViewProps) {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#080a0c] text-white">
      <div className="relative flex min-h-0 w-full flex-1 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col bg-[#05070a]">
          <div
            className="relative z-10 flex aspect-video w-full items-center justify-center overflow-hidden border-b border-[#191f24] bg-black shadow-2xl"
            data-watch-player-root
          >
            {playerSlot}
            {overlaySlot}
            <div className="pointer-events-auto absolute right-4 bottom-4 z-[55]">
              {reactionHudSlot}
            </div>
          </div>

          <div className="relative z-20 w-full bg-[#080a0c]">{metaBarSlot}</div>
        </div>

        <aside className="relative z-20 flex h-[calc(100vh-56px)] w-full shrink-0 flex-col border-l border-[#191f24] bg-[#0b0e11] lg:h-screen lg:w-[340px]">
          {chatRailSlot}
        </aside>
      </div>
    </div>
  );
}
