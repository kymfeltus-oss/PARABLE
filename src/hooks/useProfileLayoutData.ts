"use client";

import { useState } from "react";
import type { SanctuaryLayoutData } from "@/app/my-sanctuary/actions";
import { countProfileTabPosts } from "@/lib/sanctuary-post-filters";

interface UseProfileLayoutProps {
  initialData: SanctuaryLayoutData;
}

/** Lightweight client coordinator for server-prefetched My Sanctuary layout data. */
export function useProfileLayoutData({ initialData }: UseProfileLayoutProps) {
  const [layoutData, setLayoutData] = useState<SanctuaryLayoutData>(initialData);

  const setOptimisticFollowers = (shouldIncrement: boolean) => {
    setLayoutData((prev) => ({
      ...prev,
      isFollowingCurrentUser: shouldIncrement,
      followersCount: shouldIncrement
        ? prev.followersCount + 1
        : Math.max(0, prev.followersCount - 1),
    }));
  };

  const revertOptimisticFollowers = (wasFollowing: boolean) => {
    setLayoutData((prev) => ({
      ...prev,
      isFollowingCurrentUser: wasFollowing,
      followersCount: wasFollowing
        ? prev.followersCount + 1
        : Math.max(0, prev.followersCount - 1),
    }));
  };

  const updateAvatarState = (newAvatarUrl: string) => {
    setLayoutData((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, avatar_url: newAvatarUrl } : null,
    }));
  };

  const updateProfileFields = (fields: {
    username?: string | null;
    full_name?: string | null;
    bio?: string | null;
  }) => {
    setLayoutData((prev) => ({
      ...prev,
      profile: prev.profile
        ? {
            ...prev.profile,
            ...(fields.username !== undefined ? { username: fields.username } : {}),
            ...(fields.full_name !== undefined ? { full_name: fields.full_name } : {}),
            ...(fields.bio !== undefined ? { bio: fields.bio } : {}),
          }
        : null,
    }));
  };

  const prependPublishedPost = (post: SanctuaryLayoutData["posts"][number]) => {
    setLayoutData((prev) => {
      const posts = [
        post,
        ...prev.posts.filter(
          (existing) => existing.id !== post.id && !existing.id.startsWith("pending-"),
        ),
      ];
      const totalPosts =
        posts.length < 30 ? countProfileTabPosts(posts) : prev.totalPosts + 1;
      return {
        ...prev,
        posts,
        totalPosts,
      };
    });
  };

  return {
    layoutData,
    setLayoutData,
    updateProfileFields,
    prependPublishedPost,
    setOptimisticFollowers,
    revertOptimisticFollowers,
    updateAvatarState,
  };
}
