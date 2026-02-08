"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import HubBackground from "@/components/HubBackground";

// CSS Animations: Optimized for mobile GPU
const sanctuaryStyles = `
  @keyframes floatUp { 
    0% { transform: translateY(0) scale(0); opacity: 0; } 
    50% { opacity: 1; transform: translateY(-40px) scale(1.1); } 
    100% { transform: translateY(-80px) scale(0); opacity: 0; } 
  }
  @keyframes fogDrift {
    0% { transform: translateX(-5%) translateY(0); opacity: 0.2; }
    50% { transform: translateX(5%) translateY(-10px); opacity: 0.4; }
    100% { transform: translateX(-5%) translateY(0); opacity: 0.2; }
  }
`;

export default function FlashPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const transitioningRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEntry = async () => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setIsTransitioning(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      router.push(user ? "/my-sanctuary" : "/welcome");
    } catch {
      router.push("/welcome");
    }
  };

  useEffect(() => {
    setHasMounted(true);
    containerRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleEntry();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sparkles = useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={handleEntry}
      className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden outline-none cursor-pointer p-4"
    >
      <style>{sanctuaryStyles}</style>

      {/* BACKGROUND LAYERS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HubBackground />

        <div className="absolute inset-0 z-10">
          {hasMounted &&
            sparkles.map((s) => (
              <div
                key={s.id}
                className="absolute w-1 h-1 bg-[#00f2ff] rounded-full shadow-[0_0_8px_#00f2ff]"
                style={{
                  left: s.left,
                  top: s.top,
                  animation: `floatUp 5s ease-in-out infinite`,
                  animationDelay: `${s.delay}s`,
                  opacity: 0,
                }}
              />
            ))}

          {hasMounted && (
            <div
              className="absolute bottom-[-2vh] left-[-20%] right-[-20%] h-[35vh] bg-[#00f2ff]/20 blur-[80px] rounded-[100%]"
              style={{ animation: "fogDrift 12s ease-in-out infinite" }}
            />
          )}
        </div>
      </div>

      {/* CONTENT LAYER */}
      <motion.div
        className="relative z-20 flex flex-col items-center pointer-events-none w-full max-w-sm md:max-w-xl"
        animate={
          isTransitioning
            ? { scale: 1.05, opacity: 0, filter: "blur(15px)" }
            : {}
        }
        transition={{ duration: 0.6 }}
      >
        <div className="relative w-full aspect-[3/1] mb-6 md:mb-12">
          <Image
            src="/logo.svg"
            alt="Parable Protocol"
            fill
            className="object-contain drop-shadow-[0_0_30px_rgba(0,242,255,0.8)]"
            priority
          />
        </div>

        <div className="flex items-center justify-center w-full mb-16 md:mb-24">
          <p className="text-[2.5vw] md:text-[14px] font-black italic uppercase tracking-[0.4em] md:tracking-[8px] text-[#00f2ff] drop-shadow-[0_0_10px_#00f2ff] text-center">
            STREAMING • CREATING • BELIEVING
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center w-full"
          >
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[4px] md:tracking-[6px] text-white/40 mb-4">
              Tap or Press Enter to Access
            </p>

            <div className="px-10 py-4 md:px-6 md:py-2 border border-[#00f2ff]/30 rounded-xl bg-black/40 backdrop-blur-md shadow-[0_0_20px_rgba(0,242,255,0.1)]">
              <span className="text-[16px] md:text-[14px] font-black text-[#00f2ff] tracking-[4px]">
                ENTER
              </span>
            </div>
          </motion.div>

          <div className="h-[1px] w-24 md:w-32 bg-gradient-to-r from-transparent via-[#00f2ff]/50 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
