/** Shared client-side media limits for profile posts, reels, and stories. */
export const SANCTUARY_MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const SANCTUARY_MEDIA_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

export function sanctuaryMediaTooLarge(bytes: number): boolean {
  return bytes > SANCTUARY_MEDIA_MAX_BYTES;
}

export function sanctuaryMediaLimitLabel(): string {
  return "10 MB";
}

export function isSanctuaryVideoFile(file: File): boolean {
  return (
    file.type.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v)$/i.test((file.name.split("?")[0] ?? "").toLowerCase())
  );
}
