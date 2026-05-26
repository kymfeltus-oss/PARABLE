import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { markStoryViewed } from "@/lib/sanctuary-stories/story-queries";

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

    const body = (await request.json().catch(() => ({}))) as { storyId?: string };
    const storyId = typeof body.storyId === "string" ? body.storyId.trim() : "";

    if (!storyId) {
      return jsonError("Missing storyId.");
    }

    const result = await markStoryViewed(supabase, user.id, storyId);
    if (!result.ok) {
      return jsonError(result.error, 500);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record view.";
    return jsonError(message, 500);
  }
}
