/** PARABLE LiveKit Cloud edge — matches Vercel `LIVEKIT_URL` when public env is unset. */
export const LIVEKIT_CLOUD_WSS = "wss://parable-gkh2cjih.livekit.cloud";

/**
 * WebRTC URL for browser clients (`LiveKitRoom`, `LiveVideoPlayer`).
 * Set `NEXT_PUBLIC_LIVEKIT_URL` in Vercel to the same value as `LIVEKIT_URL`.
 */
export function getLiveKitClientUrl(): string {
  return process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim() || LIVEKIT_CLOUD_WSS;
}

/**
 * Edge URL for API routes and server jobs.
 * Prefers server-only `LIVEKIT_URL` (Vercel), then public mirror.
 */
export function getLiveKitServerUrl(): string {
  const server = process.env.LIVEKIT_URL?.trim();
  const pub = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim();
  return server || pub || LIVEKIT_CLOUD_WSS;
}

export function getLiveKitApiKey(): string | undefined {
  return process.env.LIVEKIT_API_KEY?.trim();
}

export function getLiveKitApiSecret(): string | undefined {
  return process.env.LIVEKIT_API_SECRET?.trim();
}

export function assertLiveKitServerCredentials(): { ok: true } | { ok: false; error: string } {
  if (!getLiveKitApiKey() || !getLiveKitApiSecret()) {
    return { ok: false, error: "Server misconfigured: LiveKit credentials missing" };
  }
  return { ok: true };
}
