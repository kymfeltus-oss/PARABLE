import { NextResponse } from "next/server";
import {
  compileLiveChannelIndex,
  STREAMERS_DISCOVERY_TARGET,
} from "@/lib/streamers-discovery-engine";
import { getAllStreamersDemoRecords } from "@/lib/streamers-demo-simulation";
import { createClient } from "@/utils/supabase/server";
import type { StreamersApiResponse } from "@/lib/streamers-types";

export const runtime = "nodejs";

/**
 * Weighted live discovery index.
 * Priority: profiles with `is_live` and `is_demo = false`, then `is_demo = true`, then static rail simulation.
 * Uses service role when configured; otherwise cookie-backed server client (auth session preserved).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    let streamers = await compileLiveChannelIndex(supabase);

    const useDemoDiscovery =
      process.env.PARABLE_E2E_DEMO_DISCOVERY === "1" ||
      (process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_PARABLE_DEV_GUEST === "1");

    if (useDemoDiscovery) {
      streamers = getAllStreamersDemoRecords().slice(0, STREAMERS_DISCOVERY_TARGET);
    } else if (streamers.length === 0) {
      streamers = getAllStreamersDemoRecords();
    }

    const payload: StreamersApiResponse = {
      ok: true,
      streamers,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to compile live channel index matrix.";
    console.error("[DISCOVERY_ENGINE_ERROR]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
