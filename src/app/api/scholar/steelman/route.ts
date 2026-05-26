import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the PARABLE Steel Man Debater. For a given Bible passage, you present the strongest, most charitable versions of two differing theological views (e.g. Reformed vs Arminian, or Calvinist vs Wesleyan, or Catholic vs Protestant on a specific point). You do not strawman either side. Respond with a JSON object only, no other text:
{
  "sharedGround": "1–3 sentences on what both traditions generally agree on regarding this passage.",
  "viewA": { "name": "e.g. Reformed", "summary": "2–4 sentences: the strongest case for this view on this passage, with key verses or concepts." },
  "viewB": { "name": "e.g. Arminian", "summary": "2–4 sentences: the strongest case for this view on this passage, with key verses or concepts." }
}
Pick two views that are relevant to the passage. Be fair and accurate. Output valid JSON only.`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Steel Man is not configured. Add OPENAI_API_KEY to your environment." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const verseRef = typeof body?.verseRef === "string" ? body.verseRef.trim() : "";
    const verseText = typeof body?.verseText === "string" ? body.verseText.trim() : "";

    if (!verseRef && !verseText) {
      return NextResponse.json(
        { error: "Please provide a verse reference or passage text." },
        { status: 400 }
      );
    }

    const userContent = [verseRef && `Passage: ${verseRef}`, verseText && verseText].filter(Boolean).join("\n\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI steelman error:", res.status, err);
      return NextResponse.json(
        { error: "The Steel Man could not complete your request. Try again later." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? "";
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    let parsed: {
      sharedGround?: string;
      viewA?: { name?: string; summary?: string };
      viewB?: { name?: string; summary?: string };
    };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "The Steel Man returned an invalid response. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      sharedGround: parsed.sharedGround ?? "",
      viewA: {
        name: parsed.viewA?.name ?? "View A",
        summary: parsed.viewA?.summary ?? "",
      },
      viewB: {
        name: parsed.viewB?.name ?? "View B",
        summary: parsed.viewB?.summary ?? "",
      },
    });
  } catch (e) {
    console.error("Steelman error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
