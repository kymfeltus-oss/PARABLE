import type { SubscriptionTier } from '@/types/monetization';
import { createClient } from '@/utils/supabase/client';

export interface UserChatDisplayPerks {
  badge: string;
  color: string;
  chat_highlight: boolean;
}

export const DEFAULT_CHAT_PERKS: UserChatDisplayPerks = {
  badge: '',
  color: '#94a3b8',
  chat_highlight: false,
};

type SubscriptionPerksRow = {
  status: string;
  subscription_tiers: { perks: SubscriptionTier['perks'] } | null;
};

function normalizePerks(raw: SubscriptionTier['perks'] | null | undefined): UserChatDisplayPerks {
  return {
    badge: raw?.badge ?? '',
    color: raw?.color ?? DEFAULT_CHAT_PERKS.color,
    chat_highlight: Boolean(raw?.chat_highlight),
  };
}

/** Fetches a user's active tier styling for chat (single query, RLS-safe via anon client). */
export async function getUserChatPerks(userId: string): Promise<UserChatDisplayPerks> {
  if (!userId) return DEFAULT_CHAT_PERKS;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(
        `
        status,
        subscription_tiers (
          perks
        )
      `,
      )
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) return DEFAULT_CHAT_PERKS;

    const row = data as unknown as SubscriptionPerksRow;
    if (!row.subscription_tiers?.perks) return DEFAULT_CHAT_PERKS;

    return normalizePerks(row.subscription_tiers.perks);
  } catch {
    return DEFAULT_CHAT_PERKS;
  }
}
