"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const force = params.get("force") === "1";

    // If NOT forcing login, auto-redirect logged-in users
    if (!force) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) router.replace("/my-sanctuary");
      });
    }
  }, [router, supabase]);

  const signIn = async () => {
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return setErr(error.message);
    router.replace("/my-sanctuary");
  };

  const signUp = async () => {
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/my-sanctuary`,
      },
    });

    setLoading(false);

    if (error) return setErr(error.message);
    setErr("Check your email to confirm your account, then log in.");
  };

  const switchAccount = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login?force=1";
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 rounded-2xl">
        <h1 className="text-xl font-black tracking-tight">Welcome back</h1>
        <p className="text-sm text-white/60 mt-1">
          Log in to continue.
        </p>

        <div className="mt-6 space-y-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f2ff]/40"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f2ff]/40"
          />

          {err && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              {err}
            </div>
          )}

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full bg-[#00f2ff] text-black font-black py-3 rounded-xl disabled:opacity-60"
          >
            {loading ? "Loading…" : "Log In"}
          </button>

          <button
            onClick={signUp}
            disabled={loading}
            className="w-full border border-white/15 bg-white/5 text-white font-black py-3 rounded-xl disabled:opacity-60"
          >
            Create Account
          </button>

          <button
            onClick={switchAccount}
            className="w-full text-xs text-white/50 underline underline-offset-4 mt-2"
          >
            Switch account
          </button>
        </div>
      </div>
    </div>
  );
}
