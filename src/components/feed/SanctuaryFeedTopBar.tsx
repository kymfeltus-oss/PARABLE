"use client";

import Image from "next/image";
import SearchBar from "@/components/feed/SearchBar";
import Actions from "@/components/feed/Actions";

/**
 * Instagram-clone header row: logo · search · actions — PARABLE brand (no Instagram assets).
 */
export default function SanctuaryFeedTopBar() {
  return (
    <div className="w-full border-b border-neutral-800 bg-black py-2 shadow-[0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
      <div className="flex h-11 items-center justify-between gap-1.5 sm:gap-2">
        <div className="relative h-8 w-[6.25rem] shrink-0">
          <Image
            src="/fonts/parable-logo.svg"
            alt="PARABLE"
            fill
            className="object-contain object-left drop-shadow-[0_0_14px_rgba(0,242,255,0.55)]"
            priority
          />
        </div>
        <div className="min-w-0 flex-1 px-1 sm:max-w-[min(100%,220px)] md:max-w-xs md:px-3">
          <SearchBar placeholder="Search PARABLE" />
        </div>
        <Actions />
      </div>
    </div>
  );
}
