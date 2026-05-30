/** WebRTC data-channel payloads from streamer cockpit → watch overlay. */
export const LIVEKIT_CELEBRATION_EVENT = "CELEBRATION_BURST" as const;

export type LiveKitCelebrationPayload = {
  eventType: typeof LIVEKIT_CELEBRATION_EVENT;
  emoji: string;
  sender?: string;
};

export function parseCelebrationPayload(raw: Uint8Array): LiveKitCelebrationPayload | null {
  try {
    const decoded = new TextDecoder().decode(raw);
    const parsed = JSON.parse(decoded) as LiveKitCelebrationPayload;
    if (parsed?.eventType !== LIVEKIT_CELEBRATION_EVENT || !parsed.emoji) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function encodeCelebrationPayload(emoji: string, sender = "STREAMER_HOST"): Uint8Array {
  const payload: LiveKitCelebrationPayload = {
    eventType: LIVEKIT_CELEBRATION_EVENT,
    emoji,
    sender,
  };
  return new TextEncoder().encode(JSON.stringify(payload));
}
