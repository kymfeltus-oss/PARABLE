import { NextRequest, NextResponse } from "next/server";
import { AccessToken as LiveKitAccessToken } from "livekit-server-sdk";
import {
  assertLiveKitServerCredentials,
  getLiveKitApiKey,
  getLiveKitApiSecret,
  getLiveKitServerUrl,
} from "@/lib/livekit-env";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room")?.trim();
    const identity = searchParams.get("identity")?.trim();

    if (!room || !identity) {
      return NextResponse.json(
        { error: "Missing required parameters: room, identity" },
        { status: 400 },
      );
    }

    const creds = assertLiveKitServerCredentials();
    if (!creds.ok) {
      return NextResponse.json({ error: creds.error }, { status: 500 });
    }

    const apiKey = getLiveKitApiKey()!;
    const apiSecret = getLiveKitApiSecret()!;
    const serverUrl = getLiveKitServerUrl();

    const at = new LiveKitAccessToken(apiKey, apiSecret, {
      identity,
      ttl: "2h",
    });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: false,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      ...(serverUrl ? { url: serverUrl, room, identity } : { room, identity }),
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Internal server error during token signing" },
      { status: 500 },
    );
  }
}
