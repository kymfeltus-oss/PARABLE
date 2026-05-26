"use client";

import Link from "next/link";
import { Film } from "lucide-react";
import { DEMO_AVATAR_FALLBACK, type DemoHomeFeedPost } from "@/lib/demo-personas";

type Props = {
  posts: DemoHomeFeedPost[];
};

function mediaFallback(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEMO_AVATAR_FALLBACK;
}

/** Instagram Explore — masonry discovery grid (presentation only). */
export default function SanctuaryIgExploreGrid({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-semibold text-[#F8FAFC]">Nothing to explore yet</p>
        <p className="mt-2 max-w-xs text-xs text-[#94A3B8]">Posts from the sanctuary feed appear here in a discovery grid.</p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {posts.map((post) => {
          const href = post.post_type === "video" ? `/parables/${post.id}` : "#";
          const isVideo = post.post_type === "video";

          return (
            <Link
              key={post.id}
              href={href}
              className="group relative aspect-square overflow-hidden bg-[#06111E]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.media_url}
                alt=""
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                onError={mediaFallback}
              />
              {isVideo ? (
                <span className="absolute right-1.5 top-1.5 rounded-md bg-[#01040A]/70 p-1">
                  <Film className="h-3.5 w-3.5 text-[#F8FAFC]" aria-hidden />
                </span>
              ) : null}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#01040A]/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
