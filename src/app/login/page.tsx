"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Sparkles from "@/components/login/Sparkles";

function frac(n: number) {
  return n - Math.floor(n);
}
function prand(seed: number) {
  // deterministic pseudo-random (SSR-safe)
  return frac(Math.sin(seed * 9999.123) * 10000);
}

function MatrixRain() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // deterministic (index-based), so no hydration weirdness
  const columns = useMemo(() => {
    const count = 28; // visual density
    return Array.from({ length: count }).map((_, i) => {
      const left = (i / count) * 100;
      const delay = (i % 7) * 0.55;
      const duration = 6.5 + (i % 9) * 0.6;
      const fontSize = 10 + (i % 6) * 2;
      const opacity = 0.10 + (i % 6) * 0.02;
      const blur = (i % 5) * 0.25;

      return { i, left, delay, duration, fontSize, opacity, blur };
    });
  }, []);

  const glyphs = useMemo(
    () => "アカサタナハマヤラワ0123456789PARABLE✦✧◇◆•",
    []
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {/* subtle tint wash */}
      <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_40%_30%,rgba(0,242,254,0.18),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(0,242,254,0.10),transparent_60%)]" />

      {columns.map((c) => (
        <div
          key={c.i}
          className="absolute top-[-30%] h-[160%] select-none"
          style={{
            left: `${c.left}%`,
            width: "3.6%",
            filter: `blur(${c.blur}px)`,
            opacity: c.opacity,
          }}
        >
          <div
            className="matrix-fall"
            style={{
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              fontSize: `${c.fontSize}px`,
            }}
          >
            {/* repeat a deterministic pattern (no randomness) */}
            <div className="leading-[1.15]">
              {Array.from({ length: 60 }).map((_, r) => {
                const ch = glyphs[(c.i * 7 + r * 3) % glyphs.length];
                const isHot = r % 11 === 0;
                return (
                  <div
                    key={r}
                    className={
                      isHot
                        ? "text-[#00f2fe] drop-shadow-[0_0_10px_rgba(0,242,254,0.65)]"
                        : "text-white/70"
                    }
                    style={{
                      opacity: isHot ? 0.95 : 0.42,
                    }}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* vignette so it stays premium, not noisy */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.45)_58%,rgba(0,0,0,0.78)_100%)]" />
    </div>
  );
}

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const nextPath = searchParams.get("next") || "/my-sanctuary";

  const signIn = async () => {
    setErr(null);
    setInfo(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.replace(nextPath);
  };

  const signUp = async () => {
    setErr(null);
    setInfo(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${nextPath}`,
      },
    });
    setLoading(false);
    if (error) return setErr(error.message);
    setInfo("Check your email to confirm your account.");
  };

  const resetPassword = async () => {
    if (!email) {
      setErr("Enter your email address first.");
      return;
    }

    setErr(null);
    setInfo(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${nextPath}`,
    });

    setLoading(false);
    if (error) return setErr(error.message);
    setInfo("Password reset email sent.");
  };

  // ✅ FIX: deterministic shards (no Math.random = no delay + no hydration mismatch)
  const shards = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const r1 = prand(i + 1);
        const r2 = prand(i + 101);
        const r3 = prand(i + 1001);
        const r4 = prand(i + 10001);
        const r5 = prand(i + 50001);
        const r6 = prand(i + 90001);
        const r7 = prand(i + 130001);
        const r8 = prand(i + 170001);

        return {
          id: i,
          left: `${r1 * 100}%`,
          top: `${r2 * 100}%`,
          delay: r3 * 1.8,
          dur: 8 + r4 * 8,
          rot: -20 + r5 * 40,
          scale: 0.7 + r6 * 0.8,
          opacity: 0.10 + r7 * 0.18,
        };
      }),
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* BACKDROP */}
      <div className="absolute inset-0">
        {/* neon ocean */}
        <div className="absolute inset-[-30%] opacity-[0.20] blur-[90px] animate-[ocean_16s_ease-in-out_infinite] bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,254,0.35),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.12),transparent_60%),radial-gradient(circle_at_40%_80%,rgba(0,242,254,0.18),transparent_55%)]" />

        {/* grid */}
        <div className="absolute inset-0 opacity-[0.12] [background:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:84px_84px]" />

        {/* moving scanline */}
        <div
          className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_bottom,transparent,rgba(0,242,254,0.25),transparent)] animate-[scan_5.5s_linear_infinite]"
          style={{ backgroundSize: "100% 220px" }}
        />

        {/* crystal shards */}
        {shards.map((s) => (
          <div
            key={s.id}
            className="absolute pointer-events-none rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_0_60px_rgba(0,242,254,0.12)]"
            style={
              {
                left: s.left,
                top: s.top,
                width: "210px",
                height: "120px",
                transform: `rotate(${s.rot}deg) scale(${s.scale})`,
                opacity: s.opacity,
                animation: `shard ${s.dur}s ease-in-out ${s.delay}s infinite`,
              } as any
            }
          />
        ))}

        {/* vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.72)_58%,rgba(0,0,0,0.96)_100%)]" />
      </div>

      {/* NEW: Matrix Rain layer */}
      <MatrixRain />

      {/* Sparkles */}
      <div className="relative z-[3]">
        <Sparkles />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT HERO */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.2, 0.9, 0.2, 1] }}
              className="relative"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-[#00f2fe] shadow-[0_0_18px_rgba(0,242,254,0.9)]" />
                <span className="text-[11px] font-black uppercase tracking-[4px] text-white/70">
                  Parable Protocol Access
                </span>
              </div>

              <div className="mt-6">
                <h1 className="text-[40px] sm:text-[54px] font-black leading-[1.02] tracking-tight">
                  Enter the{" "}
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 blur-2xl opacity-60 bg-[radial-gradient(circle_at_30%_40%,rgba(0,242,254,0.40),transparent_60%)]" />
                    <span className="relative text-[#00f2fe] drop-shadow-[0_0_20px_rgba(0,242,254,0.55)]">
                      Sanctuary
                    </span>
                  </span>
                </h1>
                <p className="mt-4 text-white/65 max-w-[520px] text-[15px] leading-relaxed">
                  Log in to unlock your feed, creators, and live sessions. Same rules — new energy.
                </p>
              </div>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-5 shadow-[0_0_120px_rgba(0,242,254,0.10)]">
                <div className="flex items-center gap-4">
                  <div className="rounded-[22px] border border-white/10 bg-black/50 px-6 py-4">
                    <Image src="/logo.svg" alt="Parable" width={170} height={44} priority />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-black uppercase tracking-[5px] text-white/50">
                      STREAMING • CREATING • BELIEVING
                    </div>
                    <div className="mt-2 h-[2px] w-full bg-gradient-to-r from-[#00f2fe]/0 via-[#00f2fe]/35 to-[#00f2fe]/0" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT AUTH CARD */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, ease: [0.2, 0.9, 0.2, 1] }}
              className="relative w-full max-w-[560px]"
            >
              {/* neon frame */}
              <div className="pointer-events-none absolute -inset-[2px] rounded-[44px] opacity-[0.65] blur-[14px] bg-[conic-gradient(from_160deg,rgba(0,242,254,0),rgba(0,242,254,0.35),rgba(255,255,255,0.12),rgba(0,242,254,0))]" />
              <div className="relative overflow-hidden rounded-[42px] border border-white/10 bg-white/[0.045] backdrop-blur-2xl shadow-[0_0_170px_rgba(0,242,254,0.16)]">
                {/* inner glow */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-screen bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,254,0.22),transparent_42%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.10),transparent_55%)]" />
                {/* sheen */}
                <div className="pointer-events-none absolute -left-56 top-0 h-full w-80 rotate-12 bg-gradient-to-r from-transparent via-white/14 to-transparent animate-[sheen_6.5s_ease-in-out_infinite]" />

                <div className="relative p-8 sm:p-10">
                  <div className="flex items-center justify-between">
                    <div className="rounded-[26px] border border-white/10 bg-black/55 px-6 py-4">
                      <Image src="/logo.svg" alt="Parable" width={150} height={40} priority />
                    </div>
                    <div className="h-10 w-10 rounded-[18px] border border-white/10 bg-black/40 relative overflow-hidden">
                      <div className="absolute -inset-8 rounded-full bg-[#00f2fe]/22 blur-2xl" />
                    </div>
                  </div>

                  <div className="mt-10 space-y-6">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-[4px] text-white/60">
                        Email
                      </label>
                      <div className="mt-2 rounded-[26px] border border-white/10 bg-black/70 px-5 py-4 transition focus-within:border-[#00f2fe]/60 focus-within:ring-1 focus-within:ring-[#00f2fe]/25">
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          suppressHydrationWarning
                          className="w-full bg-transparent text-[15px] outline-none placeholder:text-white/30"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-[4px] text-white/60">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={resetPassword}
                          disabled={loading}
                          suppressHydrationWarning
                          className="text-[11px] font-black uppercase tracking-[3px] text-[#00f2fe]/80 hover:text-[#00f2fe] transition disabled:opacity-60"
                        >
                          Reset
                        </button>
                      </div>

                      <div className="mt-2 rounded-[26px] border border-white/10 bg-black/70 px-5 py-4 transition focus-within:border-[#00f2fe]/60 focus-within:ring-1 focus-within:ring-[#00f2fe]/25 flex items-center gap-3">
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          type={showPw ? "text" : "password"}
                          suppressHydrationWarning
                          className="w-full bg-transparent text-[15px] outline-none placeholder:text-white/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          suppressHydrationWarning
                          className="text-[11px] font-black uppercase tracking-[3px] text-white/55 hover:text-white/90 transition"
                        >
                          {showPw ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {err && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[20px] border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
                      >
                        {err}
                      </motion.div>
                    )}

                    {info && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300"
                      >
                        {info}
                      </motion.div>
                    )}

                    <motion.button
                      onClick={signIn}
                      disabled={loading}
                      suppressHydrationWarning
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      className="group relative w-full overflow-hidden rounded-[28px] bg-[#00f2fe] py-4 font-black text-black transition disabled:opacity-60"
                    >
                      <span className="relative z-10">{loading ? "Loading…" : "Log In"}</span>
                      <span className="pointer-events-none absolute inset-0 opacity-[0.14] bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.9),transparent_55%)]" />
                      <span className="pointer-events-none absolute -left-48 top-0 h-full w-80 rotate-12 bg-gradient-to-r from-transparent via-white/65 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </motion.button>

                    <motion.button
                      onClick={signUp}
                      disabled={loading}
                      suppressHydrationWarning
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      className="relative w-full overflow-hidden rounded-[28px] border border-white/15 bg-white/5 py-4 font-black text-white transition hover:bg-white/10 disabled:opacity-60"
                    >
                      <span className="relative z-10">Create Account</span>
                      <span className="pointer-events-none absolute inset-0 opacity-[0.14] bg-[radial-gradient(circle_at_65%_20%,rgba(0,242,254,0.35),transparent_60%)]" />
                    </motion.button>

                    <div className="pt-2">
                      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00f2fe]/35 to-transparent" />
                      <div className="mt-3 text-[10px] font-black uppercase tracking-[4px] text-white/35 text-center">
                        Protected by Supabase Auth
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 h-[3px] w-24 rounded-full bg-white/10 mx-auto" />
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ocean {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(2%, -2%, 0) rotate(6deg);
          }
        }
        @keyframes scan {
          0% {
            background-position: 0 -220px;
          }
          100% {
            background-position: 0 calc(100% + 220px);
          }
        }
        @keyframes shard {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(var(--r, 0deg)) scale(1);
          }
          50% {
            transform: translate3d(22px, -18px, 0)
              rotate(calc(var(--r, 0deg) + 8deg))
              scale(1.05);
          }
        }
        @keyframes matrixFall {
          0% {
            transform: translate3d(0, -18%, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          75% {
            opacity: 0.55;
          }
          100% {
            transform: translate3d(0, 18%, 0);
            opacity: 0;
          }
        }
        @keyframes sheen {
          0%,
          60% {
            transform: translateX(-60%) rotate(12deg);
            opacity: 0;
          }
          80% {
            opacity: 0.35;
          }
          100% {
            transform: translateX(180%) rotate(12deg);
            opacity: 0;
          }
        }
        .matrix-fall {
          animation-name: matrixFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
          filter: drop-shadow(0 0 10px rgba(0, 242, 254, 0.25));
          mix-blend-mode: screen;
        }
      `}</style>
    </div>
  );
}
