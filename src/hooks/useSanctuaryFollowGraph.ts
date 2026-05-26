'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  BASE_SANCTUARY_CHANNELS,
  RECOMMENDED_SANCTUARY_CHANNELS,
  loadCustomChannels,
  loadFollowingIds,
  saveCustomChannels,
  saveFollowingIds,
  type SanctuaryChannel,
} from '@/lib/sanctuary-following';
import { profileRowToSuggestionChannel } from '@/lib/profile-suggestions';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(id: string) {
  return UUID_RE.test(id);
}

/**
 * Merges curated + registered + custom channels and loads Supabase profiles for
 * followed UUIDs that are not yet in the merged list (so Following tab always lists real people).
 */
export function useSanctuaryFollowGraph(registeredChannels: SanctuaryChannel[]) {
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [customFollowers, setCustomFollowers] = useState<SanctuaryChannel[]>([]);
  const [orphanFollowed, setOrphanFollowed] = useState<SanctuaryChannel[]>([]);

  const recommendedAsChannels = useMemo(
    () =>
      RECOMMENDED_SANCTUARY_CHANNELS.map((r) => ({
        id: r.id,
        name: r.name,
        handle: `@${r.id.replace(/-/g, '')}`,
        avatarLabel: r.avatarLabel,
        isLive: false,
        viewers: r.viewers,
        tagline: r.tagline,
        source: 'curated' as const,
      })),
    []
  );

  const refreshLocal = useCallback(() => {
    setFollowingIds(loadFollowingIds());
    setCustomFollowers(loadCustomChannels());
  }, []);

  const updateFollowingIds = useCallback(
    (next: string[] | ((prev: string[]) => string[])) => {
      setFollowingIds((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        saveFollowingIds(resolved);
        return resolved;
      });
    },
    []
  );

  const updateCustomFollowers = useCallback(
    (next: SanctuaryChannel[] | ((prev: SanctuaryChannel[]) => SanctuaryChannel[])) => {
      setCustomFollowers((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        saveCustomChannels(resolved);
        return resolved;
      });
    },
    []
  );

  useEffect(() => {
    refreshLocal();
  }, [refreshLocal]);

  useEffect(() => {
    const onFollowing = () => refreshLocal();
    window.addEventListener('parable:following-updated', onFollowing);
    return () => window.removeEventListener('parable:following-updated', onFollowing);
  }, [refreshLocal]);

  const baseMerged = useMemo(() => {
    const merged = new Map<string, SanctuaryChannel>();
    for (const c of BASE_SANCTUARY_CHANNELS) merged.set(c.id, c);
    for (const c of recommendedAsChannels) merged.set(c.id, c);
    for (const c of registeredChannels) merged.set(c.id, c);
    for (const c of customFollowers) merged.set(c.id, c);
    return merged;
  }, [recommendedAsChannels, registeredChannels, customFollowers]);

  const knownIds = useMemo(() => new Set(baseMerged.keys()), [baseMerged]);

  useEffect(() => {
    const missing = followingIds.filter((id) => isUuid(id) && !knownIds.has(id));
    if (missing.length === 0) {
      setOrphanFollowed([]);
      return;
    }

    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', missing);

      if (cancelled || error || !data?.length) {
        if (!cancelled) setOrphanFollowed([]);
        return;
      }

      setOrphanFollowed(
        data.map((row) =>
          profileRowToSuggestionChannel(
            row as {
              id: string;
              username: string | null;
              full_name: string | null;
              avatar_url: string | null;
            }
          )
        )
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [followingIds, knownIds]);

  const allFollowers = useMemo(() => {
    const merged = new Map<string, SanctuaryChannel>(baseMerged);
    for (const c of orphanFollowed) merged.set(c.id, c);
    return Array.from(merged.values());
  }, [baseMerged, orphanFollowed]);

  return {
    followingIds,
    updateFollowingIds,
    customFollowers,
    updateCustomFollowers,
    allFollowers,
    recommendedAsChannels,
    refreshLocal,
  };
}
