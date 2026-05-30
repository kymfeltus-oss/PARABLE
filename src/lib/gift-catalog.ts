import { emojiForGiftSku as worshipEmojiForSku } from "@/lib/worship-reactions";

export interface GiftSku {
  id: string;
  name: string;
  priceInCents: number;
  emojiIcon: string;
  /** Coin cost when Supabase catalog is unavailable (matches schema-gifts.sql). */
  coinCost: number;
}

/** Local fallback when `gift_catalog` is missing or unreachable. */
export const FALLBACK_GIFT_CATALOG_SKUS: GiftSku[] = [
  { id: "gift_amen", name: "Amen", priceInCents: 25, emojiIcon: "🙏", coinCost: 25 },
  { id: "gift_praise", name: "Praise", priceInCents: 40, emojiIcon: "🙌", coinCost: 40 },
  { id: "gift_clap", name: "Clap", priceInCents: 50, emojiIcon: "👏", coinCost: 50 },
  { id: "gift_fire", name: "Holy Fire", priceInCents: 75, emojiIcon: "🔥", coinCost: 75 },
  { id: "gift_offering", name: "Offering", priceInCents: 100, emojiIcon: "💰", coinCost: 100 },
  { id: "gift_glory", name: "Glory", priceInCents: 60, emojiIcon: "✨", coinCost: 60 },
  { id: "gift_peace", name: "Peace", priceInCents: 45, emojiIcon: "🕊️", coinCost: 45 },
  { id: "gift_word", name: "The Word", priceInCents: 55, emojiIcon: "📖", coinCost: 55 },
  { id: "gift_love", name: "Love", priceInCents: 35, emojiIcon: "❤️", coinCost: 35 },
];

export function getFallbackGiftBySku(sku: string): GiftSku | undefined {
  return FALLBACK_GIFT_CATALOG_SKUS.find((item) => item.id === sku);
}

type CatalogRow = { sku?: string; id?: string; emoji_icon?: string; name?: string };

export function emojiForGiftSku(
  skuId: string | null | undefined,
  databaseItems?: CatalogRow[] | null,
): string {
  if (!skuId) return "✨";

  if (databaseItems?.length) {
    const match = databaseItems.find(
      (item) => item.sku === skuId || item.id === skuId,
    );
    if (match?.emoji_icon) return match.emoji_icon;
  }

  const fallback = getFallbackGiftBySku(skuId);
  if (fallback) return fallback.emojiIcon;

  return worshipEmojiForSku(skuId);
}
