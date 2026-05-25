import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { deleteReel } from "@/lib/content-delete";
import { isReelsSchemaUnavailable } from "@/lib/reels/schema-errors";
import { REELS_SCHEMA_SETUP_HINT } from "@/lib/reels/constants";

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

    const body = (await request.json()) as { reelId?: string };
    const reelId = String(body.reelId ?? "").trim();
    if (!reelId) {
      return jsonError("Missing reelId.");
    }

    await deleteReel(supabase, reelId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete reel.";
    if (err && typeof err === "object" && isReelsSchemaUnavailable(err as { message?: string; code?: string })) {
      return jsonError(REELS_SCHEMA_SETUP_HINT, 503);
    }
    return jsonError(message, 500);
  }
}
