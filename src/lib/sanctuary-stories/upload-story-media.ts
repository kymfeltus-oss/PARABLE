import type { SupabaseClient } from "@supabase/supabase-js";
import { STORY_MAX_BYTES } from "./constants";
import type { StoryMediaType } from "./types";

function inferMediaType(file: File): StoryMediaType {
  if (file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name)) {
    return "video";
  }
  return "image";
}

function inferContentType(file: File): string | undefined {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    mov: "video/quicktime",
    mp4: "video/mp4",
    webm: "video/webm",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return map[ext];
}

export async function uploadStoryMediaFromFile(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<{ publicUrl: string; mediaType: StoryMediaType } | { error: string }> {
  if (file.size > STORY_MAX_BYTES) {
    return { error: "Story media must be 10 MB or smaller." };
  }

  const mediaType = inferMediaType(file);
  const raw = file.name.split(".").pop()?.toLowerCase() ?? "";
  const safe = ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm", "mov", "m4v"].includes(raw)
    ? raw
    : mediaType === "video"
      ? "mp4"
      : "jpg";

  const objectPath = `${userId}/stories/${crypto.randomUUID()}.${safe}`;

  const { error } = await supabase.storage.from("avatars").upload(objectPath, file, {
    upsert: false,
    contentType: inferContentType(file),
  });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("avatars").getPublicUrl(objectPath);
  return { publicUrl: data.publicUrl, mediaType };
}
