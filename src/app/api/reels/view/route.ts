import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { recordReelViewMetric } from "@/lib/reels/reel-queries";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError("Not signed in.", 401);
    }

    const body = (await request.json()) as { reelId?: string; watchRatio?: number };
    const reelId = body.reelId?.trim();
    const watchRatio = typeof body.watchRatio === "number" ? body.watchRatio : 0;

    if (!reelId) {
      return jsonError("Missing reelId.");
    }

    await recordReelViewMetric(supabase, user.id, reelId, watchRatio);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record view.";
    return jsonError(message, 500);
  }
}
