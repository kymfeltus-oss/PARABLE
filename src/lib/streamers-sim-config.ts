import { isParableDevGuestClientEnabled } from "@/lib/parable-dev-guest";

/** Simulated live chat ticker — explicit flag, localhost guest, or local dev build. */
export function isStreamersSimChatEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_STREAMERS_SIM_CHAT === "1") return true;
  if (process.env.NODE_ENV === "development") return true;
  return isParableDevGuestClientEnabled();
}
