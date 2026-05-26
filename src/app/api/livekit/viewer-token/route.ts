import { NextResponse } from "next/server";
import { AccessToken as LiveKitAccessToken } from "livekit-server-sdk";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type ViewerTokenBody = {
  roomName?: string;
  identity?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ViewerTokenBody;
    const roomName = body.roomName?.trim();
    const identity = body.identity?.trim();

    if (!roomName || !identity) {
      return jsonError("Missing roomName or identity parameters.", 400);
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const serverUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret) {
      return jsonError("Server misconfiguration: LiveKit keys missing.", 500);
    }
    if (!serverUrl) {
      return jsonError("Server misconfiguration: LiveKit URL missing.", 500);
    }

    const at = new LiveKitAccessToken(apiKey, apiSecret, {
      identity,
      ttl: "2h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: false,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({ token, url: serverUrl, room: roomName, identity });
  } catch (error) {
    console.error("Viewer token generation crash caught:", error);
    return jsonError("Internal pipeline token error", 500);
  }
}
