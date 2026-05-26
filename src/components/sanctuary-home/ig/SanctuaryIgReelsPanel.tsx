"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { DEMO_AVATAR_FALLBACK, type DemoHomeFeedPost } from "@/lib/demo-personas";

type Props = {
  reels: DemoHomeFeedPost[];
};

function mediaFallback(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEMO_AVATAR_FALLBACK;
}

/** Fullscreen 9:16 reels preview column — routes to immersive reels feed. */
export default function SanctuaryIgReelsPanel({ reels }: Props) {
  if (reels.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-sm font-semibold text-[#F8FAFC]">No reels yet</p>
        <Link
          href="/reels"
          className="rounded-xl border border-[#00F2FE]/30 bg-[#06111E] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#00F2FE]"
        >
          Open Reels feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {reels.map((reel) => (
        <Link
          key={reel.id}
          href="/reels"
          className="relative flex h-full min-h-[min(100%,720px)] w-full snap-start snap-always items-center justify-center bg-[#01040A]"
        >
          <div className="relative aspect-[9/16] h-full max-h-full w-auto max-w-full overflow-hidden bg-[#06111E]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reel.media_url}
              alt=""
              className="h-full w-full object-cover"
              onError={mediaFallback}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#01040A]/30 via-transparent to-[#01040A]/80" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-sm font-semibold text-[#F8FAFC]">@{reel.username}</p>
              {reel.caption ? (
                <p className="mt-1 line-clamp-2 text-xs text-[#CBD5E1]">{reel.caption}</p>
              ) : null}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full border border-[#00F2FE]/40 bg-[#01040A]/60 p-4">
                <Play className="h-8 w-8 fill-[#00F2FE] text-[#00F2FE]" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
