import type { SupabaseClient } from "@supabase/supabase-js";

export function resolveProfileAvatarUrl(
  supabase: SupabaseClient,
  avatarUrl: string | null | undefined,
): string | null {
  const raw = avatarUrl?.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
    return raw;
  }
  const { data } = supabase.storage.from("avatars").getPublicUrl(raw);
  return data.publicUrl || null;
}
