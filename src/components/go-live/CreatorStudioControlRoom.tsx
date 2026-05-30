"use client";

import type { CreatorStudioControlRoomProps } from "@/lib/go-live-layout-types";

export default function CreatorStudioControlRoom({
  headerSlot,
  telemetrySlot,
  videoSlot,
  metadataSlot,
  chatSlot,
}: CreatorStudioControlRoomProps) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#080a0c] text-[#eff1f6]">
      {headerSlot}

      <div className="flex min-h-0 w-full flex-1 overflow-hidden">
        <aside className="hidden h-full w-[240px] shrink-0 border-r border-[#191f24] bg-[#0b0e11] lg:block">
          {telemetrySlot}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col space-y-4 overflow-y-auto bg-[#080a0c] p-4">
          <div className="relative flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#191f24] bg-black shadow-2xl">
            {videoSlot}
          </div>
          <div className="w-full rounded-xl border border-[#191f24] bg-[#111722]/40 p-4 shadow-lg">
            {metadataSlot}
          </div>
        </main>

        <aside className="hidden h-full w-[320px] shrink-0 border-l border-[#191f24] bg-[#0b0e11] md:block">
          {chatSlot}
        </aside>
      </div>
    </div>
  );
}
