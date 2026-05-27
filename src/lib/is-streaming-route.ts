const STREAMING_PREFIXES = ["/streamers", "/watch", "/stream"] as const;

/** Full-bleed Parable Live shell: discovery, watch room, hybrid stream profile. */
export function isStreamingRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return STREAMING_PREFIXES.some((route) => {
    if (route === "/stream") {
      return pathname === "/stream" || pathname.startsWith("/stream/");
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}
