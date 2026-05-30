import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import {
  assertLiveKitServerCredentials,
  getLiveKitApiKey,
  getLiveKitApiSecret,
  getLiveKitClientUrl,
  getLiveKitServerUrl,
} from "@/lib/livekit-env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type TokenBody = {
  roomName?: string;
  room?: string;
  participantIdentity?: string;
  identity?: string;
  isPublisher?: boolean;
};

type MintOk = {
  token: string;
  serverUrl: string;
  url: string;
  room: string;
  identity: string;
};

type MintErr = { error: string; status: 500 };

async function mintLiveKitToken(params: {
  roomName: string;
  participantIdentity: string;
  isPublisher: boolean;
}): Promise<MintOk | MintErr> {
  const creds = assertLiveKitServerCredentials();
  if (!creds.ok) {
    return { error: creds.error, status: 500 };
  }

  const apiKey = getLiveKitApiKey()!;
  const apiSecret = getLiveKitApiSecret()!;
  const serverUrl =
    process.env.NEXT_PUBLIC_LIVEKIT_WS_URL?.trim() ||
    getLiveKitClientUrl() ||
    getLiveKitServerUrl();

  const token = new AccessToken(apiKey, apiSecret, {
    identity: params.participantIdentity,
    ttl: "2h",
  });

  token.addGrant({
    room: params.roomName,
    roomJoin: true,
    canPublish: params.isPublisher,
    canSubscribe: true,
    canPublishData: true,
  });

  const tokenJwtString = await token.toJwt();

  return {
    token: tokenJwtString,
    serverUrl,
    url: serverUrl,
    room: params.roomName,
    identity: params.participantIdentity,
  };
}

/** GET ?room=&identity= — viewer token (legacy). */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room")?.trim();
    const identity = searchParams.get("identity")?.trim();

    if (!room || !identity) {
      return jsonError("Missing required parameters: room, identity", 400);
    }

    const result = await mintLiveKitToken({
      roomName: room,
      participantIdentity: identity,
      isPublisher: false,
    });

    if ("status" in result) {
      return jsonError(result.error, result.status);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error during token signing";
    console.error("[LIVEKIT_TOKEN_GENERATION_FAULT]", message);
    return jsonError(message, 500);
  }
}

/** POST JSON body — publisher or viewer grants for WebRTC clients. */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as TokenBody;
    const roomName = (body.roomName ?? body.room)?.trim();
    const participantIdentity = (body.participantIdentity ?? body.identity)?.trim();

    if (!roomName || !participantIdentity) {
      return jsonError("Missing identity tracking parameters.", 400);
    }

    const result = await mintLiveKitToken({
      roomName,
      participantIdentity,
      isPublisher: body.isPublisher === true,
    });

    if ("status" in result) {
      return jsonError(result.error, result.status);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to issue live broadcast signature token.";
    console.error("[LIVEKIT_TOKEN_GENERATION_FAULT]", message);
    return jsonError(message, 500);
  }
}
