/**
 * Placeholder until a real model / edge function backs the AI Architect panel.
 */
export function mockSermonOutlineFromScripture(scripture: string): string {
  const t = scripture.trim() || "your passage";
  const short = t.length > 120 ? `${t.slice(0, 117)}…` : t;
  return [
    "## Sermon outline",
    "",
    `**Text:** ${short}`,
    "",
    "1. **Opening** — Image or question that lands the stakes.",
    "2. **Situate** — Brief context: audience, place, tension in the text.",
    "3. **Main idea** — One sentence that could be tweeted.",
    "4. **Body (move one)** — First movement: exegesis and why it mattered then.",
    "5. **Body (move two)** — Second movement: connection to Christ / cross / hope.",
    "6. **Application** — One concrete obedience step for this week.",
    "7. **Close & prayer** — Return to the main idea; invite response.",
    "",
    "_(Mock AI — swap for `generate_sermon_outline` RPC or OpenAI when ready.)_",
  ].join("\n");
}
