import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchReelsFeed } from "@/lib/reels/reel-queries";
import { buildReelsInsertPayload, REELS_FEED_SELECT } from "@/lib/reels/db-fields";
import { isReelsSchemaUnavailable } from "@/lib/reels/schema-errors";
import { REELS_SCHEMA_SETUP_HINT } from "@/lib/reels/constants";
import { uploadReelMediaFromFiles } from "@/lib/reels/upload-reel-media";
import { REEL_MAX_BYTES } from "@/lib/reels/constants";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError("Not signed in.", 401);
    }

    const feed = await fetchReelsFeed(supabase, user.id);
    return NextResponse.json(feed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load reels.";
    return jsonError(message, 500);
  }
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

    const formData = await request.formData();
    const video = formData.get("video");
    const thumbnail = formData.get("thumbnail");
    const caption = String(formData.get("caption") ?? "").trim();
    const audioTitle = String(formData.get("audioTitle") ?? "Original Audio").trim() || "Original Audio";

    if (!(video instanceof File)) {
      return jsonError("Missing video file.");
    }
    if (!(thumbnail instanceof File)) {
      return jsonError("Missing thumbnail file.");
    }
    if (video.size > REEL_MAX_BYTES) {
      return jsonError("Video file exceeds our 100MB limit criteria.");
    }

    const uploaded = await uploadReelMediaFromFiles(supabase, user.id, video, thumbnail);
    if ("error" in uploaded) {
      return jsonError(uploaded.error);
    }

    const { data, error } = await supabase
      .from("reels")
      .insert(
        buildReelsInsertPayload({
          userId: user.id,
          videoUrl: uploaded.videoUrl,
          thumbnailUrl: uploaded.thumbnailUrl,
          caption,
          audioTitle,
        }),
      )
      .select(REELS_FEED_SELECT)
      .single();

    if (error) {
      if (isReelsSchemaUnavailable(error)) {
        return jsonError(REELS_SCHEMA_SETUP_HINT, 503);
      }
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ reel: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to publish reel.";
    return jsonError(message, 500);
  }
}
