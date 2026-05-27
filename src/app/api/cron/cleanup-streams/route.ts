import { NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey || serviceRoleKey.includes("your_private")) {
    return null;
  }
  return createClient(url, serviceRoleKey);
}

function isAuthorizedCron(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET_KEY?.trim();
  const authHeader = request.headers.get("authorization");

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!cronSecret) {
    console.error("[CRON CLEANUP] CRON_SECRET_KEY missing in production.");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return jsonError("Unauthorized system invocation.", 401);
  }

  const livekitUrl =
    process.env.LIVEKIT_URL?.trim() || process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim();
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!livekitUrl || !apiKey || !apiSecret) {
    console.error(
      "[CLEANUP CRASH PREVENTED] LiveKit keys or host URL are completely missing from .env.local",
    );
    return NextResponse.json(
      {
        success: false,
        error: "Server misconfiguration: LiveKit initialization parameters missing.",
      },
      { status: 503 },
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    console.error(
      "[CLEANUP CRASH PREVENTED] Supabase service role credentials are missing or still placeholders.",
    );
    return NextResponse.json(
      {
        success: false,
        error: "Server misconfiguration: Supabase admin credentials missing.",
      },
      { status: 503 },
    );
  }

  try {
    const normalizedUrl = livekitUrl.replace("wss://", "https://").replace("ws://", "http://");

    const svc = new RoomServiceClient(normalizedUrl, apiKey, apiSecret);
    const activeRoomsList = await svc.listRooms();
    const activeRoomNames = activeRoomsList.map((room) => room.name);

    const { data: liveProfiles } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("is_live", true);

    if (!liveProfiles || liveProfiles.length === 0) {
      return NextResponse.json({ success: true, stale_streams_terminated: 0 });
    }

    let closedCount = 0;
    for (const profile of liveProfiles) {
      const expectedRoomName = unifiedStreamRoomName(profile.id);

      if (!activeRoomNames.includes(expectedRoomName)) {
        await supabaseAdmin.from("profiles").update({ is_live: false }).eq("id", profile.id);

        closedCount++;
      }
    }

    return NextResponse.json({ success: true, stale_streams_terminated: closedCount });
  } catch (error) {
    console.error("[CRON CLEANUP EXCEPTION]:", error);
    return NextResponse.json(
      { error: "Failed connecting to external media server architecture streams." },
      { status: 500 },
    );
  }
}
