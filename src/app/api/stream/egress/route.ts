import { NextResponse } from "next/server";
import {
  EncodingOptionsPreset,
  StreamOutput,
  StreamProtocol,
} from "livekit-server-sdk";
import { createLiveKitEgressClient } from "@/lib/livekit-egress-host";
import { assertLiveKitServerCredentials } from "@/lib/livekit-env";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RtmpDestination = {
  url: string;
  key: string;
};

type EgressBody = {
  action?: string;
  roomName?: string;
  destinations?: RtmpDestination[];
  egressId?: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function buildRtmpUrls(destinations: RtmpDestination[]): string[] {
  return destinations.map((dest) => {
    const cleanUrl = dest.url.trim().replace(/\/$/, "");
    const key = dest.key.trim();
    if (!cleanUrl || !key) {
      throw new Error("Each destination requires a non-empty RTMP URL and stream key.");
    }
    return `${cleanUrl}/${key}`;
  });
}

function streamerIdFromRoom(roomName: string): string | null {
  const prefix = "parable-live-";
  if (!roomName.startsWith(prefix)) return null;
  const id = roomName.slice(prefix.length);
  return id.length > 0 ? id : null;
}

async function assertStreamerOwnsRoom(roomName: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const streamerId = streamerIdFromRoom(roomName);
  if (!streamerId) {
    return { ok: false, error: "Invalid room name for this workspace." };
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return { ok: false, error: "Authentication required to control egress." };
  }

  if (session.user.id !== streamerId) {
    return { ok: false, error: "You may only start egress for your own broadcast room." };
  }

  return { ok: true };
}

export async function POST(request: Request) {
  try {
    const creds = assertLiveKitServerCredentials();
    if (!creds.ok) {
      return jsonError(creds.error, 503);
    }

    const body = (await request.json().catch(() => ({}))) as EgressBody;
    const action = body.action?.trim().toUpperCase();
    const roomName = body.roomName?.trim();

    if (!roomName) {
      return jsonError("Missing required roomName parameter.");
    }

    const ownership = await assertStreamerOwnsRoom(roomName);
    if (!ownership.ok) {
      return jsonError(ownership.error, 403);
    }

    const egressClient = createLiveKitEgressClient();

    if (action === "START") {
      const destinations = body.destinations;
      if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
        return jsonError("At least one RTMP destination is required.");
      }

      const outputUrls = buildRtmpUrls(destinations);

      const streamOutput = new StreamOutput({
        protocol: StreamProtocol.RTMP,
        urls: outputUrls,
      });

      const egressInfo = await egressClient.startRoomCompositeEgress(roomName, streamOutput, {
        layout: "speaker",
        encodingOptions: EncodingOptionsPreset.H264_1080P_30,
      });

      return NextResponse.json({
        success: true,
        egressId: egressInfo.egressId,
        status: "MULTICASTING_ACTIVE",
        destinationCount: outputUrls.length,
      });
    }

    if (action === "STOP") {
      const egressId = body.egressId?.trim();
      if (!egressId) {
        return jsonError("Missing mandatory egressId to terminate.");
      }

      await egressClient.stopEgress(egressId);
      return NextResponse.json({ success: true, status: "EGRESS_TERMINATED" });
    }

    return jsonError("Invalid pipeline instruction action token.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown egress failure";
    console.error("[LIVEKIT_EGRESS_PIPELINE_ERROR]", message);
    return jsonError(`Failed to manage multi-destination egress: ${message}`, 500);
  }
}

/** Convenience GET documents expected room naming. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    roomNamePattern: unifiedStreamRoomName("{streamerProfileId}"),
    actions: ["START", "STOP"],
  });
}
