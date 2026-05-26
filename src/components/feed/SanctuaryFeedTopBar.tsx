"use client";

import Image from "next/image";
import SearchBar from "@/components/feed/SearchBar";
import Actions from "@/components/feed/Actions";

/**
 * Instagram-clone header row: logo · search · actions — PARABLE brand (no Instagram assets).
 */
export default function SanctuaryFeedTopBar() {
  return (
    <div className="ig-topbar w-full bg-white py-2.5 shadow-sm">
      <div className="mx-auto flex h-11 max-w-[63rem] items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
        <div className="relative h-8 w-[6.25rem] shrink-0">
          <Image
            src="/fonts/parable-logo.svg"
            alt="PARABLE"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
        <div className="min-w-0 flex-1 px-1 sm:max-w-[min(100%,240px)] md:max-w-xs md:px-2">
          <SearchBar placeholder="Search" variant="light" />
        </div>
        <Actions variant="light" />
      </div>
    </div>
  );
}
