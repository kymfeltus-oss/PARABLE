import type { APIRequestContext } from "@playwright/test";

/** Matches `PARABLE_GUEST_PROFILE.id` in src/lib/parable-dev-guest.ts */
export const GUEST_USER_ID = "00000000-0000-4000-a000-000000000001";

export const STREAMERS_HUB_PATH = "/streamers";
export const STREAMER_CREATOR_HUB_PATH = "/streamer-hub";
export const STREAMER_DASHBOARD_PATH = "/dashboard/streamers";

export type ScheduledBroadcast = {
  id: string;
  title: string;
  scheduled_start: string;
  estimated_duration_mins: number;
};

export function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

/** Future ISO start (avoids “past event” confusion in UI). */
export function futureScheduleStart(minutesFromNow = 120): string {
  const d = new Date(Date.now() + minutesFromNow * 60_000);
  return d.toISOString();
}

/**
 * Load broadcast schedule for the dev guest creator (requires service role on server).
 */
export async function fetchGuestSchedule(
  request: APIRequestContext,
  baseURL: string,
): Promise<{ schedule: ScheduledBroadcast[]; notice?: string; error?: string }> {
  const res = await request.get(
    `${baseURL}/api/broadcast/schedule?userId=${encodeURIComponent(GUEST_USER_ID)}`,
  );
  const payload = (await res.json().catch(() => ({}))) as {
    schedule?: ScheduledBroadcast[];
    notice?: string;
    error?: string;
  };
  return {
    schedule: payload.schedule ?? [],
    notice: payload.notice,
    error: payload.error ?? (res.ok() ? undefined : `HTTP ${res.status()}`),
  };
}

/**
 * Creates a broadcast_schedule row and ensures the guest creator profile exists.
 */
export async function seedGuestScheduleEvent(
  request: APIRequestContext,
  baseURL: string,
  title?: string,
): Promise<{ event: ScheduledBroadcast | null; error?: string }> {
  const res = await request.post(`${baseURL}/api/broadcast/schedule`, {
    data: {
      title: title ?? uniqueTitle("E2E Bible Study"),
      scheduled_start: futureScheduleStart(),
      estimated_duration_mins: 45,
    },
  });
  const payload = (await res.json().catch(() => ({}))) as {
    event?: ScheduledBroadcast;
    error?: string;
  };
  if (!res.ok()) {
    return { event: null, error: payload.error ?? `HTTP ${res.status()}` };
  }
  return { event: payload.event ?? null };
}

/** True when schedule API is wired (service role + Supabase). */
export function scheduleApiAvailable(result: { error?: string }): boolean {
  if (!result.error) return true;
  const msg = result.error.toLowerCase();
  return !msg.includes("service role") && !msg.includes("misconfiguration");
}
