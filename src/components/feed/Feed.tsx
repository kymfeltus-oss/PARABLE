"use client";

import { useEffect, useRef } from "react";
import Posts from "./Posts";
import Stories from "./Stories";
import MiniProfile from "./MiniProfile";
import { useFeed } from "@/hooks/useFeed";
import { useAuth } from "@/hooks/useAuth";

type FeedProps = {
  /** Single-column “phone home” layout — no desktop mini-profile rail. */
  hideMiniProfile?: boolean;
  /** When set, only loads that user’s posts (`profile_id`). */
  userId?: string;
};

/**
 * Instagram-clone feed shell: stories + {@link useFeed} posts + optional aside (xl).
 */
export default function Feed({ hideMiniProfile = false, userId }: FeedProps) {
  const { posts, loading, loadingMore, hasMore, loadMore, refresh } = useFeed(userId);
  const { userProfile } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore) {
          void loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, loadingMore]);

  return (
    <div
      className={[
        "min-h-[200px] w-full bg-black text-white",
        hideMiniProfile ? "px-0 pt-0 pb-2" : "rounded-lg p-3 md:p-4",
      ].join(" ")}
    >
      <div
        className={
          hideMiniProfile
            ? "w-full"
            : "w-full lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-5"
        }
      >
        <section className="min-w-0 xl:max-w-6xl xl:justify-self-stretch">
          <Stories />
          <div className="mt-1">
            <Posts
              posts={posts}
              sentinelRef={sentinelRef}
              isLoading={loading}
              isLoadingMore={loadingMore}
              hasMore={hasMore}
              profileUserId={userId}
              onFollowed={refresh}
            />
          </div>
        </section>
        {!hideMiniProfile ? (
          <aside className="mt-6 w-full shrink-0 lg:sticky lg:top-4 lg:mt-0 lg:block lg:max-w-[280px] lg:justify-self-end lg:self-start">
            <MiniProfile
              currentUserId={userProfile?.id ? String(userProfile.id) : undefined}
              onFeedRefresh={refresh}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
