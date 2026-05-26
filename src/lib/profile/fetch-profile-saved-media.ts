import type { InstagramMediaItem } from "@/lib/profile/instagram-profile-data";
import { isUsableInstagramMediaUrl } from "@/lib/profile/instagram-profile-data";

type BookmarkRow = {
  post_id: string;
  posts:
    | {
        id: string;
        media_url: string | null;
        post_type: string | null;
      }
    | {
        id: string;
        media_url: string | null;
        post_type: string | null;
      }[]
    | null;
};

/** Client-side saved posts for the profile SAVED tab — read-only, no schema changes. */
export async function fetchProfileSavedMedia(userId: string): Promise<InstagramMediaItem[]> {
  const { createClient } = await import("@/utils/supabase/client");
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select("post_id, posts:post_id(id, media_url, post_type)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error || !data) return [];

  const items: InstagramMediaItem[] = [];
  for (const row of data as BookmarkRow[]) {
    const post = Array.isArray(row.posts) ? row.posts[0] : row.posts;
    if (!post?.id || !isUsableInstagramMediaUrl(post.media_url)) continue;
    items.push({
      id: post.id,
      url: post.media_url!,
      isVideo: post.post_type === "video",
    });
  }
  return items;
}
