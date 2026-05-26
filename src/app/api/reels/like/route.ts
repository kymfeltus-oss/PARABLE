import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { incrementReelLike } from "@/lib/reels/reel-queries";

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
    const reelId = body.reelId?.trim();
    if (!reelId) {
      return jsonError("Missing reelId.");
    }

    const result = await incrementReelLike(supabase, reelId);
    if ("error" in result) {
      return jsonError(result.error, 500);
    }

    return NextResponse.json({ likesCount: result.likesCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to like reel.";
    return jsonError(message, 500);
  }
}
