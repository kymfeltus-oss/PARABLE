/**
 * Simulated fellowship accounts in `public.profiles` (usernames).
 * Order: Sarah → James → Michael (Fellowship Circles + Suggested Followers).
 */
export const SIMULATION_PROFILE_USERNAMES = ["sister_sarah", "pastor_james", "michael"] as const;

export type SimulationUsername = (typeof SIMULATION_PROFILE_USERNAMES)[number];

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

/** Fixed order: sister_sarah → pastor_james → michael (omit missing). */
export function orderSimulationProfiles<T extends { username?: string | null }>(rows: T[]): T[] {
  const byUser = indexProfilesByUsername(rows);
  return SIMULATION_PROFILE_USERNAMES.map((u) => byUser.get(u)).filter((x): x is T => x != null);
}
