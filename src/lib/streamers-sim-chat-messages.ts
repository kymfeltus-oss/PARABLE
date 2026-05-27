import { getStreamersSimChatSpeakers } from "@/lib/streamers-demo-simulation";

const WORSHIP = [
  "This set is beautiful",
  "Praise break soon?",
  "Amen 🙏",
  "Such a powerful testimony",
] as const;

const CREATIVE = [
  "Clean plays",
  "Love the overlay layout",
  "Audio sounds crisp",
  "Fire stream",
] as const;

const HYPE = [
  "Let's go!",
  "Who else is tuning in tonight?",
  "Incredible layout structure",
] as const;

const POOL = [...WORSHIP, ...CREATIVE, ...HYPE];

let speakerCache: ReturnType<typeof getStreamersSimChatSpeakers> | null = null;

function speakers() {
  if (!speakerCache) speakerCache = getStreamersSimChatSpeakers();
  return speakerCache;
}

export function pickRandomSimChatLine(): { user: string; text: string; avatarUrl?: string } {
  const list = speakers();
  const speaker = list[Math.floor(Math.random() * list.length)] ?? list[0];
  const text = POOL[Math.floor(Math.random() * POOL.length)] ?? POOL[0];
  return {
    user: speaker?.displayName ?? "Guest",
    text,
    avatarUrl: speaker?.avatarUrl || undefined,
  };
}

export const SIM_CHAT_MIN_DELAY_MS = 2500;
export const SIM_CHAT_MAX_DELAY_MS = 5500;
export const SIM_CHAT_MAX_MESSAGES = 80;
