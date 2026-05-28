/**
 * Curated demo media for Parable Live — Black church services, gospel worship,
 * revivals, prayer rooms, and Christian event footage (Unsplash + Mixkit).
 */

/** Build a cropped Unsplash CDN URL (free to use per Unsplash License). */
export function unsplashPhoto(photoId: string, width: number, height: number): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

/** Mixkit stock clips — worship, prayer, and church interiors. */
export const MIXKIT_CHURCH_WORSHIP_MP4 =
  "https://assets.mixkit.co/videos/1514/1514-720.mp4";

export const MIXKIT_CHRISTIAN_PRAYER_GROUP_MP4 =
  "https://assets.mixkit.co/videos/5901/5901-720.mp4";

export const MIXKIT_COUPLE_PRAYING_CHURCH_MP4 =
  "https://assets.mixkit.co/videos/46481/46481-720.mp4";

export const MIXKIT_CHURCH_INTERIOR_MP4 =
  "https://assets.mixkit.co/videos/20953/20953-720.mp4";

export const MIXKIT_PRAISE_HANDS_CONCERT_MP4 =
  "https://assets.mixkit.co/videos/32587/32587-720.mp4";

/** Default hero / offline theatre loop. */
export const DEFAULT_CHURCH_HERO_MP4 = MIXKIT_CHURCH_WORSHIP_MP4;

const CATEGORY_PHOTOS: Record<string, string> = {
  worship: "photo-1667644585884-31b1710542d2",
  prayer: "photo-1529156069898-49954e8b0f0f",
  testimonies: "photo-1493225457124-a3eb161ffa5f",
  study: "photo-1504052434569-70ad5836df57",
  revival: "photo-1507692049790-de58290a4334",
  gaming: "photo-1516280440614-37939bbacd81",
  irl: "photo-1576092764395-0b47a0f0c4e5",
  music: "photo-1511678785734-4b8f4b8c8e0e",
};

const STREAM_PHOTOS: Record<string, string> = {
  lr1: "photo-1667644585884-31b1710542d2",
  lr2: "photo-1529156069898-49954e8b0f0f",
  lr3: "photo-1493225457124-a3eb161ffa5f",
  lr4: "photo-1507692049790-de58290a4334",
  lr5: "photo-1576092764395-0b47a0f0c4e5",
  lr6: "photo-1504052434569-70ad5836df57",
  kingdom_gamer: "photo-1516280440614-37939bbacd81",
  prophetic_voices: "photo-1529156069898-49954e8b0f0f",
};

const PERSONA_PHOTOS: Record<string, string> = {
  gospel_vibe: STREAM_PHOTOS.lr1,
  sister_sarah: STREAM_PHOTOS.lr2,
  prophetic_voices: STREAM_PHOTOS.lr3,
  pastor_james: STREAM_PHOTOS.lr4,
  kingdom_gamer: STREAM_PHOTOS.kingdom_gamer,
};

const STREAM_VIDEOS: Record<string, string> = {
  lr1: MIXKIT_CHURCH_WORSHIP_MP4,
  lr2: MIXKIT_COUPLE_PRAYING_CHURCH_MP4,
  lr3: MIXKIT_CHRISTIAN_PRAYER_GROUP_MP4,
  lr4: MIXKIT_PRAISE_HANDS_CONCERT_MP4,
  lr5: MIXKIT_CHURCH_INTERIOR_MP4,
  lr6: MIXKIT_COUPLE_PRAYING_CHURCH_MP4,
  kingdom_gamer: MIXKIT_PRAISE_HANDS_CONCERT_MP4,
  prophetic_voices: MIXKIT_CHRISTIAN_PRAYER_GROUP_MP4,
};

const PERSONA_VIDEOS: Record<string, string> = {
  gospel_vibe: STREAM_VIDEOS.lr1,
  sister_sarah: STREAM_VIDEOS.lr2,
  prophetic_voices: STREAM_VIDEOS.lr3,
  pastor_james: STREAM_VIDEOS.lr4,
  kingdom_gamer: STREAM_VIDEOS.kingdom_gamer,
};

const DEFAULT_STREAM_PHOTO = "photo-1667644585884-31b1710542d2";

export function categoryCoverPhoto(categoryId: string, width = 480, height = 640): string {
  const id = CATEGORY_PHOTOS[categoryId] ?? DEFAULT_STREAM_PHOTO;
  return unsplashPhoto(id, width, height);
}

export function streamThumbnailPhoto(streamId: string, width = 640, height = 360): string {
  const id =
    STREAM_PHOTOS[streamId] ?? PERSONA_PHOTOS[streamId] ?? DEFAULT_STREAM_PHOTO;
  return unsplashPhoto(id, width, height);
}

export function demoStreamMp4ForChannel(channelId: string): string {
  return (
    STREAM_VIDEOS[channelId] ?? PERSONA_VIDEOS[channelId] ?? DEFAULT_CHURCH_HERO_MP4
  );
}
