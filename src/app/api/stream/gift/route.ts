import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getFallbackGiftBySku } from "@/lib/gift-catalog";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Server misconfiguration: Supabase admin credentials missing.");
  }
  return createClient(url, serviceRoleKey);
}

type GiftBody = {
  userId?: string;
  streamerId?: string;
  giftSku?: string;
  streamId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GiftBody;
    const userId = body.userId?.trim();
    const streamerId = body.streamerId?.trim();
    const giftSku = body.giftSku?.trim();
    const streamId = body.streamId?.trim();

    if (!userId || !streamerId || !giftSku || !streamId) {
      return jsonError("Missing gifting details.", 400);
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: giftItem, error: giftError } = await supabaseAdmin
      .from("gift_catalog")
      .select("id, name, sku, coin_cost")
      .eq("sku", giftSku)
      .maybeSingle();

    const fallbackGift = getFallbackGiftBySku(giftSku);
    const catalogUnavailable = Boolean(giftError);

    if (catalogUnavailable) {
      console.warn("[GIFT CATALOG LOOKUP ERROR]:", giftError);
    }

    let catalogId: string | null = giftItem?.id ?? null;
    let giftName = giftItem?.name?.trim() ?? fallbackGift?.name ?? giftSku;
    let coinCost = Number(giftItem?.coin_cost ?? fallbackGift?.coinCost ?? 0);

    if (!catalogId && !fallbackGift) {
      if (catalogUnavailable) {
        return jsonError("Gift catalog lookup failed.", 500);
      }
      return jsonError("Gift item not found.", 404);
    }

    if (!Number.isInteger(coinCost) || coinCost <= 0) {
      return jsonError("Gift item is misconfigured.", 500);
    }

    const { data: ledgerEntries, error: ledgerError } = await supabaseAdmin
      .from("creator_ledger_entries")
      .select("coin_amount")
      .eq("creator_id", userId);

    if (ledgerError) {
      console.error("[GIFT LEDGER LOOKUP ERROR]:", ledgerError);
      return jsonError("Wallet lookup failed.", 500);
    }

    const coinBalance = (ledgerEntries ?? []).reduce(
      (acc, entry) => acc + Number(entry.coin_amount ?? 0),
      0,
    );

    if (coinBalance < coinCost) {
      return jsonError("Insufficient wallet coin balance.", 402);
    }

    const referenceId = crypto.randomUUID();

    const { error: deductError } = await supabaseAdmin.from("creator_ledger_entries").insert({
      creator_id: userId,
      amount_cents: 0,
      coin_amount: -coinCost,
      source_type: "one_time_gift",
      reference_id: referenceId,
      description: `Sent ${giftName} gift to creator.`,
    });

    if (deductError) {
      console.error("[GIFT DEDUCTION ERROR]:", deductError);
      return jsonError("Failed to deduct coins from wallet.", 500);
    }

    if (!catalogId) {
      return NextResponse.json({
        success: true,
        warning:
          "Gift catalog unavailable locally — coins deducted using fallback pricing; realtime gift log skipped.",
        mockReceipt: {
          id: referenceId,
          sku: giftSku,
          coin_cost: coinCost,
        },
      });
    }

    const { data: giftLog, error: giftLogError } = await supabaseAdmin
      .from("stream_gifts")
      .insert({
        sender_id: userId,
        receiver_id: streamerId,
        gift_id: catalogId,
        stream_id: streamId,
      })
      .select("id, sender_id, receiver_id, gift_id, stream_id, created_at")
      .single();

    if (giftLogError) {
      console.error("[STREAM GIFT LOG ERROR]:", giftLogError);
      return NextResponse.json({
        success: true,
        warning: "Gift was paid but broadcast logging failed.",
        mockReceipt: { id: referenceId, sku: giftSku, coin_cost: coinCost },
      });
    }

    return NextResponse.json({ success: true, giftLog });
  } catch (error) {
    console.error("[IN-APP GIFT TRANSACTION EXCEPTION]:", error);
    return jsonError("Internal transaction execution failure.", 500);
  }
}
