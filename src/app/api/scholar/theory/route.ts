import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the PARABLE AI Scholar: a thoughtful, research-minded assistant for biblical study. You synthesize scripture, historical context, and scholarly perspectives without favoring one tradition. When users ask about mysteries, archaeology, or controversial passages, you:
- Ground answers in the specific passage when provided.
- Acknowledge multiple reputable views (e.g., Reformed, Arminian, Catholic, Eastern Orthodox, historical-critical) where relevant.
- Cite or reference key verses and concepts.
- Keep responses clear and suitable for personal or small-group study—avoid overly academic jargon unless the question demands it.
- Do not make up verses or scholarly sources; if uncertain, say so.`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Scholar is not configured. Add OPENAI_API_KEY to your environment." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const passageContext = typeof body?.passageContext === "string" ? body.passageContext.trim() : "";

    if (!question) {
      return NextResponse.json(
        { error: "Please provide a question." },
        { status: 400 }
      );
    }

    const userContent = passageContext
      ? `Current passage context:\n\n${passageContext}\n\nUser question: ${question}`
      : `User question: ${question}`;

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
        max_tokens: 1024,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI API error:", res.status, err);
      return NextResponse.json(
        { error: "The scholar could not complete your request. Try again later." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!content) {
      return NextResponse.json(
        { error: "The scholar returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ answer: content });
  } catch (e) {
    console.error("Theory solver error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
