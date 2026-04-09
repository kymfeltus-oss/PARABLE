'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Subscribes to Supabase Realtime INSERTs on `public.posts` for Glory Spark events.
 * Falls back silently if the table or replication is unavailable.
 */
export function useGlobalPulsePosts() {
  const [sparkCount, setSparkCount] = useState(0);
  const [lastPostId, setLastPostId] = useState<string | null>(null);
  const [channelReady, setChannelReady] = useState(false);

  const resetSparks = useCallback(() => setSparkCount(0), []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('global-pulse-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const id = (payload.new as { id?: string })?.id;
          if (id) setLastPostId(id);
          setSparkCount((c) => c + 1);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setChannelReady(true);
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setChannelReady(false);
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return { sparkCount, lastPostId, channelReady, resetSparks };
}
