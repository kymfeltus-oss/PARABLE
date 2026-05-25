import type { SanctuaryPost } from "@/app/my-sanctuary/actions";

export function filterStoryPosts(posts: SanctuaryPost[]): SanctuaryPost[] {
  return posts.filter((post) => post.media_type === "story");
}

export function filterReelPosts(posts: SanctuaryPost[]): SanctuaryPost[] {
  return posts.filter((post) => post.media_type === "video");
}

/** Grid posts shown under the Posts tab (excludes stories and reels). */
export function filterFeedPosts(posts: SanctuaryPost[]): SanctuaryPost[] {
  return posts.filter((post) => post.media_type !== "story" && post.media_type !== "video");
}

export function countFeedPosts(posts: SanctuaryPost[]): number {
  return filterFeedPosts(posts).length;
}

/** Posts tab + Reels tab only (stories excluded from profile post count). */
export function countProfileTabPosts(posts: SanctuaryPost[]): number {
  return filterFeedPosts(posts).length + filterReelPosts(posts).length;
}

const PROFILE_POST_FETCH_LIMIT = 30;

/** Header stat: Posts + Reels tabs only; stories are excluded. */
export function resolveProfilePostStat(posts: SanctuaryPost[], totalFromDb: number): number {
  const tabTotal = countProfileTabPosts(posts);
  if (posts.length < PROFILE_POST_FETCH_LIMIT) {
    return tabTotal;
  }
  return Math.max(tabTotal, totalFromDb);
}

export { PROFILE_POST_FETCH_LIMIT };
