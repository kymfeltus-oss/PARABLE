import { NextResponse } from "next/server";
import {
  isParableDevGuestAllowed,
  PARABLE_GUEST_PROFILE,
} from "@/lib/parable-dev-guest";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isParableDevGuestAllowed(req)) {
    return NextResponse.json({ guest: false });
  }
  return NextResponse.json({ guest: true, profile: { ...PARABLE_GUEST_PROFILE } });
}
