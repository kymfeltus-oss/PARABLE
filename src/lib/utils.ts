/**
 * Small shared helpers (names, formatting). Kept dependency-free.
 */

const DISPLAY_NAMES = [
  "Sarah M.",
  "James K.",
  "Michael T.",
  "Ruth E.",
  "David L.",
  "Esther V.",
  "Noah P.",
  "Maria S.",
  "Daniel H.",
  "Hannah R.",
  "Jonah W.",
  "Abigail F.",
  "Caleb N.",
  "Rebekah J.",
  "Samuel Y.",
  "Naomi B.",
  "Ezekiel C.",
  "Lydia A.",
  "Timothy G.",
  "Priscilla O.",
] as const;

/**
 * Stable fake display name for demos (indexes into a fixed list so renders stay consistent).
 */
export function getFakeUserName(index = 0): string {
  const i = Math.abs(Math.floor(index)) % DISPLAY_NAMES.length;
  return DISPLAY_NAMES[i];
}

/** Demo filler text (Instagram clone parity). */
export function getRandomBlah(): string {
  return "Blah ".repeat(Math.floor(Math.random() * 12) + 3);
}
