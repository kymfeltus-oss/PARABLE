import {
  REEL_ACCEPT_MIME,
  REEL_MAX_BYTES,
  REEL_MAX_DURATION_SEC,
} from "./constants";

export type ReelValidationResult =
  | { ok: true; durationSec: number }
  | { ok: false; message: string };

function isAllowedReelMime(file: File): boolean {
  if (file.type === "video/mp4" || file.type === "video/quicktime") return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ext === "mp4" || ext === "mov";
}

export function getVideoDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      cleanup();
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Could not read video metadata."));
    };
    video.src = url;
  });
}

export async function validateReelVideoFile(file: File): Promise<ReelValidationResult> {
  if (!isAllowedReelMime(file)) {
    return { ok: false, message: "Only MP4 or MOV video files are supported." };
  }

  if (file.size > REEL_MAX_BYTES) {
    return { ok: false, message: "Video file exceeds our 100MB limit criteria." };
  }

  let durationSec = 0;
  try {
    durationSec = await getVideoDurationFromFile(file);
  } catch {
    return { ok: false, message: "Could not inspect video duration." };
  }

  if (durationSec > REEL_MAX_DURATION_SEC) {
    return {
      ok: false,
      message: `Reels must be ${REEL_MAX_DURATION_SEC} seconds or shorter (yours is ${Math.ceil(durationSec)}s).`,
    };
  }

  return { ok: true, durationSec };
}

export { REEL_ACCEPT_MIME, REEL_MAX_BYTES, REEL_MAX_DURATION_SEC };
