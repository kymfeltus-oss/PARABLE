import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getStripeConfigError,
  resolveStripeSecretKey,
} from "@/lib/stripe-config";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3004";
}

function getStripe(): Stripe {
  const secretKey = resolveStripeSecretKey();
  if (!secretKey) {
    throw new Error(getStripeConfigError() ?? "Server misconfiguration: STRIPE_SECRET_KEY missing.");
  }
  return new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });
}

type SubscribeBody = {
  streamerId?: string;
  streamerStripeAccountId?: string;
  userId?: string;
  tierPriceInCents?: number;
};

/** Kick-style 95/5 channel subscription checkout (Stripe Connect destination charge). */
export async function POST(request: Request) {
  const configError = getStripeConfigError();
  if (configError) {
    return jsonError(configError, 503);
  }

  try {
    const body = (await request.json()) as SubscribeBody;
    const streamerId = body.streamerId?.trim();
    const streamerStripeAccountId = body.streamerStripeAccountId?.trim();
    const userId = body.userId?.trim();
    const tierPriceInCents = Number(body.tierPriceInCents);

    if (!streamerId) {
      return jsonError("Missing streamerId.", 400);
    }
    if (!userId) {
      return jsonError("Missing userId.", 400);
    }
    if (!streamerStripeAccountId) {
      return jsonError("Target creator has not linked a payment payout ledger.", 400);
    }
    if (!Number.isFinite(tierPriceInCents) || tierPriceInCents < 50) {
      return jsonError("tierPriceInCents must be at least 50.", 400);
    }

    const stripe = getStripe();
    const appUrl = getAppUrl();

    // Platform application fee = 5% (creator receives ~95% via Connect transfer)
    const platformApplicationFeeInCents = Math.round(tierPriceInCents * 0.05);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            unit_amount: tierPriceInCents,
            product_data: {
              name: "Channel Subscription — Premium Tier",
              description: "95% of proceeds go straight to the creator.",
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        application_fee_percent: 5,
        transfer_data: {
          destination: streamerStripeAccountId,
        },
        metadata: {
          streamerId,
          userId,
          platform_fee_cents: String(platformApplicationFeeInCents),
        },
      },
      success_url: `${appUrl}/watch/${encodeURIComponent(streamerId)}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/watch/${encodeURIComponent(streamerId)}`,
      metadata: { userId, streamerId },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to initialize sub transaction token session.";
    console.error("[STRIPE_SPLIT_ROUTING_ERROR]", message);
    return jsonError(message, 500);
  }
}
