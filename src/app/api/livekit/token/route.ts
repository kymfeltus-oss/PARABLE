import { NextResponse } from "next/server";
// Aliasing prevents "defined multiple times" errors in Next.js 16/Turbopack
import { AccessToken as LiveKitAccessToken } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  try {
    // 1. Load Environment Variables
    const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
    const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
    const LIVEKIT_URL = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 2. Validate Config
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      return jsonError("Missing LiveKit environment variables.", 500);
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return jsonError("Missing Supabase environment variables.", 500);
    }

    // 3. Authenticate Supabase User
    const authHeader = req.headers.get("authorization") || "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!jwt) {
      return jsonError("Unauthorized: Missing token.", 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.auth.getUser(jwt);

    if (error || !data?.user) {
      return jsonError("Unauthorized: Invalid session.", 401);
    }

    const user = data.user;

    // 4. Prepare Token Data
    const body = await req.json().catch(() => ({}));
    const room = (body?.room || "parable-live").toString();
    const identity = user.id;
    const name = user.user_metadata?.display_name || user.email || "Creator";

    // 5. Generate LiveKit Token
    const at = new LiveKitAccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name,
      ttl: "2h",
    });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      url: LIVEKIT_URL,
      room,
      identity,
      name,
    });
  } catch (e: any) {
    console.error("Token Error:", e);
    return jsonError(e?.message || "Token mint failed.", 500);
  }
}
