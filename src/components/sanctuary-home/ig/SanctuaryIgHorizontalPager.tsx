"use client";

import { useState, type ReactNode } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { DemoHomeFeedPost } from "@/lib/demo-personas";
import SanctuaryIgExploreGrid from "@/components/sanctuary-home/ig/SanctuaryIgExploreGrid";
import SanctuaryIgReelsPanel from "@/components/sanctuary-home/ig/SanctuaryIgReelsPanel";

type Props = {
  homePanel: ReactNode;
  explorePosts: DemoHomeFeedPost[];
  reelPosts: DemoHomeFeedPost[];
};

const SWIPE_THRESHOLD = 72;

/** Horizontal pager: Home feed, Explore grid, and Reels (9:16) panels. */
export default function SanctuaryIgHorizontalPager({ homePanel, explorePosts, reelPosts }: Props) {
  const [page, setPage] = useState(0);

  const go = (next: number) => setPage(Math.max(0, Math.min(2, next)));

  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_THRESHOLD || info.velocity.x < -400) go(page + 1);
    else if (info.offset.x >= SWIPE_THRESHOLD || info.velocity.x > 400) go(page - 1);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex justify-center gap-2 border-b border-[#06111E]/60 py-2">
        {["Home", "Explore", "Reels"].map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => go(idx)}
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider transition ${
              page === idx ? "bg-[#00F2FE]/15 text-[#00F2FE]" : "text-[#64748B] hover:text-[#94A3B8]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <motion.div className="min-h-0 flex-1 overflow-hidden" onPanEnd={onPanEnd}>
        <motion.div
          className="flex h-full"
          animate={{ x: `-${page * 100}%` }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
        >
          <div className="flex h-full w-full shrink-0 flex-col overflow-hidden">{homePanel}</div>

          <div className="flex h-full w-full shrink-0 flex-col overflow-hidden bg-[#01040A]">
            <SanctuaryIgExploreGrid posts={explorePosts} />
          </div>

          <div className="flex h-full w-full shrink-0 flex-col overflow-hidden bg-[#01040A]">
            <SanctuaryIgReelsPanel reels={reelPosts} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
