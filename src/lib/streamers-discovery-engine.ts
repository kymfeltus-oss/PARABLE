import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEMO_PERSONA_IDS } from "@/lib/demo-personas";
import { profileRowToStreamerRecord, type ProfileDiscoveryRow } from "@/lib/categories";
import { getAllStreamersDemoRecords } from "@/lib/streamers-demo-simulation";
import type { StreamerProfileRecord } from "@/lib/streamers-types";

/** Live rows returned for the high-density discovery grid (2×6 on 2xl). */
export const STREAMERS_DISCOVERY_TARGET = 24;

const PROFILE_SELECT =
  "id, username, avatar_url, viewer_count, current_category, is_live, stream_title, category_id, display_name, full_name, is_demo";

const PROFILE_SELECT_LEGACY =
  "id, username, avatar_url, viewer_count, current_category, is_live, stream_title, category_id, display_name, full_name";

const DEMO_PERSONA_ID_SET = new Set<string>(Object.values(DEMO_PERSONA_IDS));

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey || serviceRoleKey.includes("your_private")) {
    return null;
  }
  return createClient(url, serviceRoleKey);
}

function isMissingIsDemoColumn(message: string | undefined): boolean {
  return /is_demo|column.*does not exist|schema cache/i.test(message ?? "");
}

function isDemoProfileRow(row: ProfileDiscoveryRow): boolean {
  if (typeof row.is_demo === "boolean") return row.is_demo;
  const id = row.id?.trim();
  if (id && DEMO_PERSONA_ID_SET.has(id)) return true;
  const uname = row.username?.trim().toLowerCase();
  return (
    uname === "pastor_james" ||
    uname === "sister_sarah" ||
    uname === "gospel_vibe" ||
    uname === "kingdom_gamer" ||
    uname === "prophetic_voices"
  );
}

function rowToRecord(row: ProfileDiscoveryRow): StreamerProfileRecord {
  return profileRowToStreamerRecord({
    ...row,
    is_live: row.is_live ?? true,
  });
}

function dedupeById(rows: StreamerProfileRecord[]): StreamerProfileRecord[] {
  const seen = new Set<string>();
  const out: StreamerProfileRecord[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

type LiveQueryResult = { rows: ProfileDiscoveryRow[]; supportsIsDemo: boolean };

async function queryLiveByDemoFlag(
  supabase: SupabaseClient,
  isDemo: boolean,
  limit: number,
): Promise<LiveQueryResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("is_live", true)
    .eq("is_demo", isDemo)
    .gte("viewer_count", 0)
    .order("viewer_count", { ascending: false })
    .limit(limit);

  if (error && isMissingIsDemoColumn(error.message)) {
    return { rows: [], supportsIsDemo: false };
  }
  if (error) throw error;
  return { rows: (data ?? []) as ProfileDiscoveryRow[], supportsIsDemo: true };
}

async function queryAllLiveProfiles(supabase: SupabaseClient): Promise<ProfileDiscoveryRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT_LEGACY)
    .eq("is_live", true)
    .gte("viewer_count", 0)
    .order("viewer_count", { ascending: false })
    .limit(96);

  if (error) throw error;
  return (data ?? []) as ProfileDiscoveryRow[];
}

function simulationBackfill(
  current: StreamerProfileRecord[],
  target: number,
): StreamerProfileRecord[] {
  const seen = new Set(current.map((r) => r.id));
  const out = [...current];
  for (const row of getAllStreamersDemoRecords()) {
    if (out.length >= target) break;
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

/**
 * Weighted discovery engine:
 * 1) Real live profiles (`is_demo = false`) by viewer_count
 * 2) Live seed personas (`is_demo = true`) to fill deficit
 * 3) Static rail simulation (`lr1`…) when DB rows are still short
 */
export async function compileLiveChannelIndex(
  supabaseFallback: SupabaseClient,
): Promise<StreamerProfileRecord[]> {
  const supabase = getSupabaseAdmin() ?? supabaseFallback;
  const target = STREAMERS_DISCOVERY_TARGET;

  try {
    const realPass = await queryLiveByDemoFlag(supabase, false, target);

    if (realPass.supportsIsDemo) {
      let streamers = realPass.rows.map(rowToRecord);

      if (streamers.length >= target) {
        return streamers.slice(0, target);
      }

      const deficit = target - streamers.length;
      const demoPass = await queryLiveByDemoFlag(supabase, true, deficit);
      streamers = dedupeById([...streamers, ...demoPass.rows.map(rowToRecord)]);

      if (streamers.length < target) {
        streamers = simulationBackfill(streamers, target);
      }

      return streamers.slice(0, target);
    }

    const rows = await queryAllLiveProfiles(supabase);
    const realRows = rows.filter((r) => !isDemoProfileRow(r));
    const demoRows = rows.filter((r) => isDemoProfileRow(r));

    let streamers = realRows.map(rowToRecord);

    if (streamers.length >= target) {
      return streamers.slice(0, target);
    }

    const deficit = target - streamers.length;
    streamers = dedupeById([...streamers, ...demoRows.slice(0, deficit).map(rowToRecord)]);

    if (streamers.length < target) {
      streamers = simulationBackfill(streamers, target);
    }

    return streamers.slice(0, target);
  } catch (err) {
    console.error("[DISCOVERY_ENGINE_ERROR]", err);
    return getAllStreamersDemoRecords().slice(0, target);
  }
}
