import type { SanctuaryLayoutData, SanctuaryPost } from "@/app/my-sanctuary/actions";
import {
  filterFeedPosts,
  filterReelPosts,
  resolveProfilePostStat,
} from "@/lib/sanctuary-post-filters";
import {
  type InstagramMediaItem,
  type InstagramProfileData,
  isUsableInstagramMediaUrl,
} from "@/lib/profile/instagram-profile-data";

function toMediaItems(posts: SanctuaryPost[]): InstagramMediaItem[] {
  return posts
    .filter((p) => isUsableInstagramMediaUrl(p.media_url))
    .map((p) => ({
      id: p.id,
      url: p.media_url!,
      isVideo: p.media_type === "video",
    }));
}

/** Read-only adapter — maps existing sanctuary layout data without touching server actions. */
export function mapSanctuaryToInstagramProfile(
  layout: SanctuaryLayoutData,
  options?: {
    avatarUrl?: string | null;
    saved?: InstagramMediaItem[];
    tagged?: InstagramMediaItem[];
  },
): InstagramProfileData {
  const profile = layout.profile;
  const username = profile?.username?.trim() || profile?.full_name?.trim() || "member";
  const feedPosts = filterFeedPosts(layout.posts);
  const reelPosts = filterReelPosts(layout.posts);
  const gridPosts = [...feedPosts, ...reelPosts];

  return {
    username,
    postsCount: resolveProfilePostStat(layout.posts, layout.totalPosts ?? 0),
    followersCount: layout.followersCount ?? 0,
    followingCount: layout.followingCount ?? 0,
    fullName: profile?.full_name?.trim() || username,
    bio: profile?.bio?.trim() || "",
    avatarUrl: options?.avatarUrl ?? profile?.avatar_url ?? null,
    highlights: [],
    posts: toMediaItems(gridPosts),
    saved: options?.saved ?? [],
    tagged: options?.tagged ?? toMediaItems(layout.taggedPosts ?? []),
  };
}
