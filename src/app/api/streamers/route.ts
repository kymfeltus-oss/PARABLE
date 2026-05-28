import { NextResponse } from "next/server";
import { profileRowToStreamerRecord } from "@/lib/categories";
import { getAllStreamersDemoRecords } from "@/lib/streamers-demo-simulation";
import { createClient } from "@/utils/supabase/server";
import type { StreamersApiResponse } from "@/lib/streamers-types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, avatar_url, viewer_count, current_category, is_live, stream_title, category_id, display_name, full_name",
      )
      .eq("is_live", true)
      .gte("viewer_count", 0)
      .order("viewer_count", { ascending: false })
      .limit(48);

    let streamers =
      error || !data?.length
        ? getAllStreamersDemoRecords()
        : data.map(profileRowToStreamerRecord);

    if (streamers.length === 0) {
      streamers = getAllStreamersDemoRecords();
    }

    const payload: StreamersApiResponse = {
      ok: true,
      streamers,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load streamers.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
