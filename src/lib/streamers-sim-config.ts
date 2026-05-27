import { isParableDevGuestClientEnabled } from "@/lib/parable-dev-guest";

/** Simulated live chat ticker — explicit flag or dev guest preview on localhost. */
export function isStreamersSimChatEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_STREAMERS_SIM_CHAT === "1") return true;
  return isParableDevGuestClientEnabled();
}
