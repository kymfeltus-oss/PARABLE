/**
 * Demo live playback for Parable Live theatre (localhost + discovery hero).
 * Black church worship / prayer / event clips (Mixkit). Swap for signed IVS URLs in production.
 */
import {
  DEFAULT_CHURCH_HERO_MP4,
  demoStreamMp4ForChannel,
  MIXKIT_CHURCH_WORSHIP_MP4,
} from "@/lib/black-church-demo-media";

/** @deprecated Name kept for existing imports — value is church-event MP4, not HLS. */
export const DEMO_HLS_STREAM_URL = DEFAULT_CHURCH_HERO_MP4;

/** Hero + player MP4 when direct playback is used. */
export const DEMO_MP4_FALLBACK_URL = MIXKIT_CHURCH_WORSHIP_MP4;

export { DEFAULT_CHURCH_HERO_MP4, demoStreamMp4ForChannel };
