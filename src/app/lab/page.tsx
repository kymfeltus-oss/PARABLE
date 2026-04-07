"use client";

import { useRouter } from "next/navigation";
import { Search, Video, Sparkles } from "lucide-react";
import AppLogo from "@/components/AppLogo";

export default function LabPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#020107] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,242,255,0.06),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.12] mix-blend-soft-light" />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-full flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/sanctuary-reader")}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 hover:border-[var(--color-cyber)]/60 transition"
          >
            <AppLogo size="md" showLabel />
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[9px] font-mono uppercase tracking-[3px] text-[var(--color-cyber)]/70">
                The Lab
              </span>
              <span className="text-xs text-white/70">Creator tools</span>
            </div>
          </button>
          <button
            onClick={() => router.push("/sanctuary-reader")}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[2px] text-white/70 hover:border-[var(--color-cyber)]/60"
          >
            Back to Reader
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="inline-flex h-1.5 w-10 rounded-full bg-gradient-to-r from-[var(--color-cyber)] via-sky-400 to-emerald-400" />
          <span className="font-mono uppercase tracking-[2.5px] text-white/60">
            Theory Solver · Verse-to-Video · Sermon Prep
          </span>
        </div>

        <section className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[var(--color-cyber)]" />
            <h2 className="text-sm font-semibold">Theory Solver</h2>
          </div>
          <p className="text-xs text-white/60">
            Semantic search for biblical mysteries, archaeology, and theology. Use it from the
            Sanctuary Reader sidebar for passage-grounded answers.
          </p>
          <button
            onClick={() => router.push("/sanctuary-reader")}
            className="rounded-full bg-[var(--color-cyber)] px-4 py-2 text-[11px] font-bold uppercase tracking-[2px] text-black hover:bg-[#4df7ff]"
          >
            Open Sanctuary Reader
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[var(--color-cyber)]" />
            <h2 className="text-sm font-semibold">Verse-to-Video Studio</h2>
          </div>
          <p className="text-xs text-white/60">
            Turn a verse into a 9:16 vertical video with AI visuals and kinetic typography.
          </p>
          <p className="text-[11px] text-white/45">Coming soon</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-cyber)]" />
            <h2 className="text-sm font-semibold">Sermon Prep Illustrator</h2>
          </div>
          <p className="text-xs text-white/60">
            Input a concept (e.g. “Grace”) and get three modern analogies: Tech, Culture, Nature.
          </p>
          <p className="text-[11px] text-white/45">Coming soon</p>
        </section>
      </div>
    </div>
  );
}
