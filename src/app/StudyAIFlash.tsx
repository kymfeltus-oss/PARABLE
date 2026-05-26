"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AppLogo from "@/components/AppLogo";

export default function StudyAIFlash() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const ref = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const go = async () => {
    if (ref.current) return;
    ref.current = true;
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace("/dashboard");
        return;
      }
      router.replace("/welcome");
    } catch {
      router.replace("/welcome");
    }
  };

  useEffect(() => {
    const t = setTimeout(go, 4000);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") go(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0804] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-soft-light" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md text-center">
        <AppLogo size="md" showLabel className="scale-150" />
        <p className="text-amber-400/90 text-sm font-medium tracking-widest uppercase">
          The Intelligence Behind the Word
        </p>
        <p className="text-white/50 text-xs max-w-xs">
          Deep study. AI Scholar. Groups & live reading.
        </p>
        <button
          type="button"
          onClick={go}
          className="mt-4 rounded-full bg-amber-500 px-8 py-3 text-sm font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition shadow-[0_0_40px_rgba(234,179,8,0.3)]"
        >
          Enter
        </button>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <p className="text-[10px] text-white/30 uppercase tracking-widest">PARABLE Study AI</p>
      </div>
    </div>
  );
}
