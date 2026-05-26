import { NextResponse } from "next/server";
import { clampStr, completeOpenAI } from "@/lib/writers-openai";

const SYSTEM = `You are a screenplay assistant for film and streaming. Given the current script excerpt, write ONLY the next line or short block: either a character line (NAME in caps) or a brief action line. No commentary, no markdown fences, no labels like "Suggestion:". Match the established voice and format.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const script = clampStr(body.script, 14_000);
    if (script.length < 4) {
      return NextResponse.json({ error: "Add a few lines of script first." }, { status: 400 });
    }

    const result = await completeOpenAI({
      system: SYSTEM,
      user: `Continue from this script:\n\n${script}`,
      maxTokens: 400,
      temperature: 0.65,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ suggestion: result.text });
  } catch (e) {
    console.error("studio/collaborate:", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
