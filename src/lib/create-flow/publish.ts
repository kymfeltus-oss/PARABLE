import { createClient } from "@/utils/supabase/client";
import { publishSanctuaryPost } from "@/app/my-sanctuary/actions";
import { buildPostContent, type PostStudioMeta } from "@/lib/post-content-meta";
import { blobToUploadFile, compressImageWithFilter } from "@/lib/post-studio-compress";
import { type VisualFilter } from "@/lib/post-studio-filters";
import { uploadPostMediaFromFile } from "@/lib/post-media";
import { SANCTUARY_MEDIA_MAX_BYTES } from "@/lib/sanctuary-media-limits";

export type PublishPostInput = {
  file: File;
  creationType: "post" | "reel";
  caption: string;
  locationTag?: string;
  allowComments?: boolean;
  hideLikes?: boolean;
  filter?: VisualFilter;
};

function resolvePostType(creationType: "post" | "reel", file: File): string {
  const isVideo =
    file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name.split("?")[0] ?? "");
  if (creationType === "reel" || isVideo) return "video";
  return "image";
}

export async function publishFeedPost(input: PublishPostInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return { ok: false, error: "Please sign in to publish." };

  const isVideo =
    input.file.type.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v)$/i.test(input.file.name.split("?")[0] ?? "");

  let uploadFile = input.file;
  if (!isVideo && input.filter) {
    const blob = await compressImageWithFilter(input.file, input.filter);
    uploadFile = blobToUploadFile(blob, input.file.name);
    if (uploadFile.size > SANCTUARY_MEDIA_MAX_BYTES) {
      return { ok: false, error: "Compressed image is still too large." };
    }
  } else if (isVideo && input.file.size > SANCTUARY_MEDIA_MAX_BYTES) {
    return { ok: false, error: "Video exceeds size limit." };
  }

  const up = await uploadPostMediaFromFile(supabase, user.id, uploadFile);
  if ("error" in up) return { ok: false, error: up.error };

  const meta: PostStudioMeta = {
    allowComments: input.allowComments ?? true,
    hideLikes: input.hideLikes ?? false,
    filterId: input.filter?.id ?? "normal",
    location: input.locationTag?.trim() || undefined,
    creationType: input.creationType,
  };

  const saved = await publishSanctuaryPost({
    mediaUrl: up.publicUrl,
    content: buildPostContent(input.caption, meta),
    postType: resolvePostType(input.creationType, input.file),
  });

  if (!saved.ok) return { ok: false, error: saved.error };
  window.dispatchEvent(new CustomEvent("parable:sanctuary-posted"));
  return { ok: true };
}

export async function publishStoryFile(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "Story media must be 10 MB or smaller." };
  }

  const form = new FormData();
  form.append("media", file);

  const res = await fetch("/api/stories", { method: "POST", body: form });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error ?? "Story upload failed." };
  }

  window.dispatchEvent(new CustomEvent("parable:story-published"));
  return { ok: true };
}
