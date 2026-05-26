export const REELS_BUCKET = "reels";
export const REELS_AVATARS_FALLBACK_BUCKET = "avatars";

export const REEL_MAX_BYTES = 100 * 1024 * 1024;
export const REEL_MAX_DURATION_SEC = 60;

export const REEL_ACCEPT_MIME = "video/mp4,video/quicktime";

export const REELS_REFRESH_EVENT = "parable:reels-refresh";

export const REEL_VISIBILITY_THRESHOLD = 0.8;

export const REELS_SCHEMA_SETUP_HINT =
  "Run supabase/schema-reels.sql in the Supabase SQL Editor and create a public `reels` storage bucket.";
