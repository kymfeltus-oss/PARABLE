import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Upload a browser data URL to the public `avatars` bucket under `{userId}/avatar.{ext}`.
 * Requires Storage RLS policies (see supabase/storage-avatars-policies.sql).
 */
export async function uploadUserAvatarFromDataUrl(
  supabase: SupabaseClient,
  userId: string,
  dataUrl: string
): Promise<{ publicUrl: string; objectPath: string } | { error: string }> {
  const trimmed = dataUrl.trim();
  const match = /^data:([^;]+);base64,(.*)$/i.exec(trimmed);
  if (!match) return { error: 'Invalid image data' };

  const mime = match[1].trim();
  const base64 = match[2].replace(/\s/g, '');
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    return { error: 'Invalid image encoding' };
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const ext = /png/i.test(mime) ? 'png' : /webp/i.test(mime) ? 'webp' : 'jpg';
  const objectPath = `${userId}/avatar.${ext}`;
  const blob = new Blob([bytes], { type: mime });

  const { error } = await supabase.storage.from('avatars').upload(objectPath, blob, {
    upsert: true,
    contentType: mime,
  });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from('avatars').getPublicUrl(objectPath);
  return { publicUrl: data.publicUrl, objectPath };
}

/**
 * If `profiles.avatar_url` was never set but Storage already has `{userId}/avatar.{ext}`
 * from a prior upload, return that public URL (used to repair header / profile display).
 */
function probeImageLoads(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const done = (ok: boolean) => {
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = `${url}${url.includes('?') ? '&' : '?'}_probe=${Date.now()}`;
    window.setTimeout(() => done(false), 10000);
  });
}

export async function discoverStoredAvatarPublicUrl(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  for (const ext of ['jpg', 'png', 'webp'] as const) {
    const objectPath = `${userId}/avatar.${ext}`;
    const url = supabase.storage.from('avatars').getPublicUrl(objectPath).data.publicUrl;
    try {
      const head = await fetch(url, { method: 'HEAD', mode: 'cors', cache: 'no-store' });
      if (head.ok) return url;
    } catch {
      /* HEAD may fail CORS; try image decode */
    }
    if (await probeImageLoads(url)) return url;
  }
  return null;
}
