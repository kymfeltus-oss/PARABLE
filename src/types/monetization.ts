export interface SubscriptionTier {
  id: string;
  name: string;
  stripe_price_id: string;
  cost_cents: number;
  perks: {
    badge: string;
    color: string;
    chat_highlight: boolean;
  };
}

export interface GiftItem {
  id: string;
  name: string;
  sku: string;
  coin_cost: number;
  animation_manifest: {
    particles: string;
    speed: "slow" | "normal" | "fast";
    scale: number;
  };
}
