"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Mic2, Square, Wand2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { setProfileLiveStatus } from "@/lib/studio-session";

export default function StudioPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [ending, setEnding] = useState(false);

  const endSession = useCallback(async () => {
    setEnding(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { error } = await setProfileLiveStatus(supabase, user.id, false);
      if (error) {
        console.error("End session:", error.message);
        return;
      }
      refreshProfile();
      router.push("/streamers");
    } finally {
      setEnding(false);
    }
  }, [refreshProfile, router]);

  return (
    <div className="min-h-0 flex-1 bg-[#08080a] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00f2ff]/80">Live studio</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Ghost-Script &amp; AI Architect</h1>
          <p className="mt-2 text-sm text-white/50">
            You&apos;re marked live — open the prompter or AI tools below. End session when you&apos;re finished.
          </p>
        </div>

        <div className="grid gap-3">
          <Link
            href="/teleprompter"
            className="flex items-center gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 transition hover:border-[#00f2ff]/40 hover:bg-white/[0.07]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10">
              <Mic2 className="h-6 w-6 text-fuchsia-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Ghost-Script prompter</p>
              <p className="text-xs text-white/45">Voice-scrolled teleprompter &amp; stage cues</p>
            </div>
            <FileText className="h-5 w-5 shrink-0 text-[#00f2ff]/60" />
          </Link>

          <Link
            href="/lab"
            className="flex items-center gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 transition hover:border-[#00f2ff]/40 hover:bg-white/[0.07]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#00f2ff]/30 bg-[#00f2ff]/10">
              <Wand2 className="h-6 w-6 text-[#00f2ff]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">AI Architect</p>
              <p className="text-xs text-white/45">The Lab — sermon prep, verse tools, sermon prep flows</p>
            </div>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => void endSession()}
          disabled={ending}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          {ending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Square className="h-5 w-5 fill-current" />
          )}
          End session
        </button>

        <p className="text-center text-[11px] text-white/35">
          Ends your live status for followers and returns you to Streamers.
        </p>
      </div>
    </div>
  );
}
