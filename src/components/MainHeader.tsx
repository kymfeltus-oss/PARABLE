"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationToast from "@/components/NotificationToast";

type ProfileSnippet = {
  username: string | null;
  avatar_url: string | null;
  full_name: string | null;
};

/**
 * Top bar with PARABLE branding and the signed-in user’s profile (top-right).
 * Profile text/avatar refresh on auth changes and on `profiles` updates (e.g. Settings).
 */
export default function MainHeader() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<ProfileSnippet | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const loadProfile = async (uid: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url, full_name")
        .eq("id", uid)
        .maybeSingle();
      setUserProfile(data ?? null);
    };

    const syncFromAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUserId(null);
        setUserProfile(null);
        return;
      }
      setUserId(user.id);
      await loadProfile(user.id);
    };

    void syncFromAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUserId(null);
        setUserProfile(null);
        return;
      }
      setUserId(session.user.id);
      void loadProfile(session.user.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const reload = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url, full_name")
        .eq("id", userId)
        .maybeSingle();
      setUserProfile(data ?? null);
    };

    const channel = supabase
      .channel(`main-header-profile-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        () => {
          void reload();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  const dropdownProfile = useMemo(
    () =>
      userId
        ? {
            id: userId,
            username: userProfile?.username ?? null,
            full_name: userProfile?.full_name ?? null,
            avatar_url: userProfile?.avatar_url ?? null,
          }
        : null,
    [userId, userProfile?.username, userProfile?.full_name, userProfile?.avatar_url],
  );

  return (
    <>
    <header className="z-50 flex w-full shrink-0 items-center justify-between overflow-visible border-b border-neutral-800 bg-[#0f1011] p-4">
      <div className="flex items-center gap-2">
        <Link href="/" className="font-black tracking-tighter text-xl text-cyan-400">
          PARABLE
        </Link>
      </div>

      <div className="relative flex items-center gap-4">
        {userId && dropdownProfile ? (
          <ProfileDropdown profile={dropdownProfile} />
        ) : (
          <Link
            href="/login"
            className="text-sm font-bold text-gray-300 transition-opacity hover:text-white hover:opacity-90"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
    <NotificationToast currentUserId={userId} />
    </>
  );
}
