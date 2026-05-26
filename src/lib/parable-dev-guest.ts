/**
 * Preview without Supabase login.
 * Set NEXT_PUBLIC_PARABLE_DEV_GUEST=1 and optionally NEXT_PUBLIC_PARABLE_GUEST_HOSTS
 * (comma-separated hostnames). localhost / 127.0.0.1 are always allowed when the flag is on.
 */

const FLAG = "NEXT_PUBLIC_PARABLE_DEV_GUEST";
const HOSTS_FLAG = "NEXT_PUBLIC_PARABLE_GUEST_HOSTS";

export type ParableGuestProfile = {
  id: string;
  username: string;
  full_name: string;
  role: string;
  onboarding_complete: boolean;
};

export const PARABLE_GUEST_PROFILE: ParableGuestProfile = {
  id: "00000000-0000-4000-a000-000000000001",
  username: "kymfeltus",
  full_name: "Kym",
  role: "ceo",
  onboarding_complete: true,
};

function normalizeHost(host: string): string {
  return host.trim().toLowerCase();
}

function parseGuestHosts(): Set<string> {
  const raw = process.env[HOSTS_FLAG] ?? "";
  return new Set(
    raw
      .split(",")
      .map((h) => normalizeHost(h))
      .filter(Boolean),
  );
}

export function isAllowedParableGuestHost(host: string): boolean {
  const h = normalizeHost(host);
  if (!h) return false;
  if (h === "localhost" || h === "127.0.0.1") return true;
  return parseGuestHosts().has(h);
}

function isGuestFlagEnabled(): boolean {
  return process.env[FLAG] === "1";
}

/** Client-side check (login UI, redirects). Server uses isParableDevGuestAllowed. */
export function isParableDevGuestClientEnabled(): boolean {
  if (!isGuestFlagEnabled()) return false;
  if (typeof window === "undefined") return false;
  return isAllowedParableGuestHost(window.location.hostname);
}

function requestHost(req: { headers: Headers }): string {
  return (req.headers.get("host") ?? "").split(":")[0]?.trim().toLowerCase() ?? "";
}

/** True when this request may use the guest shell (no real session). */
export function isParableDevGuestAllowed(req: { headers: Headers }): boolean {
  if (!isGuestFlagEnabled()) return false;
  return isAllowedParableGuestHost(requestHost(req));
}

/** Server Components: read the incoming host from Next headers(). */
export async function isParableGuestActiveOnServer(): Promise<boolean> {
  if (!isGuestFlagEnabled()) return false;
  try {
    const { headers } = await import("next/headers");
    const host = (await headers()).get("host") ?? "";
    return isAllowedParableGuestHost(host.split(":")[0] ?? "");
  } catch {
    return false;
  }
}

export function getParableGuestUserId(): string {
  return PARABLE_GUEST_PROFILE.id;
}
