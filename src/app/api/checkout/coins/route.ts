import { NextResponse } from "next/server";
import Stripe from "stripe";

import {
  getStripeConfigError,
  resolveStripeSecretKey,
} from "@/lib/stripe-config";

export const runtime = "nodejs";

const COIN_PACKS = [
  { coinAmount: 500, costCents: 500 },
  { coinAmount: 1200, costCents: 1000 },
] as const;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3003";
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

function stripeErrorMessage(error: unknown): string {
  if (error instanceof Stripe.errors.StripeError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to initiate coin transaction.";
}

type CoinCheckoutBody = {
  coinAmount?: number;
  costCents?: number;
  userId?: string;
  userEmail?: string;
};

function resolvePack(coinAmount: number, costCents: number) {
  return COIN_PACKS.find(
    (pack) => pack.coinAmount === coinAmount && pack.costCents === costCents,
  );
}

export async function POST(request: Request) {
  const configError = getStripeConfigError();
  if (configError) {
    return jsonError(configError, 503);
  }

  try {
    const body = (await request.json()) as CoinCheckoutBody;
    const coinAmount = Number(body.coinAmount);
    const costCents = Number(body.costCents);
    const userId = body.userId?.trim();
    const userEmail = body.userEmail?.trim();

    if (!Number.isInteger(coinAmount) || !Number.isInteger(costCents) || !userId) {
      return jsonError("Missing payment parameters.", 400);
    }

    const pack = resolvePack(coinAmount, costCents);
    if (!pack) {
      return jsonError("Invalid coin bundle selection.", 400);
    }

    const appUrl = getAppUrl();
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `💎 ${pack.coinAmount} PARABLE Coin Bundle`,
              description: "In-app currency used to support live streamers with digital gifts.",
            },
            unit_amount: pack.costCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentType: "coin_purchase",
        userId,
        coinAmount: String(pack.coinAmount),
      },
      ...(userEmail ? { customer_email: userEmail } : {}),
      success_url: `${appUrl}/wallet?success=true`,
      cancel_url: `${appUrl}/wallet?canceled=true`,
    });

    if (!session.url) {
      return jsonError("Stripe did not return a checkout URL.", 502);
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("[COIN CHECKOUT SESSION ERROR]:", error);
    return jsonError(stripeErrorMessage(error), 500);
  }
}
