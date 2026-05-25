import { getDemoPersonaByUsername } from "@/lib/demo-personas";

/**
 * Demo fellowship accounts in `public.profiles` (usernames).
 * Shared across Stories, Suggested Followers, and Sanctuary home feed.
 * Falls back to static personas in `demo-personas.ts` when rows are missing.
 */
export const SIMULATION_PROFILE_USERNAMES = [
  "pastor_james",
  "sister_sarah",
  "gospel_vibe",
  "kingdom_gamer",
  "prophetic_voices",
] as const;

export type SimulationUsername = (typeof SIMULATION_PROFILE_USERNAMES)[number];

export type SimulationProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_live?: boolean | null;
};

export function normalizeProfileUsername(value: string | null | undefined): string {
  return (value ?? "").replace(/^@/, "").trim().toLowerCase();
}

/** Map each row by normalized username for lookup. */
export function indexProfilesByUsername<T extends { username?: string | null }>(
  rows: T[],
): Map<string, T> {
  const m = new Map<string, T>();
  for (const row of rows) {
    const k = normalizeProfileUsername(row.username ?? undefined);
    if (k) m.set(k, row);
  }
  return m;
}

/** Fixed demo order — DB row wins; static persona fills gaps. */
export function resolveSimulationProfiles<T extends { username?: string | null }>(
  rows: T[],
): SimulationProfileRow[] {
  const byUser = indexProfilesByUsername(rows);
  const out: SimulationProfileRow[] = [];
  for (const username of SIMULATION_PROFILE_USERNAMES) {
    const db = byUser.get(username);
    if (db && "id" in db && typeof (db as { id?: unknown }).id === "string") {
      const row = db as T & { id: string };
      const demo = getDemoPersonaByUsername(username);
      out.push({
        id: row.id,
        username: row.username ?? username,
        full_name: (row as { full_name?: string | null }).full_name ?? demo?.full_name ?? null,
        avatar_url: demo?.avatar_url ?? null,
        is_live: demo?.is_live ?? (row as { is_live?: boolean | null }).is_live ?? null,
      });
      continue;
    }
    const demo = getDemoPersonaByUsername(username);
    if (demo) {
      out.push({
        id: demo.id,
        username: demo.username,
        full_name: demo.full_name,
        avatar_url: demo.avatar_url,
        is_live: demo.is_live,
      });
    }
  }
  return out;
}

/** @deprecated Use {@link resolveSimulationProfiles} for DB + demo merge. */
export function orderSimulationProfiles<T extends { username?: string | null }>(rows: T[]): T[] {
  const byUser = indexProfilesByUsername(rows);
  return SIMULATION_PROFILE_USERNAMES.map((u) => byUser.get(u)).filter((x): x is T => x != null);
}
