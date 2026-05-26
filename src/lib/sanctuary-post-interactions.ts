import type { DemoHomeFeedPost } from "@/lib/demo-personas";
import { createDemoHomeFeedPosts } from "@/lib/demo-personas";

export type PostAudioTrack = {
  id: string;
  title: string;
};

export type BookmarkCollection = {
  id: string;
  name: string;
};

export const SANCTUARY_BOOKMARK_COLLECTIONS: BookmarkCollection[] = [
  { id: "saved", name: "Saved" },
  { id: "inspiration", name: "Inspiration" },
  { id: "ministry-ideas", name: "Ministry Ideas" },
  { id: "watch-later", name: "Watch Later" },
];

export const SANCTUARY_STORY_FROM_POST_EVENT = "parable:story-from-post";

export function dispatchSanctuaryStoryFromPost(postId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SANCTUARY_STORY_FROM_POST_EVENT, { detail: { postId } }));
}

export function getPostShareUrl(postId: string): string {
  if (typeof window === "undefined") return `/post/${postId}`;
  return `${window.location.origin}/post/${postId}`;
}

export async function copyPostLink(postId: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(getPostShareUrl(postId));
    return true;
  } catch {
    return false;
  }
}

export function getPostsByAudioId(audioId: string): DemoHomeFeedPost[] {
  return createDemoHomeFeedPosts().filter((post) => post.audio?.id === audioId);
}

export function getAudioTrackById(audioId: string): PostAudioTrack | null {
  for (const post of createDemoHomeFeedPosts()) {
    if (post.audio?.id === audioId) return post.audio;
  }
  return null;
}
