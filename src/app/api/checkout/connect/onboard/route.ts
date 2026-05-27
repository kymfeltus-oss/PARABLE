import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Server misconfiguration: Supabase admin credentials missing.");
  }
  return createClient(url, serviceRoleKey);
}

function stripeErrorMessage(error: unknown): string {
  if (error instanceof Stripe.errors.StripeError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to initiate payout registration onboarding routing.";
}

type ConnectOnboardBody = {
  userId?: string;
  userEmail?: string;
};

export async function POST(request: Request) {
  const configError = getStripeConfigError();
  if (configError) {
    return jsonError(configError, 503);
  }

  try {
    const body = (await request.json()) as ConnectOnboardBody;
    const userId = body.userId?.trim();
    const userEmail = body.userEmail?.trim();

    if (!userId) {
      return jsonError("Missing userId identification parameter.", 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const stripe = getStripe();
    const appUrl = getAppUrl();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_connect_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("[STRIPE CONNECT PROFILE LOOKUP]:", profileError);
      return jsonError("Could not load creator profile.", 500);
    }

    let accountId = profile?.stripe_connect_id?.trim() || null;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: userEmail || undefined,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: { userId },
      });
      accountId = account.id;

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ stripe_connect_id: accountId })
        .eq("id", userId);

      if (updateError) {
        console.error("[STRIPE CONNECT PROFILE UPDATE]:", updateError);
        return jsonError("Stripe account created but profile update failed.", 500);
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard/payouts?refresh=true`,
      return_url: `${appUrl}/dashboard/payouts?success=true`,
      type: "account_onboarding",
    });

    if (!accountLink.url) {
      return jsonError("Stripe did not return an onboarding URL.", 502);
    }

    return NextResponse.json({ url: accountLink.url, accountId });
  } catch (error) {
    console.error("[STRIPE CONNECT ONBOARD ERROR]:", error);
    return jsonError(stripeErrorMessage(error), 500);
  }
}
