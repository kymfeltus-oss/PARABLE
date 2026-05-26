import { createClient } from '@/utils/supabase/client';
import type { SanctuaryChannel } from '@/lib/sanctuary-following';

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export function profileRowToSuggestionChannel(row: ProfileRow): SanctuaryChannel {
  const username = (row.username || 'member').trim() || 'member';
  const display = (row.full_name?.trim() || username || 'Member').slice(0, 80);
  const parts = display.split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
      : (display.slice(0, 2) || 'ME').toUpperCase();

  const handle = `@${username.toLowerCase().replace(/\s+/g, '')}`;

  return {
    id: row.id,
    name: display,
    handle,
    avatarLabel: initials,
    isLive: false,
    viewers: 'On Parable',
    avatarUrl: row.avatar_url || undefined,
    tagline: `Registered • ${handle}`,
    source: 'registered',
  };
}

export type RegisteredSuggestionsResult = {
  channels: SanctuaryChannel[];
  /** Set when auth fails, RLS blocks, or the request errors */
  errorMessage: string | null;
};

/**
 * Loads other rows from `public.profiles` (excludes JWT user).
 * Uses `getUser()` so we never depend on React state lagging behind the session.
 * Requires `profiles-discovery-policy.sql` RLS so authenticated users can read peers.
 */
export async function fetchRegisteredProfileSuggestions(
  limit = 100
): Promise<RegisteredSuggestionsResult> {
  const supabase = createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return {
      channels: [],
      errorMessage: authErr?.message ?? 'Sign in to see registered members.',
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .neq('id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { channels: [], errorMessage: error.message };
  }

  const rows = data ?? [];
  return {
    channels: rows.map((row) => profileRowToSuggestionChannel(row as ProfileRow)),
    errorMessage: null,
  };
}
