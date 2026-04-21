/**
 * Local preview without Supabase login.
 * Set NEXT_PUBLIC_PARABLE_DEV_GUEST=1 in .env.local only; open http://localhost:3003 (or 127.0.0.1).
 * Uses NEXT_PUBLIC_* so the Edge `proxy` bundle can read it (non-public vars are often missing there).
 * Remove the flag before shipping a public production build.
 */

const FLAG = "NEXT_PUBLIC_PARABLE_DEV_GUEST";

export type ParableGuestProfile = {
  id: string;
  username: string;
  full_name: string;
  role: string;
  onboarding_complete: boolean;
};

export const PARABLE_GUEST_PROFILE: ParableGuestProfile = {
  id: "00000000-0000-4000-a000-000000000001",
  username: "local-guest",
  full_name: "Local preview",
  role: "member",
  onboarding_complete: true,
};

function requestHost(req: { headers: Headers }): string {
  return (req.headers.get("host") ?? "").split(":")[0]?.trim().toLowerCase() ?? "";
}

/** True when this request may use the guest shell (no real session). */
export function isParableDevGuestAllowed(req: { headers: Headers }): boolean {
  if (process.env[FLAG] !== "1") return false;
  const host = requestHost(req);
  return host === "localhost" || host === "127.0.0.1";
}
