"use client";

import type { RefObject } from "react";
import InstagramPost from "./InstagramPost";
import SuggestedFollowers from "./SuggestedFollowers";
import type { FeedPostNormalized } from "@/hooks/useFeed";

type Props = {
  posts: FeedPostNormalized[];
  sentinelRef: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore: boolean;
  /** When set, feed is scoped to one profile — empty state skips suggestions. */
  profileUserId?: string;
  /** Refetch feed after following someone from suggestions. */
  onFollowed?: () => void;
};

/**
 * Home feed — centered column; each row is an {@link InstagramPost}.
 */
export default function Posts({
  posts,
  sentinelRef,
  isLoading,
  isLoadingMore,
  hasMore,
  profileUserId,
  onFollowed,
}: Props) {
  return (
    <div className="w-full scrollbar-hide bg-black">
      {posts.length === 0 && !isLoading && !profileUserId && (
        <div className="mt-8 space-y-4 px-3 text-center">
          <p className="text-sm font-medium text-white/90">No posts to show right now.</p>
          <p className="text-xs text-white/45">
            This feed lists people you follow. Follow accounts below — new posts appear here in real time.
          </p>
          <div className="text-left">
            <SuggestedFollowers onFollowed={onFollowed} />
          </div>
        </div>
      )}
      {posts.length === 0 && !isLoading && profileUserId && (
        <p className="mt-10 text-center text-sm text-white/45">No posts yet.</p>
      )}
      <div className="w-full">
        {posts.map((post) => (
          <InstagramPost
            key={post.id}
            id={post.id}
            content={post.content ?? ""}
            image_url={post.image_url ?? undefined}
            media_type={post.media_type}
            author={
              post.author
                ? {
                    id: post.author.id,
                    full_name: post.author.full_name ?? undefined,
                    username: post.author.username ?? undefined,
                    avatar_url: post.author.avatar_url ?? undefined,
                    status_text: post.author.status_text ?? undefined,
                    is_live: post.author.is_live ?? undefined,
                  }
                : null
            }
            created_at={post.created_at}
            likesCount={post.likesCount}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="h-4" />
      {(isLoading || isLoadingMore) && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border border-[#00f2ff] border-t-transparent" />
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <p className="py-8 text-center text-sm text-white/40">No more posts</p>
      )}
    </div>
  );
}
