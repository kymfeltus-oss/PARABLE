import { NextResponse } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { getLiveKitApiKey, getLiveKitApiSecret } from "@/lib/livekit-env";
import { resolvePresenceFromWebhook } from "@/lib/livekit-webhook";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function setProfileLiveByStreamKey(streamKey: string, isLive: boolean) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    throw new Error("Server misconfigured: Supabase admin credentials missing.");
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ is_live: isLive })
    .eq("livekit_ingress_stream_key", streamKey)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

async function setProfileLiveById(profileId: string, isLive: boolean) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    throw new Error("Server misconfigured: Supabase admin credentials missing.");
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_live: isLive })
    .eq("id", profileId);

  if (error) throw error;
}

export async function POST(request: Request) {
  try {
    const apiKey = getLiveKitApiKey();
    const apiSecret = getLiveKitApiSecret();
    if (!apiKey || !apiSecret) {
      return jsonError("Server misconfigured: LiveKit credentials missing", 500);
    }

    const rawBody = await request.text();
    const authHeader = request.headers.get("authorization") ?? undefined;

    const receiver = new WebhookReceiver(apiKey, apiSecret);
    const event = await receiver.receive(rawBody, authHeader);

    const presence = resolvePresenceFromWebhook(event);
    if (!presence) {
      return NextResponse.json({ received: true, message: "Ignored event type" });
    }

    if (presence.source === "ingress") {
      const profileId = await setProfileLiveByStreamKey(
        presence.streamKey!,
        presence.isLive,
      );

      if (!profileId && presence.profileId) {
        await setProfileLiveById(presence.profileId, presence.isLive);
      } else if (!profileId) {
        console.warn(
          `[LiveKit webhook] No profile for ingress stream key (is_live=${presence.isLive})`,
        );
      }

      return NextResponse.json({
        success: true,
        statusUpdated: presence.isLive,
        profileId: profileId ?? presence.profileId ?? null,
        source: "ingress",
      });
    }

    await setProfileLiveById(presence.profileId, presence.isLive);

    return NextResponse.json({
      success: true,
      statusUpdated: presence.isLive,
      profileId: presence.profileId,
      source: "room",
      roomName: presence.roomName,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failure";
    console.error("LiveKit webhook:", message);
    return jsonError("Internal processing crash", 500);
  }
}
