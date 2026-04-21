"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { HubStreamLiveToast } from "@/components/NotificationToast";
import {
  FELLOWSHIP_HUB_CHANNEL,
  FELLOWSHIP_HUB_STREAM_START_EVENT,
  type FellowshipHubStreamStartPayload,
} from "@/lib/fellowship-hub-broadcast";

/**
 * Hub sanctuary zone — slide-in mount animation suggests “stepping into” a new wing.
 * Broadcast listener lives here so go-live events surface immediately while you’re on `/hub`.
 */
export default function HubPage() {
  const [toastLine, setToastLine] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setToastLine(text);
  }, []);

  const dismissToast = useCallback(() => setToastLine(null), []);

  useEffect(() => {
    const supabase = createClient();
    const hubChannel = supabase.channel(FELLOWSHIP_HUB_CHANNEL);
    const channel = (hubChannel as unknown as { on: (...args: unknown[]) => typeof hubChannel })
      .on(
        "broadcast",
        { event: FELLOWSHIP_HUB_STREAM_START_EVENT },
        (msg: { payload?: FellowshipHubStreamStartPayload }) => {
          // Realtime wraps your body in `payload`; tutorials sometimes read fields off the outer object.
          const p = msg.payload;
          if (!p?.username || typeof p.message !== "string") return;
          showToast(`${p.username} ${p.message}`);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [showToast]);

  return (
    <>
      <HubStreamLiveToast message={toastLine} onDismiss={dismissToast} />

      <motion.main
        initial={{ opacity: 0, x: 56 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 260, mass: 0.85 }}
        className="min-h-0 flex-1 bg-gradient-to-b from-[#5865f2]/[0.07] via-[#08080a] to-black px-4 py-8"
      >
        <div className="mx-auto max-w-lg space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#5865f2]">Parable hub</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">You’ve entered the hub</h1>
          <p className="text-sm leading-relaxed text-white/55">
            This space connects your stream command center to ministry tools, directories, and live moments — a deeper
            slice of the sanctuary.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/hubs"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(88,101,242,0.35)] transition hover:brightness-110"
            >
              <Sparkles className="h-4 w-4" />
              Browse hubs directory
            </Link>
            <Link
              href="/streamers"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/25 hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Streamers
            </Link>
          </div>
        </div>
      </motion.main>
    </>
  );
}
