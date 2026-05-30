/** Supabase email links must return through `/auth/callback` to establish a session. */
export function emailConfirmRedirectUrl(nextPath = "/my-sanctuary"): string {
  if (typeof window === "undefined") return "/auth/callback";
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
