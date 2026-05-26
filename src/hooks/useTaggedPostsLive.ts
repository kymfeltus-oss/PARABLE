"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Refetches tagged posts when a new post @mentions this profile (Tagged tab live feed).
 * Isolated from useFeed — only active while the Tagged tab is open.
 */
export function useTaggedPostsLive(
  profileUserId: string,
  username: string | null,
  active: boolean,
  onTaggedChanged: () => void,
) {
  useEffect(() => {
    const handle = username?.trim();
    if (!active || !handle) return;

    const mention = `@${handle}`.toLowerCase();
    const supabase = createClient();
    let cancelled = false;

    const channel = supabase
      .channel(`my-sanctuary-tagged-${profileUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          if (cancelled) return;
          const row = payload.new as { profile_id?: string; content?: string | null };
          if (row.profile_id === profileUserId) return;
          const content = (row.content ?? "").toLowerCase();
          if (content.includes(mention)) onTaggedChanged();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [profileUserId, username, active, onTaggedChanged]);
}
