import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the PARABLE De-Coder: you explain biblical words in their original language (Hebrew for OT, Greek for NT). For each word the user asks about, respond with a JSON object only, no other text, in this exact shape:
{
  "original": "the word in Hebrew or Greek script",
  "transliteration": "romanized spelling",
  "gloss": "brief English meaning (1–8 words)",
  "strongs": "e.g. H1234 or G5678 if you know it, else null",
  "usages": ["Reference (e.g. Genesis 1:1) – short note on how it's used here.", "Up to 2 more if relevant."]
}
Rules: Use the passage context to pick the right sense. For English words (e.g. "Word", "light") give the underlying Greek/Hebrew from the passage. Keep usages concise. Output valid JSON only.`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "De-Coder is not configured. Add OPENAI_API_KEY to your environment." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const word = typeof body?.word === "string" ? body.word.trim() : "";
    const verseRef = typeof body?.verseRef === "string" ? body.verseRef.trim() : "";
    const verseText = typeof body?.verseText === "string" ? body.verseText.trim() : "";

    if (!word) {
      return NextResponse.json(
        { error: "Please provide a word to decode." },
        { status: 400 }
      );
    }

    const userContent = [verseRef && `Passage: ${verseRef}`, verseText && verseText, `Word or phrase to decode: ${word}`]
      .filter(Boolean)
      .join("\n\n");

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
        max_tokens: 512,
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI decoder error:", res.status, err);
      return NextResponse.json(
        { error: "The De-Coder could not complete your request. Try again later." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? "";

    // Strip possible markdown code fence
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    let decoded: { original?: string; transliteration?: string; gloss?: string; strongs?: string | null; usages?: string[] };
    try {
      decoded = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "The De-Coder returned an invalid response. Try another word." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      original: decoded.original ?? "",
      transliteration: decoded.transliteration ?? "",
      gloss: decoded.gloss ?? "",
      strongs: decoded.strongs ?? null,
      usages: Array.isArray(decoded.usages) ? decoded.usages : [],
    });
  } catch (e) {
    console.error("Decoder error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
