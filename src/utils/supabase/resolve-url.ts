const PLACEHOLDER_URL_SNIPPETS = ["your-project.supabase.co", "example.supabase.co"];
const PLACEHOLDER_KEY_SNIPPETS = ["your-anon-key", "your_anon_key"];

/** Hostnames that are app/marketing sites, not Supabase REST/Auth APIs. */
const NON_SUPABASE_HOST_SNIPPETS = [
  "parableaccountant.com",
  "parablestream.com",
  "parablestreaming.com",
  "localhost",
  "127.0.0.1",
  "vercel.app",
];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob === "function"
        ? atob(normalized)
        : Buffer.from(normalized, "base64").toString("utf-8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function supabaseProjectRefFromAnonKey(anonKey: string): string | null {
  const payload = decodeJwtPayload(anonKey);
  const ref = payload?.ref;
  return typeof ref === "string" && ref.trim() ? ref.trim() : null;
}

export function isLikelySupabaseApiUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed.startsWith("https://")) return false;
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    if (host.endsWith(".supabase.co")) return true;
    if (host.includes("supabase")) return true;
    return false;
  } catch {
    return false;
  }
}

/** Prefer env URL when it looks like Supabase; otherwise derive https://{ref}.supabase.co from anon key. */
export function resolveSupabaseUrl(
  envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
): string {
  const trimmedEnv = envUrl.trim().replace(/\/$/, "");
  if (trimmedEnv && isLikelySupabaseApiUrl(trimmedEnv)) return trimmedEnv;

  const ref = supabaseProjectRefFromAnonKey(anonKey);
  if (ref) return `https://${ref}.supabase.co`;

  return trimmedEnv;
}

/** Use in auth flows to show a clear error when Supabase is not configured. */
export function getSupabaseConfigError(): string | null {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const resolved = resolveSupabaseUrl(envUrl, key);

  if (!envUrl || !key) {
    return "Server is not configured for sign-in. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";
  }
  if (!resolved.startsWith("https://")) {
    return "Invalid Supabase URL. It must start with https://";
  }

  const urlLower = envUrl.toLowerCase();
  const keyLower = key.toLowerCase();
  if (PLACEHOLDER_URL_SNIPPETS.some((s) => urlLower.includes(s))) {
    return "Supabase URL still looks like a placeholder. Use https://YOUR_REF.supabase.co from Supabase Dashboard → Settings → API.";
  }
  if (PLACEHOLDER_KEY_SNIPPETS.some((s) => keyLower.includes(s)) || key.length < 80) {
    return "Supabase anon key is missing or still a placeholder. Copy the anon public key from Supabase Dashboard → Settings → API.";
  }

  if (
    !isLikelySupabaseApiUrl(envUrl) &&
    NON_SUPABASE_HOST_SNIPPETS.some((s) => urlLower.includes(s))
  ) {
    const ref = supabaseProjectRefFromAnonKey(key);
    return `NEXT_PUBLIC_SUPABASE_URL is set to your app website (${envUrl}), not Supabase. Use ${ref ? `https://${ref}.supabase.co` : "https://YOUR_REF.supabase.co"} from Supabase Dashboard → Settings → API, then restart dev.`;
  }

  return null;
}
