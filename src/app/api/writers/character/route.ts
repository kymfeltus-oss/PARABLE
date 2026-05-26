import { NextResponse } from "next/server";
import { clampStr, completeOpenAI } from "@/lib/writers-openai";

const CHAR_MODES = ["sheet", "voice", "arc", "ensemble"] as const;
type CharMode = (typeof CHAR_MODES)[number];

const SYSTEM = `You are PARABLE Character Lab — a dramaturg and character designer for faith-informed stories (film, series, shorts, novels).
Rules:
- Build psychologically coherent characters: want, wound, misbelief, and how faith or moral pressure surfaces in behavior (not only speech).
- Avoid stereotypes; give specific, cinematic details. Invent names if missing.
- Do not copy existing franchise characters. Original work only.
- Output in Markdown with clear ## headings exactly as requested in the user prompt.
- Refuse harmful or exploitative requests and suggest a redemptive framing instead.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const mode = clampStr(body.mode, 32) as CharMode;
    if (!CHAR_MODES.includes(mode)) {
      return NextResponse.json({ error: "Invalid character mode." }, { status: 400 });
    }

    const seed = clampStr(body.seed, 8_000);
    if (seed.length < 6) {
      return NextResponse.json(
        { error: "Add a short character seed (name, role, or concept)." },
        { status: 400 }
      );
    }

    const name = clampStr(body.name, 120);
    const role = clampStr(body.role, 200);
    const ageRange = clampStr(body.ageRange, 80);
    const traits = clampStr(body.traits, 1_500);
    const conflict = clampStr(body.conflict, 2_000);
    const world = clampStr(body.world, 1_500);
    const foilName = clampStr(body.foilName, 120);
    const notes = clampStr(body.notes, 3_000);

    const modeBlock: Record<CharMode, string> = {
      sheet: `Produce a Character Bible using exactly these sections and headings:
## Snapshot
## Core want & fear
## Wound & misbelief
## Moral / faith pressure
## Voice & speech patterns
## Relationships
## Scene-ready secrets
## Potential arc (Season 1)
## Casting notes (optional, non-physical stereotypes)`,

      voice: `Produce:
## Voice summary (2–3 sentences)
## Vocabulary & rhythm
## 10 sample lines (vary context: stress, tenderness, humor, confrontation)
## What they never say (subtext)
## Dialogue exercises (prompts for the writer)`,

      arc: `Produce:
## Starting point
## Inciting pressure
## Midpoint shift
## Crisis / all is lost
## Climax choice
## Resolution image
## Thematic statement tied to character`,

      ensemble: `This character interacts with a foil/partner. Produce:
## Dynamic overview
## Complementary strengths
## Friction points
## Shared wound or shared mission (if any)
## Three scene ideas that exploit the dynamic
## Line of dialogue for each voice (A / B) in one tense moment`,
    };

    const context = [
      mode === "ensemble" && foilName && `Foil / other character name: ${foilName}`,
      name && `Name: ${name}`,
      role && `Role: ${role}`,
      ageRange && `Age range: ${ageRange}`,
      traits && `Traits / adjectives: ${traits}`,
      conflict && `Central conflict: ${conflict}`,
      world && `Story world: ${world}`,
      notes && `Writer notes: ${notes}`,
      "",
      "Character seed:",
      seed,
    ]
      .filter(Boolean)
      .join("\n");

    const user = `${modeBlock[mode]}\n\n${context}`;

    const result = await completeOpenAI({
      system: SYSTEM,
      user,
      maxTokens: mode === "sheet" ? 3_500 : 2_800,
      temperature: 0.55,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ content: result.text });
  } catch (e) {
    console.error("writers/character:", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
