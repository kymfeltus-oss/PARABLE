import type { SupabaseClient } from "@supabase/supabase-js";
import { REELS_AVATARS_FALLBACK_BUCKET, REELS_BUCKET } from "./constants";

function inferVideoContentType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ext === "mov" ? "video/quicktime" : "video/mp4";
}

async function uploadBlob(
  supabase: SupabaseClient,
  bucket: string,
  objectPath: string,
  body: Blob | File,
  contentType: string,
): Promise<{ publicUrl: string } | { error: string }> {
  const { error } = await supabase.storage.from(bucket).upload(objectPath, body, {
    upsert: false,
    contentType,
  });
  if (error) return { error: error.message };
  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return { publicUrl: data.publicUrl };
}

async function uploadWithBucketFallback(
  supabase: SupabaseClient,
  userId: string,
  folder: "videos" | "thumbnails",
  body: Blob | File,
  contentType: string,
  ext: string,
): Promise<{ publicUrl: string } | { error: string }> {
  const objectPath = `${userId}/reels/${folder}/${crypto.randomUUID()}.${ext}`;

  const primary = await uploadBlob(supabase, REELS_BUCKET, objectPath, body, contentType);
  if (!("error" in primary)) return primary;

  const msg = primary.error.toLowerCase();
  if (!msg.includes("bucket") && !msg.includes("not found")) {
    return primary;
  }

  return uploadBlob(supabase, REELS_AVATARS_FALLBACK_BUCKET, objectPath, body, contentType);
}

export async function uploadReelMediaFromFiles(
  supabase: SupabaseClient,
  userId: string,
  videoFile: File,
  thumbnailBlob: Blob,
): Promise<{ videoUrl: string; thumbnailUrl: string } | { error: string }> {
  const videoExt = videoFile.name.split(".").pop()?.toLowerCase() === "mov" ? "mov" : "mp4";

  const [videoResult, thumbResult] = await Promise.all([
    uploadWithBucketFallback(
      supabase,
      userId,
      "videos",
      videoFile,
      inferVideoContentType(videoFile),
      videoExt,
    ),
    uploadWithBucketFallback(supabase, userId, "thumbnails", thumbnailBlob, "image/jpeg", "jpg"),
  ]);

  if ("error" in videoResult) return videoResult;
  if ("error" in thumbResult) return thumbResult;

  return { videoUrl: videoResult.publicUrl, thumbnailUrl: thumbResult.publicUrl };
}
