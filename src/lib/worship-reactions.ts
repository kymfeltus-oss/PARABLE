/**
 * Black church / worship reaction lexicon for live streams.
 * Used by GiftOverlayCanvas, watch HUD, and gift_catalog SKUs.
 */

export const WORSHIP_GIFT_EMOJI: Record<string, string> = {
  gift_amen: "🙏",
  gift_praise: "🙌",
  gift_clap: "👏",
  gift_applause: "👏",
  gift_fire: "🔥",
  gift_offering: "💰",
  gift_glory: "✨",
  gift_peace: "🕊️",
  gift_word: "📖",
  gift_love: "❤️",
  /** Legacy SKUs — map to worship emojis */
  gift_controller: "📖",
  gift_trophy: "✨",
};

export type WorshipReactionKind =
  | "amen"
  | "praise"
  | "clap"
  | "fire"
  | "offering"
  | "glory"
  | "peace"
  | "word"
  | "love";

export const WORSHIP_REACTION_KIND_TO_SKU: Record<WorshipReactionKind, string> = {
  amen: "gift_amen",
  praise: "gift_praise",
  clap: "gift_clap",
  fire: "gift_fire",
  offering: "gift_offering",
  glory: "gift_glory",
  peace: "gift_peace",
  word: "gift_word",
  love: "gift_love",
};

/** Quick-action buttons on the watch player HUD */
export const WORSHIP_HUD_BUTTONS: ReadonlyArray<{
  kind: WorshipReactionKind;
  emoji: string;
  label: string;
  title: string;
}> = [
  { kind: "amen", emoji: "🙏", label: "Amen", title: "Amen" },
  { kind: "praise", emoji: "🙌", label: "Praise", title: "Praise hands" },
  { kind: "clap", emoji: "👏", label: "Clap", title: "Clap offering" },
  { kind: "fire", emoji: "🔥", label: "Fire", title: "Holy fire" },
  { kind: "offering", emoji: "💰", label: "Seed", title: "Offering" },
  { kind: "glory", emoji: "✨", label: "Glory", title: "Glory" },
  { kind: "peace", emoji: "🕊️", label: "Peace", title: "Holy Spirit peace" },
  { kind: "word", emoji: "📖", label: "Word", title: "The Word" },
  { kind: "love", emoji: "❤️", label: "Love", title: "Love" },
];

/** Variation for amen-style floating waves */
export const AMEN_WORSHIP_EMOJIS = ["🙏", "🙌", "✨", "🔥"] as const;

export function emojiForGiftSku(sku: string | null | undefined): string {
  if (!sku) return "✨";
  return WORSHIP_GIFT_EMOJI[sku] ?? "✨";
}

export function emojiForReactionKind(kind: WorshipReactionKind): string {
  const sku = WORSHIP_REACTION_KIND_TO_SKU[kind];
  return WORSHIP_GIFT_EMOJI[sku] ?? "✨";
}

export function skuForReactionKind(kind: WorshipReactionKind): string {
  return WORSHIP_REACTION_KIND_TO_SKU[kind];
}

/** Profile / gift picker rows (coin costs match schema-gifts.sql) */
export const WORSHIP_GIFT_OPTIONS: ReadonlyArray<{
  sku: string;
  label: string;
  cost: string;
  kind: WorshipReactionKind;
}> = [
  { kind: "amen", sku: "gift_amen", label: "Amen 🙏", cost: "25c" },
  { kind: "praise", sku: "gift_praise", label: "Praise 🙌", cost: "40c" },
  { kind: "clap", sku: "gift_clap", label: "Clap 👏", cost: "50c" },
  { kind: "fire", sku: "gift_fire", label: "Fire 🔥", cost: "75c" },
  { kind: "offering", sku: "gift_offering", label: "Offering 💰", cost: "100c" },
  { kind: "glory", sku: "gift_glory", label: "Glory ✨", cost: "60c" },
  { kind: "peace", sku: "gift_peace", label: "Peace 🕊️", cost: "45c" },
  { kind: "word", sku: "gift_word", label: "Word 📖", cost: "55c" },
  { kind: "love", sku: "gift_love", label: "Love ❤️", cost: "35c" },
];
