import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

import { resolveStripeSecretKey } from "@/lib/stripe-config";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getStripe(): Stripe {
  const secretKey = resolveStripeSecretKey();
  if (!secretKey) {
    throw new Error("Server misconfiguration: STRIPE_SECRET_KEY missing or invalid.");
  }
  return new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });
}

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey || serviceRoleKey.includes("your_private")) {
    throw new Error("Server misconfiguration: Supabase admin credentials missing.");
  }
  return createClient(url, serviceRoleKey);
}

async function ledgerReferenceExists(
  supabaseAdmin: SupabaseClient,
  referenceId: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("creator_ledger_entries")
    .select("id")
    .eq("reference_id", referenceId)
    .maybeSingle();

  if (error) {
    console.error("[WEBHOOK] Ledger idempotency lookup failed:", error);
    throw error;
  }

  return Boolean(data?.id);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !webhookSecret || webhookSecret.includes("_goes_here")) {
    console.error("[SECURITY WARNING] Blocked unsigned or unconfigured webhook attempt.");
    return jsonError("Missing security verification signatures.", 401);
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error(`[SECURITY FAILURE] Cryptographic signature mismatch: ${message}`);
    return jsonError(`Signature Verification Failed: ${message}`, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const referenceId = session.id;

    if (referenceId) {
      try {
        const supabaseAdmin = getSupabaseAdmin();
        const alreadyProcessed = await ledgerReferenceExists(supabaseAdmin, referenceId);
        if (alreadyProcessed) {
          return NextResponse.json({ received: true, status: "duplicate_ignored" });
        }

        if (session.metadata?.paymentType === "coin_purchase") {
          const userId = session.metadata.userId?.trim();
          const coinAmount = Number.parseInt(session.metadata.coinAmount ?? "", 10);
          const amountCents = session.amount_total ?? 0;

          if (userId && Number.isFinite(coinAmount) && coinAmount > 0) {
            const { error: ledgerError } = await supabaseAdmin.from("creator_ledger_entries").insert({
              creator_id: userId,
              amount_cents: amountCents,
              coin_amount: coinAmount,
              source_type: "coin_purchase",
              reference_id: referenceId,
              description: `Deposited ${coinAmount} platform coins into system wallet ledger.`,
            });

            if (ledgerError) {
              if (ledgerError.code === "23505") {
                console.info("[WEBHOOK COIN DEPOSIT] Duplicate session ignored:", referenceId);
                return NextResponse.json({ received: true, status: "duplicate_ignored" });
              }
              console.error("[WEBHOOK COIN DEPOSIT FAILURE]:", ledgerError);
              return jsonError("Database update rejected.", 500);
            }
          }
        }
      } catch (coinErr) {
        console.error("[WEBHOOK COIN DEPOSIT CRASH]:", coinErr);
        return jsonError("Coin deposit processing failed.", 500);
      }
    }

    const userId = session.metadata?.userId?.trim();
    const stripeSubscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (userId && stripeSubscriptionId) {
      try {
        const stripe = getStripe();
        const supabaseAdmin = getSupabaseAdmin();
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const primaryItem = subscription.items.data[0];
        const periodEndUnix = primaryItem?.current_period_end;
        const priceId =
          typeof primaryItem?.price === "string" ? primaryItem.price : primaryItem?.price?.id;

        if (!priceId || !periodEndUnix) {
          console.error("[WEBHOOK] Subscription missing price or period end:", stripeSubscriptionId);
        } else {
          const periodEnd = new Date(periodEndUnix * 1000).toISOString();
          const { data: tierData, error: tierError } = await supabaseAdmin
            .from("subscription_tiers")
            .select("id")
            .eq("stripe_price_id", priceId)
            .maybeSingle();

          if (tierError) {
            console.error("[DB TIER LOOKUP CRASH]:", tierError);
          } else if (!tierData?.id) {
            console.error("[WEBHOOK] No subscription_tiers row for price:", priceId);
          } else {
            const { error } = await supabaseAdmin.from("user_subscriptions").upsert(
              {
                user_id: userId,
                tier_id: tierData.id,
                stripe_subscription_id: stripeSubscriptionId,
                status: subscription.status,
                current_period_end: periodEnd,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" },
            );

            if (error) console.error("[DB SUBSCRIPTION SYNC CRASH]:", error);
          }
        }
      } catch (syncErr) {
        console.error("[WEBHOOK CHECKOUT SYNC CRASH]:", syncErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
