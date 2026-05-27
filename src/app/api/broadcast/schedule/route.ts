import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  getParableGuestUserId,
  isParableDevGuestAllowed,
  PARABLE_GUEST_PROFILE,
} from "@/lib/parable-dev-guest";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isServiceRoleConfigured(): boolean {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) return false;
  if (serviceRoleKey.includes("your_private")) return false;
  if (serviceRoleKey.includes("placeholder")) return false;
  return true;
}

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey || !isServiceRoleConfigured()) {
    return null;
  }
  return createClient(url, serviceRoleKey);
}

async function resolveCreatorUserId(request: Request): Promise<string | null> {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get("creatorId")?.trim();
  if (creatorId) return creatorId;

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
    const requested = searchParams.get("userId")?.trim();
    const guestId = getParableGuestUserId();
    return requested === guestId ? guestId : guestId;
  }

  return null;
}

async function ensureCreatorProfileExists(
  supabaseAdmin: SupabaseClient,
  userId: string,
  request: Request,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existingProfile?.id) {
    return { ok: true };
  }

  const isGuestDevUser =
    isParableDevGuestAllowed(request) && userId === getParableGuestUserId();

  const { data: authLookup, error: authLookupError } =
    await supabaseAdmin.auth.admin.getUserById(userId);

  if (authLookupError && !authLookupError.message.toLowerCase().includes("not found")) {
    return { ok: false, error: `Could not verify creator account: ${authLookupError.message}` };
  }

  if (!authLookup?.user) {
    const email = isGuestDevUser
      ? "dev-guest@parable.local"
      : `creator-${userId.slice(0, 8)}@parable.local`;

    const { error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      id: userId,
      email,
      email_confirm: true,
      user_metadata: isGuestDevUser
        ? {
            username: PARABLE_GUEST_PROFILE.username,
            full_name: PARABLE_GUEST_PROFILE.full_name,
          }
        : {},
    });

    if (
      createUserError &&
      !createUserError.message.toLowerCase().includes("already") &&
      !createUserError.message.toLowerCase().includes("registered")
    ) {
      return { ok: false, error: `Could not provision creator account: ${createUserError.message}` };
    }
  }

  const profilePayload = isGuestDevUser
    ? {
        id: userId,
        username: PARABLE_GUEST_PROFILE.username,
        full_name: PARABLE_GUEST_PROFILE.full_name,
        role: PARABLE_GUEST_PROFILE.role,
        onboarding_complete: PARABLE_GUEST_PROFILE.onboarding_complete,
      }
    : {
        id: userId,
        username: `user-${userId.slice(0, 8)}`,
        full_name: "",
        role: "user",
        onboarding_complete: true,
      };

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(profilePayload);
  if (profileError) {
    return { ok: false, error: `Could not provision creator profile: ${profileError.message}` };
  }

  return { ok: true };
}

type ScheduleBody = {
  title?: string;
  scheduled_start?: string;
  estimated_duration_mins?: number;
};

export async function GET(request: Request) {
  try {
    if (!isServiceRoleConfigured()) {
      return NextResponse.json(
        { error: "Server misconfiguration: Service role key missing." },
        { status: 503 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfiguration: Supabase admin client unavailable." },
        { status: 503 },
      );
    }

    const creatorId = await resolveCreatorUserId(request);
    if (!creatorId) {
      return jsonError("Unauthorized: sign in required to load broadcast schedule.", 401);
    }

    let query = supabaseAdmin
      .from("broadcast_schedule")
      .select("id, creator_id, title, description, scheduled_start, estimated_duration_mins, created_at")
      .eq("creator_id", creatorId)
      .order("scheduled_start", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("[SCHEDULE FETCH DATABASE ERROR]:", error.message, error);
      return NextResponse.json(
        { error: `Database rejected query: ${error.message}` },
        { status: 400 },
      );
    }

    return NextResponse.json({ schedule: data ?? [] });
  } catch (error) {
    console.error("[SCHEDULE ROUTE CRASH]:", error);
    return NextResponse.json({ error: "Internal schedule query pipeline failure." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isServiceRoleConfigured()) {
      return NextResponse.json(
        { error: "Server misconfiguration: Service role key missing." },
        { status: 503 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfiguration: Supabase admin client unavailable." },
        { status: 503 },
      );
    }

    const userId = await resolveCreatorUserId(request);
    if (!userId) {
      return jsonError("Unauthorized: sign in required to create broadcast events.", 401);
    }

    const body = (await request.json()) as ScheduleBody;
    const title = body.title?.trim();
    const scheduledStart = body.scheduled_start?.trim();
    const duration = Number(body.estimated_duration_mins ?? 60);

    const ensureProfile = await ensureCreatorProfileExists(supabaseAdmin, userId, request);
    if (!ensureProfile.ok) {
      return NextResponse.json({ error: ensureProfile.error }, { status: 400 });
    }

    if (!title || !scheduledStart) {
      return jsonError("Missing title or scheduled_start.", 400);
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      return jsonError("estimated_duration_mins must be a positive number.", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("broadcast_schedule")
      .insert({
        creator_id: userId,
        title,
        scheduled_start: new Date(scheduledStart).toISOString(),
        estimated_duration_mins: duration,
      })
      .select("id, creator_id, title, description, scheduled_start, estimated_duration_mins, created_at")
      .single();

    if (error) {
      console.error("[SCHEDULE INSERT DATABASE ERROR]:", error.message, error);
      return NextResponse.json(
        { error: `Database rejected query: ${error.message}` },
        { status: 400 },
      );
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    console.error("[SCHEDULE ROUTE CRASH]:", error);
    return NextResponse.json({ error: "Internal schedule query pipeline failure." }, { status: 500 });
  }
}
