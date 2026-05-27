"use client";

import { useState } from "react";
import { initialsFromDisplayName } from "@/lib/avatar-display";

type Props = {
  src: string;
  displayName: string;
  className?: string;
  liveRing?: boolean;
};

/** Theme-compliant initials fallback for live discovery (no PARABLE logo on profile failure). */
export default function ChannelAvatar({
  src,
  displayName,
  className = "h-8 w-8",
  liveRing = false,
}: Props) {
  const [failed, setFailed] = useState(!src?.trim());

  if (failed) {
    return (
      <div className={`relative shrink-0 ${className}`}>
        <div
          className="flex h-full w-full items-center justify-center rounded-full border border-[#24272c] bg-[#191b1f] text-[10px] font-bold tracking-wide text-[#00f2fe]"
          aria-hidden
        >
          {initialsFromDisplayName(displayName)}
        </div>
        {liveRing ? (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-[#191b1f] bg-red-500" />
        ) : null}
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full bg-[#24272c] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
      {liveRing ? (
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-[#191b1f] bg-red-500" />
      ) : null}
    </div>
  );
}
