import { REALTIME_SUBSCRIBE_STATES } from "@supabase/realtime-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Matches `supabase.channel('fellowship-hub')` — subscribers on `/hub` show an instant toast. */
export const FELLOWSHIP_HUB_CHANNEL = "fellowship-hub";

export const FELLOWSHIP_HUB_STREAM_START_EVENT = "stream_start";

export type FellowshipHubStreamStartPayload = {
  username: string;
  userId: string;
  message: string;
};

/**
 * Broadcasts to everyone subscribed to {@link FELLOWSHIP_HUB_CHANNEL} (Realtime Broadcast).
 * Ensure Broadcast is enabled for this channel in Supabase → Realtime → settings.
 */
export function broadcastFellowshipHubStreamStart(
  supabase: SupabaseClient,
  payload: FellowshipHubStreamStartPayload,
): Promise<void> {
  const channel = supabase.channel(FELLOWSHIP_HUB_CHANNEL);

  return new Promise((resolve, reject) => {
    let settled = false;
    const done = (err?: Error) => {
      if (settled) return;
      settled = true;
      void supabase.removeChannel(channel);
      if (err) reject(err);
      else resolve();
    };

    const timeoutMs = 12_000;
    const t = setTimeout(() => {
      done(new Error("fellowship-hub broadcast: subscribe timed out"));
    }, timeoutMs);

    channel.subscribe((status, err) => {
      if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        void channel
          .send({
            type: "broadcast",
            event: FELLOWSHIP_HUB_STREAM_START_EVENT,
            payload,
          })
          .then((result) => {
            clearTimeout(t);
            if (result === "error" || result === "timed out") {
              done(new Error(`fellowship-hub broadcast send: ${result}`));
            } else {
              done();
            }
          })
          .catch((e: unknown) => {
            clearTimeout(t);
            done(e instanceof Error ? e : new Error(String(e)));
          });
        return;
      }

      if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR || status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
        clearTimeout(t);
        done(err ?? new Error(`fellowship-hub channel: ${status}`));
      }
    });
  });
}
