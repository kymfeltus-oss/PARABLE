import { NextResponse } from "next/server";
import { clampStr, completeOpenAI } from "@/lib/writers-openai";

const SCRIPT_MODES = ["outline", "beats", "scene", "dialogue", "rewrite"] as const;
type ScriptMode = (typeof SCRIPT_MODES)[number];

const SYSTEM = `You are PARABLE Writer Studio — an expert screenwriter and story architect for faith-informed fiction and cinematic parables.
Rules:
- Write with clarity, strong scene intention, and emotionally honest characters. Avoid preachy monologues; show change through action and subtext.
- Respect the user's genre and tone. If the premise is light, keep it warm; if heavy, stay grounded and hopeful without minimizing pain.
- Do not reproduce copyrighted scripts or real TV/film dialogue. Invent original lines.
- Format output in clean Markdown: titles with ##, lists where useful, scene headings like INT./EXT. when appropriate.
- If the user asks for something unsafe or exploitative, refuse briefly and offer a redemptive alternative angle.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const mode = clampStr(body.mode, 32) as ScriptMode;
    if (!SCRIPT_MODES.includes(mode)) {
      return NextResponse.json({ error: "Invalid script mode." }, { status: 400 });
    }

    const premise = clampStr(body.premise, 8_000);
    if (premise.length < 8) {
      return NextResponse.json({ error: "Add a short premise or logline (at least a sentence)." }, { status: 400 });
    }

    const genre = clampStr(body.genre, 120);
    const tone = clampStr(body.tone, 120);
    const length = clampStr(body.length, 24) || "medium";
    const existingScript = clampStr(body.existingScript, 12_000);
    const notes = clampStr(body.notes, 4_000);

    if (mode === "rewrite" && existingScript.length < 24) {
      return NextResponse.json(
        { error: "Rewrite mode needs an existing draft to work with (paste at least a short scene)." },
        { status: 400 }
      );
    }

    const modeInstruction: Record<ScriptMode, string> = {
      outline:
        "Produce a three-act (or five-beat) outline with clear turning points, midpoint, climax, and resolution. Include a one-line theme statement.",
      beats:
        "Produce numbered scene beats (1–2 lines each). Aim for 12–24 beats depending on length setting. Note emotional shift per beat.",
      scene:
        "Write one complete scene in screenplay-style: slug lines, action lines, and dialogue. ~800–1500 words depending on length.",
      dialogue:
        "Write a dialogue-forward scene: minimal action, strong character voices, subtext. Include brief character names in ALL CAPS for speakers.",
      rewrite:
        "Rewrite and elevate the Existing draft: tighten pacing, clarify objectives, deepen subtext. Keep the same core story intent. Show the full revised draft.",
    };

    const userBlock = [
      `Mode: ${mode}`,
      `Length preference: ${length} (short = compact, medium = standard, long = more pages/beats)`,
      genre && `Genre: ${genre}`,
      tone && `Tone: ${tone}`,
      notes && `Notes: ${notes}`,
      "",
      "Premise / logline:",
      premise,
      mode === "rewrite" ? ["", "Existing draft to rewrite:", existingScript].join("\n") : "",
    ]
      .filter(Boolean)
      .join("\n");

    const user = `${modeInstruction[mode]}\n\n${userBlock}`;

    const result = await completeOpenAI({
      system: SYSTEM,
      user,
      maxTokens: mode === "outline" || mode === "beats" ? 2_800 : 4_000,
      temperature: mode === "rewrite" ? 0.45 : 0.55,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ content: result.text });
  } catch (e) {
    console.error("writers/script:", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
