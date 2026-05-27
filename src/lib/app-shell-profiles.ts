import { isStreamingRoute } from "@/lib/is-streaming-route";

export type ShellProfile = "FULL_BLEED" | "CONSTRAINED_SCROLL" | "STANDARD_SCROLL";

/** @deprecated Prefer `getShellProfile` — kept for BottomNav and existing imports. */
export { isStreamingRoute };

/**
 * Parable Live module only: `/streamers`, `/watch/*`, `/stream/*`.
 * Full-bleed shell, header/ticker unmount, and `h-dvh` viewport lock apply here only.
 */
export function isFullBleedRoute(pathname: string | null | undefined): boolean {
  return isStreamingRoute(pathname);
}

/** Hide global ticker + MainHeader on streaming routes (phase-scoped). */
export function shouldHideGlobalTopStackForStreaming(
  pathname: string | null | undefined,
): boolean {
  return isFullBleedRoute(pathname);
}

/** Product shells that hide the global top stack outside the streaming module. */
export function shouldHideGlobalTopStack(pathname: string | null | undefined): boolean {
  const p = pathname ?? "";
  if (shouldHideGlobalTopStackForStreaming(p)) return true;
  return (
    p.startsWith("/my-sanctuary") ||
    p === "/profile" ||
    p.startsWith("/profile/") ||
    p.startsWith("/live-studio")
  );
}

export function getShellProfile(pathname: string | null | undefined): ShellProfile {
  if (isFullBleedRoute(pathname)) return "FULL_BLEED";
  const p = pathname ?? "";
  if (
    p.startsWith("/my-sanctuary") ||
    p === "/profile" ||
    p.startsWith("/profile/") ||
    p.startsWith("/sanctuary") ||
    p.startsWith("/messages") ||
    p.startsWith("/create") ||
    p.startsWith("/live") ||
    p.startsWith("/reels") ||
    p.startsWith("/live-studio")
  ) {
    return "CONSTRAINED_SCROLL";
  }
  return "STANDARD_SCROLL";
}

/** Viewport lock (`h-dvh`) — streaming module + existing constrained shells only. */
export function shellUsesViewportLock(pathname: string | null | undefined): boolean {
  const profile = getShellProfile(pathname);
  return profile === "FULL_BLEED" || profile === "CONSTRAINED_SCROLL";
}
