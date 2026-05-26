import type { SupabaseClient } from '@supabase/supabase-js';

/** Standalone key so signup photo survives even if full pending JSON hits quota. */
export function pendingAvatarOnlyStorageKey(userId: string) {
  return `parable:pending-avatar-only:${userId}`;
}

export function clearPendingAvatarKeys(
  userId: string,
  emailKey: string | null,
  pendingAvatarKey: string | null
) {
  try {
    window.localStorage.removeItem(pendingAvatarOnlyStorageKey(userId));
    window.localStorage.removeItem(`parable:pending-profile-id:${userId}`);
    if (emailKey) window.localStorage.removeItem(`parable:pending-profile:${emailKey}`);
    if (pendingAvatarKey) window.localStorage.removeItem(pendingAvatarKey);
  } catch {
    /* ignore */
  }
}

/**
 * Save avatar public URL without touching optional columns (e.g. `role`) so RLS/schema mismatches don't break uploads.
 */
export async function persistAvatarPublicUrlToProfile(
  supabase: SupabaseClient,
  userId: string,
  publicUrl: string,
  defaults: { username: string; full_name: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: selErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (selErr) return { ok: false, error: selErr.message };

  const now = new Date().toISOString();

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: now })
      .eq("id", userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    username: defaults.username,
    full_name: defaults.full_name,
    avatar_url: publicUrl,
    onboarding_complete: true,
    updated_at: now,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
