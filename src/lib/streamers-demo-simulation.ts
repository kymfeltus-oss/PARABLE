/**
 * Single demo simulation for Parable Live discovery (/streamers), API mock, chat FK, and HLS hero.
 * Rail ids (`lr1`…`lr6`) stay stable for watch routes; personas match `demo-personas` + seed SQL.
 */
import {
  DEMO_PERSONA_IDS,
  getDemoPersonaByUsername,
  type DemoPersonaUsername,
} from "@/lib/demo-personas";
import { DEMO_HLS_STREAM_URL } from "@/lib/demo-hls-stream";
import type { StreamerProfileRecord } from "@/lib/streamers-types";

export { DEMO_HLS_STREAM_URL };

export type StreamersDemoSlot = {
  /** Spotlight / watch key (`lr1` or persona username / UUID). */
  id: string;
  persona: DemoPersonaUsername;
  streamTitle: string;
  liveCategory: string;
  currentViewers: number;
  /** When true, always shown as live in the hub (overrides persona flag). */
  forceLive?: boolean;
};

/** Left-rail + chat mapping — keep ids aligned with `resolveStreamChatRoomId`. */
export const STREAMERS_LIVE_RAIL_SLOTS: StreamersDemoSlot[] = [
  {
    id: "lr1",
    persona: "gospel_vibe",
    streamTitle: "WORSHIP NIGHT LIVE",
    liveCategory: "WORSHIP",
    currentViewers: 3200,
    forceLive: true,
  },
  {
    id: "lr2",
    persona: "sister_sarah",
    streamTitle: "PRAYER ROOM",
    liveCategory: "PRAYER",
    currentViewers: 982,
    forceLive: true,
  },
  {
    id: "lr3",
    persona: "prophetic_voices",
    streamTitle: "TESTIMONY STREAM",
    liveCategory: "TESTIFY",
    currentViewers: 438,
    forceLive: true,
  },
  {
    id: "lr4",
    persona: "pastor_james",
    streamTitle: "REVIVAL NIGHT",
    liveCategory: "REVIVAL",
    currentViewers: 1800,
    forceLive: true,
  },
  {
    id: "lr5",
    persona: "kingdom_gamer",
    streamTitle: "KINGDOM BUSINESS",
    liveCategory: "KINGDOM",
    currentViewers: 611,
    forceLive: true,
  },
  {
    id: "lr6",
    persona: "sister_sarah",
    streamTitle: "DELIVERANCE ROOM",
    liveCategory: "DELIVERANCE",
    currentViewers: 721,
    forceLive: true,
  },
];

/** Extra grid tiles (persona id keys — chat + profiles resolve via demo UUID). */
export const STREAMERS_DISCOVERY_EXTRA_SLOTS: StreamersDemoSlot[] = [
  {
    id: "kingdom_gamer",
    persona: "kingdom_gamer",
    streamTitle: "Gaming for Ministry",
    liveCategory: "GAMING",
    currentViewers: 980,
    forceLive: true,
  },
  {
    id: "prophetic_voices",
    persona: "prophetic_voices",
    streamTitle: "Global Prayer Watch",
    liveCategory: "PRAYER",
    currentViewers: 1100,
    forceLive: true,
  },
];

/** Maps rail keys → `profiles.id` for `stream_chat_messages` (see `supabase/seed-demo-personas.sql`). */
export const LIVE_RAIL_CHAT_ROOM_IDS: Record<string, string> = Object.fromEntries(
  STREAMERS_LIVE_RAIL_SLOTS.map((slot) => [slot.id, DEMO_PERSONA_IDS[slot.persona]]),
);

function slotToRecord(slot: StreamersDemoSlot): StreamerProfileRecord {
  const persona = getDemoPersonaByUsername(slot.persona);
  if (!persona) {
    throw new Error(`Missing demo persona: ${slot.persona}`);
  }
  const live = slot.forceLive ?? persona.is_live;
  return {
    id: slot.id,
    username: persona.full_name,
    profilePicture: persona.avatar_url,
    streamTitle: slot.streamTitle,
    currentViewers: slot.currentViewers,
    liveCategory: slot.liveCategory,
    status: live ? "live" : "offline",
  };
}

/** Primary recommended-channel list (sidebar + API default). */
export function getStreamersDemoSimulation(): StreamerProfileRecord[] {
  return STREAMERS_LIVE_RAIL_SLOTS.map(slotToRecord);
}

/** Additional recommended-stream grid entries using the same persona simulation. */
export function getStreamersDemoDiscoveryExtras(): StreamerProfileRecord[] {
  const railIds = new Set(STREAMERS_LIVE_RAIL_SLOTS.map((s) => s.id));
  return STREAMERS_DISCOVERY_EXTRA_SLOTS.filter((s) => !railIds.has(s.id)).map(slotToRecord);
}

/** Full discovery payload for `/api/streamers` mock mode. */
export function getAllStreamersDemoRecords(): StreamerProfileRecord[] {
  const seen = new Set<string>();
  const out: StreamerProfileRecord[] = [];
  for (const row of [...getStreamersDemoSimulation(), ...getStreamersDemoDiscoveryExtras()]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}
