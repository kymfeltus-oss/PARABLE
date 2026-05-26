"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HubBackground from "@/components/HubBackground";
import { createClient } from "@/utils/supabase/client";

const styles = `
  @keyframes floatUp { 
    0% { transform: translateY(0) scale(0); opacity: 0; } 
    50% { opacity: .9; transform: translateY(-110px) scale(1.2); } 
    100% { transform: translateY(-220px) scale(0); opacity: 0; } 
  }

  @keyframes energyFlow {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes gridDrift {
    0% { transform: translateY(0); opacity: .18; }
    100% { transform: translateY(22px); opacity: .18; }
  }

  @keyframes glowSweep {
    0% { filter: brightness(1) drop-shadow(0 0 10px #00f2ff); }
    50% { filter: brightness(1.35) drop-shadow(0 0 44px #00f2ff); }
    100% { filter: brightness(1) drop-shadow(0 0 10px #00f2ff); }
  }

  @keyframes techScan {
    0% { transform: translateY(-140%); opacity: 0; }
    15% { opacity: .9; }
    55% { opacity: .25; }
    100% { transform: translateY(180%); opacity: 0; }
  }

  @keyframes borderPulse {
    0%,100% { box-shadow: 0 0 0 rgba(0,242,255,0); }
    50% { box-shadow: 0 0 44px rgba(0,242,255,.14); }
  }

  @keyframes dotPulse {
    0% { opacity: .15; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-1px); }
    100% { opacity: .15; transform: translateY(0); }
  }

  @keyframes shimmer {
    0% { transform: translateX(-120%); opacity: 0; }
    15% { opacity: .9; }
    50% { opacity: .25; }
    100% { transform: translateX(140%); opacity: 0; }
  }

  @keyframes softFlicker {
    0%,100% { opacity: .28; }
    50% { opacity: .42; }
  }
`;

function ComputingStatus() {
  const messages = useMemo(
    () => [
      "BOOTING SANCTUARY MODULE",
      "VERIFYING VAULT ACCESS",
      "SYNCING STREAM LAYERS",
      "ENCRYPTING OFFERING VAULT",
      "FINALIZING SESSION",
    ],
    []
  );

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((v) => (v + 1) % messages.length);
    }, 900);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="mx-auto mt-4 md:mt-6 w-full max-w-md rounded-sm border border-[#00f2ff]/18 bg-black/45 px-4 py-3.5 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]" />
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[6px] text-white/55">
            STATUS
          </span>
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[6px] text-[#00f2ff] drop-shadow-[0_0_10px_#00f2ff]">
            READY
          </span>
        </div>

        <div className="flex items-center gap-1">
          {[0, 1, 2].map((n) => (
            <span
              key={n}
              className="h-1.5 w-1.5 rounded-full bg-[#00f2ff]"
              style={{
                animation: "dotPulse 1s ease-in-out infinite",
                animationDelay: `${n * 0.18}s`,
                opacity: 0.25,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="text-[10px] md:text-[11px] font-black uppercase tracking-[5px] text-white/40">
          {messages[idx]}
        </div>
        <div
          className="text-[10px] md:text-[11px] font-black uppercase tracking-[5px] text-white/25"
          style={{ animation: "softFlicker 1.6s ease-in-out infinite" }}
        >
          LIVE
        </div>
      </div>

      <div className="relative mt-3 h-[2px] bg-white/10 overflow-hidden">
        <div className="absolute left-0 w-1 h-full bg-[#00f2ff]" />
        <div className="absolute right-0 w-1 h-full bg-[#00f2ff]" />
        <div
          className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-70"
          style={{
            backgroundSize: "200% 100%",
            animation: "energyFlow 2s linear infinite",
          }}
        />
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => setHasMounted(true), []);

  const sparkles = useMemo(() => {
    return [...Array(55)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 6,
    }));
  }, []);

  const handleEnter = async () => {
    if (entering) return;
    setEntering(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      router.push(session?.user ? "/my-sanctuary" : "/create-account");
    } catch {
      router.push("/create-account");
    } finally {
      setTimeout(() => setEntering(false), 650);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden selection:bg-[#00f2ff]">
      <style>{styles}</style>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <HubBackground />

        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,242,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,242,255,0.055)_1px,transparent_1px)] bg-[size:56px_56px]"
            style={{ animation: "gridDrift 6s ease-in-out infinite alternate" }}
          />
        </div>

        <div className="absolute inset-0">
          {hasMounted &&
            sparkles.map((s) => (
              <div
                key={s.id}
                className="absolute w-[2px] h-[2px] bg-[#00f2ff] rounded-full shadow-[0_0_8px_#00f2ff]"
                style={{
                  left: s.left,
                  top: s.top,
                  animation: `floatUp 8s linear infinite`,
                  animationDelay: `${s.delay}s`,
                  opacity: 0,
                }}
              />
            ))}
          <div className="absolute bottom-0 left-0 right-0 h-[34vh] bg-gradient-to-t from-[#00f2ff]/6 to-transparent blur-[120px]" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,black_100%)] opacity-90" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[480px] sm:max-w-3xl lg:max-w-5xl px-4 sm:px-6 md:px-8 py-12 md:py-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div
            className="relative overflow-hidden border border-[#00f2ff]/22 bg-black/55 backdrop-blur-md rounded-lg md:rounded-xl"
            style={{ animation: "borderPulse 5s ease-in-out infinite" }}
          >
            <div className="absolute left-0 top-0 h-6 w-6 md:h-8 md:w-8 border-l-2 border-t-2 border-[#00f2ff]" />
            <div className="absolute right-0 top-0 h-6 w-6 md:h-8 md:w-8 border-r-2 border-t-2 border-[#00f2ff]" />
            <div className="absolute left-0 bottom-0 h-6 w-6 md:h-8 md:w-8 border-l-2 border-b-2 border-[#00f2ff]" />
            <div className="absolute right-0 bottom-0 h-6 w-6 md:h-8 md:w-8 border-r-2 border-b-2 border-[#00f2ff]" />

            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-x-0 h-44 bg-gradient-to-b from-transparent via-[#00f2ff]/10 to-transparent"
                style={{ animation: "techScan 3.2s linear infinite" }}
              />
            </div>

            <div className="pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2">
              <div className="h-[240px] w-[240px] md:h-[320px] md:w-[320px] rounded-full bg-[#00f2ff]/10 blur-[85px]" />
              <div className="absolute inset-0 h-[360px] w-[360px] md:h-[480px] md:w-[480px] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-[#00f2ff]/5 blur-[140px]" />
            </div>

            <div className="relative px-6 py-10 sm:px-8 sm:py-12 md:px-12 md:py-16">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative mx-auto mb-8 md:mb-10 h-[80px] w-[260px] sm:h-[88px] sm:w-[280px] md:h-[96px] md:w-[300px]"
                style={{ animation: "glowSweep 4s ease-in-out infinite" }}
              >
                <Image
                  src="/logo.svg"
                  alt="Parable"
                  fill
                  className="object-contain drop-shadow-[0_0_20px_rgba(0,242,255,0.35)]"
                  priority
                />
              </motion.div>

              <div className="space-y-8 md:space-y-10">
                <div className="text-center md:text-left space-y-4 md:space-y-5">
                  <p className="text-[11px] sm:text-xs md:text-sm font-black text-[#00f2ff] uppercase tracking-[8px]">
                    Faith • Streaming • Gaming
                  </p>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                    The premier{" "}
                    <span className="text-[#00f2ff]">
                      faith‑tech ecosystem
                    </span>{" "}
                    for the Black Church.
                  </h2>

                  <p className="text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed">
                    Stream sermons, host live conversations, play with your community, and
                    monetize your calling without giving away ownership of the sanctuary.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center justify-center md:justify-start gap-6 sm:gap-8">
                    {["STREAM", "PLAY", "PROSPER"].map((text) => (
                      <span
                        key={text}
                        className="text-[10px] sm:text-[11px] font-black text-white/35 tracking-[6px] hover:text-[#00f2ff] transition-colors cursor-default"
                      >
                        {text}
                      </span>
                    ))}
                  </div>

                  <div className="md:w-72">
                    <ComputingStatus />
                  </div>
                </div>

                <div className="pt-4 md:pt-6">
                  <button
                    onClick={handleEnter}
                    disabled={entering}
                    className="group relative w-full max-w-md mx-auto rounded-sm border border-[#00f2ff]/30 bg-black/75 px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6 active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed block"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm">
                      <div className="absolute inset-0 bg-[#00f2ff]/10 blur-[18px]" />
                    </div>
                    <div className="absolute inset-0 overflow-hidden rounded-sm">
                      <div
                        className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-[#00f2ff]/10 to-transparent opacity-0 group-hover:opacity-100"
                        style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
                      />
                    </div>

                    <span className="relative z-10 block text-[#00f2ff] group-hover:text-white font-black text-lg sm:text-xl md:text-2xl uppercase tracking-[10px] sm:tracking-[12px] transition-colors">
                      {entering ? "Entering..." : "Enter Sanctuary"}
                    </span>

                    <span className="relative z-10 mt-2 block text-[10px] sm:text-[11px] text-white/25 uppercase tracking-[4px]">
                      New users create an account • Returning users go to My Sanctuary
                    </span>
                  </button>

                  <div className="relative mx-auto mt-6 w-48 sm:w-64 h-[2px] bg-white/10 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-70"
                      style={{
                        backgroundSize: "200% 100%",
                        animation: "energyFlow 2s linear infinite",
                      }}
                    />
                    <div className="absolute left-0 w-1 h-full bg-[#00f2ff]" />
                    <div className="absolute right-0 w-1 h-full bg-[#00f2ff]" />
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-between pt-4 md:pt-6 text-[10px] sm:text-[11px] text-white/30">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => router.push("/create-account")}
                      className="font-black uppercase tracking-[6px] hover:text-[#00f2ff] transition-colors"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => router.push("/login")}
                      className="font-black uppercase tracking-[6px] text-white/60 hover:text-[#00f2ff] transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                  <span className="hidden md:inline">
                    Already have an account? You’ll go straight to My Sanctuary.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,black_100%)] opacity-80 rounded-lg md:rounded-xl" />
        </motion.div>
      </div>
    </div>
  );
}
