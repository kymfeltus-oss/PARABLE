import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Upload a post image or video to the public `avatars` bucket under `{userId}/posts/{uuid}.ext`.
 * Reuses the same bucket/policies as profile avatars so existing Storage RLS can allow it.
 */
function inferUploadContentType(file: File): string | undefined {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeByExt: Record<string, string> = {
    mov: "video/quicktime",
    mp4: "video/mp4",
    webm: "video/webm",
    m4v: "video/mp4",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeByExt[ext];
}

export async function uploadPostMediaFromFile(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ publicUrl: string } | { error: string }> {
  const raw = file.name.split(".").pop()?.toLowerCase() ?? "";
  const safe =
    ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm", "mov", "m4v"].includes(raw)
      ? raw
      : file.type.startsWith("video/")
        ? "mp4"
        : "jpg";
  const objectPath = `${userId}/posts/${crypto.randomUUID()}.${safe}`;

  const { error } = await supabase.storage.from("avatars").upload(objectPath, file, {
    upsert: false,
    contentType: inferUploadContentType(file),
  });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("avatars").getPublicUrl(objectPath);
  return { publicUrl: data.publicUrl };
}
