"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Refetches profile layout when this user's posts change (insert/update/delete).
 * Isolated subscription — does not alter existing useFeed or useAuth hooks.
 */
export function useProfilePostsLive(profileUserId: string | undefined, onPostsChanged: () => void) {
  useEffect(() => {
    if (!profileUserId) return;

    const supabase = createClient();
    let cancelled = false;

    const channel = supabase
      .channel(`my-sanctuary-posts-${profileUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `profile_id=eq.${profileUserId}`,
        },
        () => {
          if (!cancelled) onPostsChanged();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [profileUserId, onPostsChanged]);
}
