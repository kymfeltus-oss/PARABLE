import { NextResponse } from "next/server";
import { clampStr, completeOpenAI } from "@/lib/writers-openai";

const SYSTEM = `You output only valid JSON, no markdown. Given a script excerpt, return a storyboard as a JSON object with key "shots" whose value is an array of 6 to 8 objects. Each object must have "caption" (string, one line: shot type + brief visual, e.g. "WIDE — parking lot at dusk") and "note" (string, optional lens or mood hint). No other keys.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const script = clampStr(body.script, 12_000);
    if (script.length < 20) {
      return NextResponse.json({ error: "Paste a longer script excerpt for storyboard beats." }, { status: 400 });
    }

    const result = await completeOpenAI({
      system: SYSTEM,
      user: `Script:\n\n${script}\n\nReturn JSON: {"shots":[{"caption":"...","note":"..."},...]}`,
      maxTokens: 900,
      temperature: 0.45,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    let parsed: { shots?: Array<{ caption?: string; note?: string }> };
    try {
      const raw = result.text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      parsed = JSON.parse(raw) as { shots?: Array<{ caption?: string; note?: string }> };
    } catch {
      return NextResponse.json({ error: "Could not parse storyboard. Try again." }, { status: 502 });
    }

    const shots = Array.isArray(parsed.shots) ? parsed.shots : [];
    const normalized = shots
      .map((s, i) => ({
        id: `shot-${i}-${Date.now()}`,
        caption: clampStr(s.caption, 400) || `Beat ${i + 1}`,
        note: clampStr(s.note, 200),
      }))
      .slice(0, 10);

    if (!normalized.length) {
      return NextResponse.json({ error: "Empty storyboard result." }, { status: 502 });
    }

    return NextResponse.json({ shots: normalized });
  } catch (e) {
    console.error("studio/storyboard:", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
