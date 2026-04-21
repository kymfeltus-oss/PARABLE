"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { useAuth } from "@/hooks/useAuth";
import { SIMULATION_PROFILE_USERNAMES, orderSimulationProfiles } from "@/lib/simulation-profiles";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type Props = {
  /** @deprecated Not used for writes — follower id always comes from {@link SupabaseClient} auth so RLS (`auth.uid()`) matches. */
  currentUserId?: string;
  onFollowed?: () => void;
  compact?: boolean;
};

const MAX_SUGGESTIONS = 5;

/**
 * Sidebar: Sarah, James, and Michael — only those you do not follow yet (up to {@link MAX_SUGGESTIONS}).
 * Follow → `public.follows` insert; home feed is follow-only via {@link useFeed} + {@link onFollowed} refresh.
 */
export default function SuggestedFollowers({ onFollowed, compact = false }: Props) {
  const { loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const sync = (uid: string | null) => {
      setSessionUserId(uid);
      setSessionReady(true);
    };

    void supabase.auth.getUser().then(({ data: { user } }) => {
      sync(user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      sync(session?.user?.id ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchSuggestions = useCallback(
    async (followerId: string) => {
      const { data: following, error: fe } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", followerId);

      if (fe) {
        console.error("SuggestedFollowers follows:", fe.message);
      }

      const followingSet = new Set((following ?? []).map((f: { following_id: string }) => f.following_id));

      const { data: trio, error: trioErr } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("username", [...SIMULATION_PROFILE_USERNAMES]);

      if (trioErr) {
        console.error("SuggestedFollowers trio:", trioErr.message);
        setSuggestions([]);
        return;
      }

      const ordered = orderSimulationProfiles((trio ?? []) as Profile[]);
      const out = ordered.filter((p) => p.id !== followerId && !followingSet.has(p.id));

      setSuggestions(out.slice(0, MAX_SUGGESTIONS));
    },
    [supabase],
  );

  useEffect(() => {
    if (authLoading || !sessionReady) return;
    if (!sessionUserId) {
      setSuggestions([]);
      return;
    }
    void fetchSuggestions(sessionUserId);
  }, [authLoading, sessionReady, sessionUserId, fetchSuggestions]);

  const handleFollow = async (targetId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setBusyId(targetId);
    const { error } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: targetId,
    });
    setBusyId(null);

    if (!error) {
      await fetchSuggestions(user.id);
      onFollowed?.();
    } else {
      console.error("follow insert:", error.message);
    }
  };

  const list = (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {suggestions.map((profile) => {
        const label =
          profile.full_name?.trim() ||
          profile.username?.replace(/_/g, " ").trim() ||
          "Member";
        return (
          <div key={profile.id} className="flex items-center justify-between gap-2">
            <Link
              href={`/profile/${profile.id}`}
              className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-90"
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                  onError={fallbackAvatarOnError}
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/80">
                  {label.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold text-white">{label}</span>
                <span className="text-[10px] text-gray-500">Fellowship · follow to see their posts</span>
              </div>
            </Link>
            <button
              type="button"
              disabled={busyId === profile.id}
              onClick={(e) => {
                e.preventDefault();
                void handleFollow(profile.id);
              }}
              className="shrink-0 text-xs font-bold text-cyan-400 transition hover:text-white disabled:opacity-50"
            >
              {busyId === profile.id ? "…" : "Follow"}
            </button>
          </div>
        );
      })}
    </div>
  );

  if (authLoading || !sessionReady) {
    if (compact) return null;
    return (
      <div className="rounded-xl border border-gray-800 bg-[#18191c] p-4 text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!sessionUserId) {
    if (compact) return null;
    return (
      <div className="rounded-xl border border-gray-800 bg-[#18191c] p-4 text-sm text-gray-500">
        Sign in to see suggestions and follow creators.
      </div>
    );
  }

  if (compact) {
    return list;
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-[#18191c] p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-400">Suggested for you</span>
        <button
          type="button"
          className="text-xs font-bold text-white transition hover:text-gray-400"
          aria-label="See all suggestions"
        >
          See All
        </button>
      </div>
      {list}
    </div>
  );
}
