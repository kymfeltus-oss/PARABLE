"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  discoverStoredAvatarPublicUrl,
  uploadUserAvatarFromDataUrl,
} from "@/lib/avatar-storage";
import {
  clearPendingAvatarKeys,
  pendingAvatarOnlyStorageKey,
} from "@/lib/profile-avatar";

export type AuthContextValue = {
  userProfile: any;
  /** URL safe for <img src> — includes cache-bust for remote avatars */
  avatarUrl: string;
  loading: boolean;
  /** Call after a successful upload so headers update immediately */
  applyAvatarFromUpload: (publicUrl: string) => void;
  /** Re-fetch profile + avatar from Supabase */
  refreshProfile: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveDisplayAvatarUrl(
  supabase: SupabaseClient,
  profileAvatar: string | null | undefined,
  pendingProfileAvatar: string | null | undefined,
  pendingAvatarRaw: string | null,
  pendingAvatarOnly: string | null,
  metadataAvatar: string | null | undefined,
): string {
  const tryStoragePath = (path: string) => {
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl || "/logo.svg";
  };

  const normalize = (v: string | null | undefined) => {
    if (v == null || v === "") return null;
    const s = String(v).trim();
    if (!s) return null;
    if (s.startsWith("data:")) return s;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (!s.includes("://") && s.length < 2048) return tryStoragePath(s);
    return null;
  };

  const profileNorm = normalize(profileAvatar);
  if (
    profileNorm &&
    (profileNorm.startsWith("http://") || profileNorm.startsWith("https://"))
  ) {
    return profileNorm;
  }

  const only = pendingAvatarOnly?.trim();
  if (only?.startsWith("data:")) return only;
  if (pendingProfileAvatar && String(pendingProfileAvatar).startsWith("data:")) {
    return String(pendingProfileAvatar);
  }
  if (pendingAvatarRaw?.startsWith("data:")) return pendingAvatarRaw;

  if (profileNorm) return profileNorm;

  const fromMeta = normalize(metadataAvatar);
  if (fromMeta) return fromMeta;

  return "/logo.svg";
}

function withImgCacheBust(url: string, rev: number): string {
  if (!url || url === "/logo.svg") return "/logo.svg";
  if (url.startsWith("data:")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_av=${rev}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [canonicalAvatarUrl, setCanonicalAvatarUrl] =
    useState<string>("/logo.svg");
  const [avatarRev, setAvatarRev] = useState(0);
  const [loading, setLoading] = useState(true);
  const loadGenRef = useRef(0);

  const avatarUrl = useMemo(
    () => withImgCacheBust(canonicalAvatarUrl, avatarRev),
    [canonicalAvatarUrl, avatarRev],
  );

  const bumpAvatar = useCallback(() => {
    setAvatarRev((r) => r + 1);
  }, []);

  const applyAvatarFromUpload = useCallback((publicUrl: string) => {
    setCanonicalAvatarUrl(publicUrl);
    setUserProfile((prev: any) =>
      prev ? { ...prev, avatar_url: publicUrl } : prev,
    );
    bumpAvatar();
  }, [bumpAvatar]);

  const loadUser = useCallback(async () => {
    const gen = ++loadGenRef.current;
    setLoading(true);

    const supabase = createClient();

    try {
      try {
        const guestRes = await fetch("/api/auth/guest-preview", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (guestRes.ok) {
          const guestJson = (await guestRes.json()) as {
            guest?: boolean;
            profile?: Record<string, unknown>;
          };
          if (
            guestJson?.guest &&
            guestJson.profile &&
            typeof guestJson.profile === "object"
          ) {
            setUserProfile(guestJson.profile);
            setCanonicalAvatarUrl("/logo.svg");
            if (gen === loadGenRef.current) setLoading(false);
            return;
          }
        }
      } catch {
        /* continue to Supabase session */
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user ?? null;

      if (!user) {
        setUserProfile(null);
        setCanonicalAvatarUrl("/logo.svg");
        if (gen === loadGenRef.current) setLoading(false);
        return;
      }

      const pendingAvatarKey = user.email
        ? `parable:pending-avatar:${String(user.email).trim().toLowerCase()}`
        : null;
      const pendingAvatar = pendingAvatarKey
        ? window.localStorage.getItem(pendingAvatarKey)
        : null;
      const pendingProfileByIdKey = `parable:pending-profile-id:${user.id}`;
      const pendingProfileKey = user.email
        ? `parable:pending-profile:${String(user.email).trim().toLowerCase()}`
        : null;
      const pendingProfile = (() => {
        const candidates = [pendingProfileByIdKey, pendingProfileKey].filter(
          Boolean,
        ) as string[];
        try {
          for (const key of candidates) {
            const raw = window.localStorage.getItem(key);
            if (!raw) continue;
            return JSON.parse(raw) as {
              username?: string;
              full_name?: string;
              role?: string;
              avatar_url?: string | null;
            };
          }
          return null;
        } catch {
          return null;
        }
      })();

      let pendingAvatarOnlyRaw: string | null = null;
      try {
        pendingAvatarOnlyRaw = window.localStorage.getItem(
          pendingAvatarOnlyStorageKey(user.id),
        );
      } catch {
        pendingAvatarOnlyRaw = null;
      }

      let { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!data) {
        const metadata = (user.user_metadata || {}) as Record<
          string,
          string | undefined
        >;
        const usernameFromMeta =
          pendingProfile?.username?.trim().toLowerCase() ||
          metadata.username?.trim().toLowerCase();
        const fullNameFromMeta =
          pendingProfile?.full_name?.trim() || metadata.full_name?.trim();
        const avatarFromMeta =
          pendingProfile?.avatar_url?.trim() || metadata.avatar_url?.trim();
        const roleFromPending = pendingProfile?.role?.trim() || null;

        if (
          usernameFromMeta ||
          fullNameFromMeta ||
          avatarFromMeta ||
          roleFromPending
        ) {
          let avatarForDb: string | null = null;
          const signupPhoto =
            (avatarFromMeta?.startsWith("data:") ? avatarFromMeta : null) ||
            (pendingAvatarOnlyRaw?.startsWith("data:")
              ? pendingAvatarOnlyRaw
              : null);
          if (signupPhoto) {
            const uploaded = await uploadUserAvatarFromDataUrl(
              supabase,
              user.id,
              signupPhoto,
            );
            avatarForDb = "error" in uploaded ? null : uploaded.publicUrl;
          } else if (avatarFromMeta && !avatarFromMeta.startsWith("data:")) {
            avatarForDb = avatarFromMeta;
          }

          const { error: upsertError } = await supabase.from("profiles").upsert({
            id: user.id,
            username: usernameFromMeta || `user-${user.id.slice(0, 8)}`,
            full_name: fullNameFromMeta || "",
            avatar_url: avatarForDb,
            onboarding_complete: true,
          });

          if (!upsertError) {
            const { data: refreshed } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .maybeSingle();
            data = refreshed || data;
          }
        }
      }

      // Discover / following read `public.profiles`. Without a row, the user exists in Auth only.
      // Sign-up with email confirmation often has no session yet, so create-account upsert can skip;
      // this ensures a row exists on first successful login even with empty metadata / no localStorage.
      if (!data) {
        const metadata = (user.user_metadata || {}) as Record<
          string,
          string | undefined
        >;
        const emailLocal =
          user.email
            ?.split("@")[0]
            ?.toLowerCase()
            .replace(/[^a-z0-9_-]/g, "") ?? "";
        const fallbackUsername =
          emailLocal.length >= 2 ? emailLocal : `user-${user.id.slice(0, 8)}`;
        const { error: ensureErr } = await supabase.from("profiles").upsert({
          id: user.id,
          username:
            pendingProfile?.username?.trim().toLowerCase() ||
            metadata.username?.trim().toLowerCase() ||
            fallbackUsername,
          full_name:
            pendingProfile?.full_name?.trim() ||
            metadata.full_name?.trim() ||
            "",
          avatar_url: null,
          onboarding_complete: false,
        });
        if (!ensureErr) {
          const { data: refreshed } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          data = refreshed || data;
        }
      }

      let displayUrl = resolveDisplayAvatarUrl(
        supabase,
        data?.avatar_url as string | undefined,
        pendingProfile?.avatar_url,
        pendingAvatar,
        pendingAvatarOnlyRaw,
        user.user_metadata?.avatar_url as string | undefined,
      );

      if (displayUrl === "/logo.svg") {
        const discovered = await discoverStoredAvatarPublicUrl(supabase, user.id);
        if (discovered) {
          displayUrl = discovered;
          await supabase
            .from("profiles")
            .update({
              avatar_url: discovered,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
          if (data) data = { ...data, avatar_url: discovered };
        }
      }

      if (data) {
        const resolvedUsername =
          data.username ||
          pendingProfile?.username ||
          (user.user_metadata?.username as string | undefined) ||
          user.email?.split("@")[0] ||
          "user";
        setUserProfile({ ...data, username: resolvedUsername });
        setCanonicalAvatarUrl(displayUrl);
      } else {
        const metadata = (user.user_metadata || {}) as Record<
          string,
          string | undefined
        >;
        const syntheticAvatarUrl =
          displayUrl !== "/logo.svg"
            ? displayUrl
            : pendingProfile?.avatar_url || metadata.avatar_url || null;
        setUserProfile({
          id: user.id,
          username:
            pendingProfile?.username ||
            metadata.username ||
            user.email?.split("@")[0] ||
            "User",
          full_name: pendingProfile?.full_name || metadata.full_name || "",
          role: pendingProfile?.role || null,
          avatar_url: syntheticAvatarUrl,
        });
        setCanonicalAvatarUrl(displayUrl);
      }

      if (
        pendingProfile ||
        pendingAvatar?.startsWith("data:") ||
        pendingAvatarOnlyRaw?.startsWith("data:")
      ) {
        try {
          const hadPendingDataAvatar = !!(
            pendingProfile?.avatar_url?.startsWith("data:") ||
            pendingAvatar?.startsWith("data:") ||
            pendingAvatarOnlyRaw?.startsWith("data:")
          );

          let persistedAvatar: string | null = null;
          const rawPendingAvatar =
            (pendingProfile?.avatar_url?.startsWith("data:")
              ? pendingProfile.avatar_url
              : null) ||
            (pendingAvatar?.startsWith("data:") ? pendingAvatar : null) ||
            (pendingAvatarOnlyRaw?.startsWith("data:")
              ? pendingAvatarOnlyRaw
              : null);
          if (rawPendingAvatar) {
            const up = await uploadUserAvatarFromDataUrl(
              supabase,
              user.id,
              rawPendingAvatar,
            );
            if (!("error" in up)) persistedAvatar = up.publicUrl;
          }

          const httpAlready =
            typeof data?.avatar_url === "string" &&
            (data.avatar_url.startsWith("https://") ||
              data.avatar_url.startsWith("http://"));

          const nextAvatar =
            persistedAvatar ||
            (httpAlready ? data!.avatar_url! : null) ||
            data?.avatar_url ||
            null;

          const usernameRow =
            pendingProfile?.username ||
            data?.username ||
            (user.user_metadata?.username as string | undefined) ||
            user.email?.split("@")[0] ||
            `user-${user.id.slice(0, 8)}`;
          const fullNameRow =
            pendingProfile?.full_name ||
            data?.full_name ||
            (user.user_metadata?.full_name as string | undefined) ||
            "";

          const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            username: usernameRow,
            full_name: fullNameRow,
            avatar_url: nextAvatar,
            onboarding_complete: true,
          });

          const avatarOk =
            !hadPendingDataAvatar ||
            !!persistedAvatar ||
            httpAlready ||
            !!data?.avatar_url;
          if (!error && avatarOk) {
            clearPendingAvatarKeys(
              user.id,
              user.email ? String(user.email).trim().toLowerCase() : null,
              pendingAvatarKey,
            );
          }
          if (!error && persistedAvatar) {
            setCanonicalAvatarUrl(persistedAvatar);
            bumpAvatar();
            if (data) data = { ...data, avatar_url: persistedAvatar };
          }
        } catch {
          /* keep pending keys */
        }
      }
    } finally {
      if (gen === loadGenRef.current) setLoading(false);
    }
  }, [bumpAvatar]);

  const refreshProfile = useCallback(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    void loadUser();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    const onFocus = () => {
      void loadUser();
    };

    const onProfileUpdated = (e: Event) => {
      const d = (e as CustomEvent<{ bumpAvatar?: boolean }>).detail;
      if (d?.bumpAvatar) bumpAvatar();
      void loadUser();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener(
      "parable:profile-updated",
      onProfileUpdated as EventListener,
    );

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(
        "parable:profile-updated",
        onProfileUpdated as EventListener,
      );
    };
  }, [loadUser, bumpAvatar]);

  const value = useMemo(
    () => ({
      userProfile,
      avatarUrl,
      loading,
      applyAvatarFromUpload,
      refreshProfile,
    }),
    [
      userProfile,
      avatarUrl,
      loading,
      applyAvatarFromUpload,
      refreshProfile,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
