/**
 * LiveKit JWT for the "Sanctuary" room (and others via `room` in the body).
 * Secrets: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL
 * Supabase: SUPABASE_URL, SUPABASE_ANON_KEY (auto-injected)
 *
 * Uses `livekit-server-sdk` AccessToken. We verify the Supabase session and set
 * `identity` to the authenticated user id (never trust client-supplied identity).
 * Optional `username` from the body is used only as the display `name` on the token.
 */

import { createClient } from "@supabase/supabase-js";
import { AccessToken } from "https://esm.sh/livekit-server-sdk@2.9.4";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TokenBody = {
  room?: string;
  username?: string;
};

Deno.serve(async (req: Request) => {
  // 1. Handle CORS (required for frontend calls)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as TokenBody;
    const roomRaw = body.room ?? "Sanctuary";
    const room = String(roomRaw).trim() || "Sanctuary";
    const usernameFromBody =
      typeof body.username === "string" && body.username.trim() ? body.username.trim() : undefined;

    // 2. Load your LiveKit credentials from Supabase Secrets
    const apiKey = Deno.env.get("LIVEKIT_API_KEY");
    const apiSecret = Deno.env.get("LIVEKIT_API_SECRET");
    const livekitUrl = Deno.env.get("LIVEKIT_URL");

    if (!apiKey || !apiSecret || !livekitUrl) {
      return new Response(JSON.stringify({ error: "Missing LiveKit secrets (LIVEKIT_*)." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const identity = user.id;
    const displayName =
      usernameFromBody ||
      (user.user_metadata?.display_name as string | undefined)?.trim() ||
      (user.user_metadata?.full_name as string | undefined)?.trim() ||
      user.email ||
      "Creator";

    // 3. Create the Access Token (identity = verified user; name = display)
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: displayName,
      ttl: "2h",
    });

    // 4. Grant permissions (join room, publish/subscribe for Command Center + viewers)
    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // 5. Return the token as a JWT string (+ url for the browser client)
    const token = await at.toJwt();

    return new Response(
      JSON.stringify({
        token,
        url: livekitUrl,
        room,
        identity,
        name: displayName,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
