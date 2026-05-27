import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";import { fetchActiveStoryGroups } from "@/lib/sanctuary-stories/story-queries";
import {
  isStoriesSchemaUnavailable,
  STORIES_SCHEMA_SETUP_HINT,
} from "@/lib/sanctuary-stories/schema-errors";
import { uploadStoryMediaFromFile } from "@/lib/sanctuary-stories/upload-story-media";
import { STORY_MAX_BYTES } from "@/lib/sanctuary-stories/constants";
import { isParableDevGuestAllowed, getParableGuestUserId } from "@/lib/parable-dev-guest";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const guestAllowed = isParableDevGuestAllowed(request);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (guestAllowed && !user) {
      return NextResponse.json({
        groups: [],
        currentUserId: getParableGuestUserId(),
      });
    }

    if (authError || !user) {
      return jsonError("Not signed in.", 401);
    }
    const feed = await fetchActiveStoryGroups(supabase, user.id);
    return NextResponse.json(feed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load stories.";
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
    const file = formData.get("media");

    if (!(file instanceof File)) {
      return jsonError("Missing media file.");
    }

    if (file.size > STORY_MAX_BYTES) {
      return jsonError("Story media must be 10 MB or smaller.");
    }

    const uploaded = await uploadStoryMediaFromFile(supabase, user.id, file);
    if ("error" in uploaded) {
      return jsonError(uploaded.error);
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("stories")
      .insert({
        user_id: user.id,
        media_url: uploaded.publicUrl,
        media_type: uploaded.mediaType,
        expires_at: expiresAt,
      })
      .select("id, user_id, media_url, media_type, created_at")
      .single();

    if (error) {
      if (isStoriesSchemaUnavailable(error)) {
        return jsonError(STORIES_SCHEMA_SETUP_HINT, 503);
      }
      return jsonError(error.message, 500);
    }

    return NextResponse.json({
      story: {
        id: data.id,
        mediaUrl: data.media_url,
        mediaType: data.media_type,
        createdAt: data.created_at,
        viewed: true,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload story.";
    return jsonError(message, 500);
  }
}
