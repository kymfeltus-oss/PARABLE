/**
 * Canonical reels table column map — keep Supabase `.select()` / `.insert()` in sync.
 *
 * Database (snake_case)     Frontend (camelCase)   Type
 * ------------------------   --------------------   ---------------------------
 * id                         id                     UUID (auto-generated)
 * user_id                    author.id / userId     UUID (FK → profiles.id, same as auth.users.id)
 * video_url                  videoUrl               TEXT (public storage CDN URL)
 * thumbnail_url              thumbnailUrl           TEXT (public storage CDN URL)
 * caption                    caption                TEXT (nullable)
 */

export const REELS_TABLE = "reels" as const;

/** Core columns required by the reels feed contract. */
export const REELS_CORE_DB_COLUMNS = [
  "id",
  "user_id",
  "video_url",
  "thumbnail_url",
  "caption",
] as const;

/** Extended columns used by the immersive feed UI. */
export const REELS_EXTENDED_DB_COLUMNS = [
  "audio_title",
  "likes_count",
  "comments_count",
  "created_at",
] as const;

export const REELS_FEED_SELECT =
  [...REELS_CORE_DB_COLUMNS, ...REELS_EXTENDED_DB_COLUMNS].join(", ");

export type ReelsCoreDbColumn = (typeof REELS_CORE_DB_COLUMNS)[number];
export type ReelsExtendedDbColumn = (typeof REELS_EXTENDED_DB_COLUMNS)[number];
export type ReelsDbColumn = ReelsCoreDbColumn | ReelsExtendedDbColumn;

/** Raw row shape returned by Supabase for REELS_FEED_SELECT. */
export type ReelsDbRow = {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url: string;
  caption: string | null;
  audio_title: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

/** Client-safe feed item — camelCase keys only; never sent to Supabase as column names. */
export type ReelsFeedItemFields = {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  audioTitle: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
};

export function mapReelsDbRowToFeedFields(row: ReelsDbRow): ReelsFeedItemFields {
  return {
    id: row.id,
    userId: row.user_id,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url,
    caption: row.caption?.trim() ?? "",
    audioTitle: row.audio_title?.trim() || "Original Audio",
    likesCount: row.likes_count ?? 0,
    commentsCount: row.comments_count ?? 0,
    createdAt: row.created_at,
  };
}

export type ReelsInsertPayload = {
  user_id: string;
  video_url: string;
  thumbnail_url: string;
  caption: string | null;
  audio_title?: string;
};

export function buildReelsInsertPayload(input: {
  userId: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption?: string;
  audioTitle?: string;
}): ReelsInsertPayload {
  return {
    user_id: input.userId,
    video_url: input.videoUrl,
    thumbnail_url: input.thumbnailUrl,
    caption: input.caption?.trim() ? input.caption.trim() : null,
    audio_title: input.audioTitle?.trim() || "Original Audio",
  };
}
