'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { SanctuaryChannel } from '@/lib/sanctuary-following';
import { fetchRegisteredProfileSuggestions } from '@/lib/profile-suggestions';

export function useRegisteredProfileSuggestions() {
  const [channels, setChannels] = useState<SanctuaryChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setErrorMessage(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (!cancelled) {
          setChannels([]);
          setErrorMessage(null);
          setLoading(false);
        }
        return;
      }

      const res = await fetchRegisteredProfileSuggestions();
      if (!cancelled) {
        setChannels(res.channels);
        setErrorMessage(res.errorMessage);
        setLoading(false);
      }
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return {
    registeredChannels: channels,
    registeredLoading: loading,
    registeredError: errorMessage,
  };
}
