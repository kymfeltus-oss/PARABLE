"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Wallet,
  X,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { emailConfirmRedirectUrl } from "@/lib/auth-email-redirect";
import { isParableDevGuestClientEnabled } from "@/lib/parable-dev-guest";
import ProfileDropdown from "@/components/ProfileDropdown";
import { shellHeaderInnerClass, shellKindFromPathname } from "@/lib/app-shell-widths";
import type { Session } from "@supabase/supabase-js";

type ModalKind = "login" | "signup";

type ProfileSnippet = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

function ParableGlobalHeaderInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const activeModal = searchParams.get("modal") as ModalKind | null;
  const modalOpen = activeModal === "login" || activeModal === "signup";

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileSnippet | null>(null);
  const [walletUsd, setWalletUsd] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const headerInner = shellHeaderInnerClass(shellKindFromPathname(pathname));

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      setProfile(
        data
          ? {
              id: data.id,
              username: data.username,
              full_name: data.full_name,
              avatar_url: data.avatar_url,
            }
          : { id: userId, username: null, full_name: null, avatar_url: null },
      );
    },
    [supabase],
  );

  const loadWallet = useCallback(
    async (userId: string, accessToken?: string) => {
      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/wallet/ledger", {
        credentials: "same-origin",
        headers,
      });
      const payload = (await res.json().catch(() => ({}))) as {
        entries?: { amount_cents?: number }[];
      };
      if (!res.ok) {
        setWalletUsd(0);
        return;
      }
      const cents = (payload.entries ?? []).reduce(
        (acc, row) => acc + Number(row.amount_cents ?? 0),
        0,
      );
      setWalletUsd(cents / 100);
    },
    [],
  );

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) {
        void loadProfile(s.user.id);
        void loadWallet(s.user.id, s.access_token);
      } else {
        setProfile(null);
        setWalletUsd(0);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user?.id) {
        void loadProfile(s.user.id);
        void loadWallet(s.user.id, s.access_token);
      } else {
        setProfile(null);
        setWalletUsd(0);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile, loadWallet]);

  const pushQuery = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const openModal = (kind: ModalKind) => {
    setAuthError(null);
    setAuthInfo(null);
    pushQuery((params) => {
      params.set("modal", kind);
    });
  };

  const closeModal = () => {
    pushQuery((params) => {
      params.delete("modal");
      params.delete("error");
    });
    setEmail("");
    setPassword("");
    setUsername("");
    setDob("");
    setShowPassword(false);
    setAuthError(null);
    setAuthInfo(null);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isParableDevGuestClientEnabled()) {
      router.push("/my-sanctuary");
      return;
    }
    setAuthBusy(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthBusy(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    closeModal();
    router.refresh();
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (isParableDevGuestClientEnabled()) {
      router.push("/my-sanctuary");
      return;
    }
    setAuthBusy(true);
    setAuthError(null);
    setAuthInfo(null);

    const usernameNorm = username.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: usernameNorm,
          full_name: username.trim(),
        },
        emailRedirectTo: emailConfirmRedirectUrl("/my-sanctuary"),
      },
    });

    setAuthBusy(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (data.user && data.session) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        username: usernameNorm || `user-${data.user.id.slice(0, 8)}`,
        full_name: username.trim(),
        onboarding_complete: false,
      });
      closeModal();
      router.refresh();
      return;
    }

    setAuthInfo("Check your email to confirm your account, then sign in.");
  };

  const dropdownProfile = profile
    ? {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      }
    : null;

  return (
    <div className="relative z-50 w-full select-none">
      <nav className="flex h-16 w-full shrink-0 justify-center border-b border-[#191f24] bg-[#191b1f] px-4 lg:px-6">
        <div className={`flex w-full items-center justify-between gap-4 ${headerInner}`}>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#00f2fe] to-blue-600 text-xs font-black text-black shadow-lg shadow-[#00f2fe]/10">
            P
          </div>
          <span className="hidden text-sm font-black tracking-tight text-white uppercase sm:block">
            Parable
          </span>
        </Link>

        <div className="relative hidden max-w-md flex-1 md:block">
          <div className="flex w-full items-center gap-2 rounded-lg border border-[#191f24] bg-[#0b0e11] px-3 py-2 transition-colors focus-within:border-[#00f2fe]/40">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live streams, shorts, or categories…"
              className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/wallet"
                className="flex items-center gap-2 rounded-xl border border-[#191f24] bg-[#0b0e11] px-3 py-2 font-mono text-xs font-bold"
              >
                <Wallet className="h-3.5 w-3.5 text-[#00f2fe]" />
                <span className="text-white">
                  ${walletUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </Link>
              {dropdownProfile ? <ProfileDropdown profile={dropdownProfile} /> : null}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-xs font-black tracking-wider uppercase">
              <button
                type="button"
                onClick={() => openModal("login")}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-white transition-colors hover:bg-[#242c33]"
              >
                <LogIn className="h-3.5 w-3.5" /> Log In
              </button>
              <button
                type="button"
                onClick={() => openModal("signup")}
                className="flex items-center gap-1.5 rounded-lg bg-[#00f2fe] px-4 py-2.5 text-black shadow-lg shadow-[#00f2fe]/5 transition-all hover:bg-[#00d2dd] active:scale-95"
              >
                <UserPlus className="h-3.5 w-3.5" /> Sign Up
              </button>
            </div>
          )}
        </div>
        </div>
      </nav>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div className="relative w-full max-w-sm space-y-4 rounded-2xl border border-[#191f24] bg-[#191b1f] p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 transition-colors hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex border-b border-[#191f24] text-center text-xs font-black tracking-wider uppercase">
              <button
                type="button"
                onClick={() => openModal("login")}
                className={`flex-1 pb-3 ${
                  activeModal === "login"
                    ? "border-b-2 border-[#00f2fe] text-[#00f2fe]"
                    : "text-gray-400"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => openModal("signup")}
                className={`flex-1 pb-3 ${
                  activeModal === "signup"
                    ? "border-b-2 border-[#00f2fe] text-[#00f2fe]"
                    : "text-gray-400"
                }`}
              >
                Create Account
              </button>
            </div>

            {authError ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 font-mono text-[11px] leading-relaxed font-semibold tracking-tight text-red-400">
                {authError}
              </div>
            ) : null}
            {authInfo ? (
              <div className="rounded-lg border border-[#00f2fe]/20 bg-[#00f2fe]/10 p-2.5 text-[11px] font-semibold text-[#00f2fe]">
                {authInfo}
              </div>
            ) : null}

            {activeModal === "login" ? (
              <form onSubmit={(e) => void handleLogin(e)} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full rounded-lg border border-[#191f24] bg-[#0b0e11] p-2.5 text-xs font-semibold text-white outline-none focus:border-[#00f2fe]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                    Password
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-[#191f24] bg-[#0b0e11] p-2 focus-within:border-[#00f2fe]/40">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="min-w-0 flex-1 border-none bg-transparent font-mono text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="p-0.5 text-gray-500 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full rounded-lg bg-[#00f2fe] py-3 text-xs font-black tracking-wider text-black uppercase transition-colors hover:bg-[#00d2dd] disabled:opacity-50"
                >
                  {authBusy ? "Verifying…" : "Verify Credentials"}
                </button>
                <p className="text-center text-[10px] text-gray-500">
                  Full onboarding?{" "}
                  <Link href="/create-account" className="text-[#00f2fe] hover:underline">
                    Create account page
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={(e) => void handleSignUp(e)} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="channel_handle"
                    className="w-full rounded-lg border border-[#191f24] bg-[#0b0e11] p-2.5 text-xs font-semibold text-white outline-none focus:border-[#00f2fe]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#191f24] bg-[#0b0e11] p-2.5 text-xs font-semibold text-white outline-none focus:border-[#00f2fe]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#191f24] bg-[#0b0e11] p-2.5 font-mono text-xs text-white outline-none focus:border-[#00f2fe]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full cursor-pointer rounded-lg border border-[#191f24] bg-[#0b0e11] p-2.5 font-mono text-xs text-gray-400 outline-none focus:border-[#00f2fe]/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full rounded-lg bg-[#00f2fe] py-3 text-xs font-black tracking-wider text-black uppercase transition-colors hover:bg-[#00d2dd] disabled:opacity-50"
                >
                  {authBusy ? "Registering…" : "Complete Registration"}
                </button>
              </form>
            )}

            <p className="text-center text-[9px] tracking-wide text-gray-600">
              End-to-end verification via Supabase Auth
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ParableGlobalHeader() {
  return (
    <Suspense fallback={<div className="h-16 w-full shrink-0 border-b border-[#191f24] bg-[#191b1f]" />}>
      <ParableGlobalHeaderInner />
    </Suspense>
  );
}
