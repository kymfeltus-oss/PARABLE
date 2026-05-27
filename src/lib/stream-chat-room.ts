import { getDemoPersonaById, getDemoPersonaByUsername } from "@/lib/demo-personas";
import { LIVE_RAIL_CHAT_ROOM_IDS } from "@/lib/streamers-demo-simulation";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves spotlight / rail `streamKey` to a `stream_chat_messages.stream_id` (profiles UUID).
 */
export function resolveStreamChatRoomId(streamKey: string | null | undefined): string | null {
  if (!streamKey?.trim()) return null;
  const key = streamKey.trim();
  if (UUID_RE.test(key)) return key;
  const byId = getDemoPersonaById(key);
  if (byId?.id) return byId.id;
  const byUsername = getDemoPersonaByUsername(key);
  if (byUsername?.id) return byUsername.id;
  return LIVE_RAIL_CHAT_ROOM_IDS[key] ?? null;
}
