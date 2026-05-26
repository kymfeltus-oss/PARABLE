import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatPayload = {
  streamId?: string;
  message?: { id?: string; user?: string; text?: string };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatPayload;
    const streamId = body.streamId?.trim();
    const message = body.message;

    if (!streamId || !message?.text?.trim()) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    // Buffer / log only — avoids per-message Supabase writes on the hot chat path.
    console.log(`[STREAM METRIC LOG] Message buffered for stream ${streamId}:`, message.text);

    return NextResponse.json({ success: true, status: "buffered" });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal pipeline bypass failure" },
      { status: 500 },
    );
  }
}
