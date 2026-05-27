import { NextResponse } from "next/server";
import { getAllStreamersDemoRecords } from "@/lib/streamers-demo-simulation";
import type { StreamersApiResponse } from "@/lib/streamers-types";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Production: replace demo simulation with Supabase/PostgreSQL discovery query.
    // const supabase = await createClient();
    // const { data, error } = await supabase
    //   .from("profiles")
    //   .select(
    //     "id, username, avatar_url, viewer_count, current_category, is_live, stream_title"
    //   )
    //   .eq("is_live", true)
    //   .order("viewer_count", { ascending: false })
    //   .limit(48);
    // if (error) throw error;
    // const streamers = (data ?? []).map((row) => ({ ... }));

    const streamers = getAllStreamersDemoRecords();

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
