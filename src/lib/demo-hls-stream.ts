/**
 * Public HLS demo feed for localhost theatre preview (Big Buck Bunny / bipbop class assets).
 * Swap for IVS / Cloudflare Stream signed URLs in production.
 */
export const DEMO_HLS_STREAM_URL =
  "https://storage.googleapis.com/shaka-demo-assets/bbb-dark-truths-hls/hls.m3u8";

/** Fast MP4 loop when HLS fails or MSE is unavailable (same asset family as demo personas). */
export const DEMO_MP4_FALLBACK_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
