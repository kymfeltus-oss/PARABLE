import { NextResponse } from "next/server";

import Stripe from "stripe";

import {

  formatStripePriceId,

  getStripeConfigError,

  resolveStripeSecretKey,

} from "@/lib/stripe-config";



export const runtime = "nodejs";



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

  return "Internal checkout pipe failure";

}



type CheckoutBody = {

  priceId?: string;

  userId?: string;

  userEmail?: string;

};



export async function POST(request: Request) {

  const configError = getStripeConfigError();

  if (configError) {

    return jsonError(configError, 503);

  }



  try {

    const body = (await request.json()) as CheckoutBody;

    const priceId = formatStripePriceId(body.priceId ?? "");

    const userId = body.userId?.trim();

    const userEmail = body.userEmail?.trim();



    if (!priceId || !userId) {

      return jsonError("Missing priceId or userId parameters.", 400);

    }



    const appUrl = getAppUrl();

    const stripe = getStripe();



    const session = await stripe.checkout.sessions.create({

      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [{ price: priceId, quantity: 1 }],

      metadata: { userId },

      ...(userEmail ? { customer_email: userEmail } : {}),

      success_url: `${appUrl}/contribution-tiers?success=true`,

      cancel_url: `${appUrl}/contribution-tiers?canceled=true`,

    });



    if (!session.url) {

      return jsonError("Stripe did not return a checkout URL. Verify the Price ID exists in your Stripe account.", 502);

    }



    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error) {

    console.error("[STRIPE CHECKOUT CRASH CAUGHT]:", error);

    return jsonError(stripeErrorMessage(error), 500);

  }

}

