/** Isolated data shape for `InstagramProfileView` — no server/schema coupling. */

export type InstagramProfileTab = "posts" | "saved" | "tagged";

export type InstagramHighlight = {
  id: string | number;
  title: string;
  img: string;
};

export type InstagramMediaItem = {
  id: string | number;
  url: string;
  isVideo?: boolean;
};

export type InstagramProfileData = {
  username: string;
  postsCount: number | string;
  followersCount: number | string;
  followingCount: number | string;
  fullName: string;
  bio: string;
  avatarUrl?: string | null;
  highlights: InstagramHighlight[];
  posts: InstagramMediaItem[];
  saved: InstagramMediaItem[];
  tagged: InstagramMediaItem[];
};

/** Blueprint defaults — replace via props for live data adapters later. */
export const DEFAULT_INSTAGRAM_PROFILE_DATA: InstagramProfileData = {
  username: "sanctuary_user",
  postsCount: 164,
  followersCount: "1.2k",
  followingCount: 482,
  fullName: "My Sanctuary Space",
  bio: "Designing custom digital experiences. Built with code.",
  avatarUrl: null,
  highlights: [
    { id: 1, title: "Updates", img: "" },
    { id: 2, title: "Designs", img: "" },
    { id: 3, title: "Live", img: "" },
    { id: 4, title: "Travel", img: "" },
  ],
  posts: [
    { id: 1, url: "" },
    { id: 2, url: "" },
    { id: 3, url: "" },
  ],
  saved: [{ id: 4, url: "" }],
  tagged: [{ id: 5, url: "" }],
};

export function isUsableInstagramMediaUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const trimmed = url.trim();
  if (/^https?:\/\/(www\.)?unsplash\.com\/?$/i.test(trimmed)) return false;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
}
