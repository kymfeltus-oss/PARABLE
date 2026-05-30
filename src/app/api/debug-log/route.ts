import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const LOG_PATH = path.join(process.cwd(), ".cursor", "debug-7d4ac5.log");

/** Dev-only NDJSON append for debug-mode client instrumentation. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const payload = await request.json();
    await mkdir(path.dirname(LOG_PATH), { recursive: true });
    await appendFile(LOG_PATH, `${JSON.stringify(payload)}\n`, "utf8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
