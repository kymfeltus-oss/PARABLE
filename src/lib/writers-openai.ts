const MAX_USER_CHARS = 24_000;

export type OpenAIResult =
  | { ok: true; text: string }
  | { ok: false; status: number; error: string };

export async function completeOpenAI(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<OpenAIResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 503, error: "AI is not configured. Add OPENAI_API_KEY to your environment." };
  }

  const user = input.user.length > MAX_USER_CHARS ? input.user.slice(0, MAX_USER_CHARS) : input.user;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: user },
      ],
      max_tokens: input.maxTokens ?? 3_500,
      temperature: input.temperature ?? 0.55,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Writers OpenAI error:", res.status, err);
    return {
      ok: false,
      status: 502,
      error: "The AI service could not complete this request. Try again in a moment.",
    };
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data?.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) {
    return { ok: false, status: 502, error: "The model returned an empty response." };
  }

  return { ok: true, text };
}

export function clampStr(s: unknown, max: number): string {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, max);
}
