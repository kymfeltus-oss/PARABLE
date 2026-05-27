import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  getParableGuestUserId,
  isParableDevGuestAllowed,
} from "@/lib/parable-dev-guest";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey || serviceRoleKey.includes("your_private")) {
    throw new Error("Server misconfiguration: Supabase admin credentials missing.");
  }
  return createClient(url, serviceRoleKey);
}

async function resolveLedgerUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization") ?? "";
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (jwt) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;

    const supabase = createClient(url, anonKey);
    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);
    return user?.id ?? null;
  }

  if (isParableDevGuestAllowed(request)) {
    const requested = new URL(request.url).searchParams.get("userId")?.trim();
    const guestId = getParableGuestUserId();
    return requested === guestId ? guestId : guestId;
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const userId = await resolveLedgerUserId(request);
    if (!userId) {
      return jsonError("Unauthorized: sign in required to load wallet ledger.", 401);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("creator_ledger_entries")
      .select("id, amount_cents, coin_amount, source_type, description, created_at")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[wallet/ledger] Supabase query failed:", error);
      return jsonError("Failed to load wallet ledger.", 500);
    }

    return NextResponse.json({ entries: data ?? [] });
  } catch (err) {
    console.error("[wallet/ledger] crash:", err);
    if (
      err instanceof Error &&
      err.message.includes("Supabase admin") &&
      isParableDevGuestAllowed(request)
    ) {
      return NextResponse.json({
        entries: [],
        notice: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local to load ledger history.",
      });
    }
    const message =
      err instanceof Error && err.message.includes("Supabase admin")
        ? "Wallet ledger is unavailable until SUPABASE_SERVICE_ROLE_KEY is set in .env.local."
        : "Failed to load wallet ledger.";
    return jsonError(message, 500);
  }
}
