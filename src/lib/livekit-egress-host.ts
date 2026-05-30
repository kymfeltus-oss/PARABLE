import { getLiveKitApiKey, getLiveKitApiSecret, getLiveKitServerUrl } from "@/lib/livekit-env";
import { EgressClient } from "livekit-server-sdk";

/** LiveKit Egress REST API expects `https://` host, not `wss://`. */
export function liveKitUrlToEgressHost(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("wss://")) return `https://${trimmed.slice(6)}`;
  if (trimmed.startsWith("ws://")) return `http://${trimmed.slice(5)}`;
  return trimmed;
}

export function createLiveKitEgressClient(): EgressClient {
  const apiKey = getLiveKitApiKey();
  const apiSecret = getLiveKitApiSecret();
  if (!apiKey || !apiSecret) {
    throw new Error("Missing critical LiveKit credential variables.");
  }
  const host = liveKitUrlToEgressHost(
    process.env.LIVEKIT_HOST?.trim() || getLiveKitServerUrl(),
  );
  return new EgressClient(host, apiKey, apiSecret);
}
