"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Film,
  Sparkles,
  Heart,
  MessageSquare,
  Compass,
  Cpu,
  Wand2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type ParableShortProfile = {
  username?: string;
  avatar_url?: string;
};

export type ParableShort = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  likes_count: number;
  views_count: number;
  profiles?: ParableShortProfile | ParableShortProfile[] | null;
};

const DEMO_SHORTS: ParableShort[] = [
  {
    id: "demo-1",
    title: "The Silent Digital Sanctuary",
    description: "AI Generated Cinematic Short",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
    likes_count: 1420,
    views_count: 5800,
    profiles: { username: "AIVisualist" },
  },
  {
    id: "demo-2",
    title: "Prophetic Horizons",
    description: "Sermon highlight clip overlaid matrix",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
    likes_count: 894,
    views_count: 2310,
    profiles: { username: "SanctuaryStreamer" },
  },
];

function profileUsername(short: ParableShort): string {
  const p = short.profiles;
  if (!p) return "Creator";
  if (Array.isArray(p)) return p[0]?.username?.trim() || "Creator";
  return p.username?.trim() || "Creator";
}

type Props = {
  userId: string;
};

export default function ParableStudioClient({ userId }: Props) {
  const [activeTab, setActiveTab] = useState<"discover" | "studio">("discover");
  const [shorts, setShorts] = useState<ParableShort[]>(DEMO_SHORTS);
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [selectedActor, setSelectedActor] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const loadShortsCatalog = useCallback(async () => {
    const { data, error } = await supabase
      .from("parable_shorts")
      .select(
        "id, title, description, video_url, likes_count, views_count, profiles:creator_id(username, avatar_url)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[ParableStudio] catalogue load:", error.message);
      setShorts(DEMO_SHORTS);
      return;
    }

    setShorts(data?.length ? (data as ParableShort[]) : DEMO_SHORTS);
  }, []);

  useEffect(() => {
    void loadShortsCatalog();
  }, [loadShortsCatalog]);

  const handleInitiateAiGeneration = async () => {
    if (!generationPrompt.trim()) return;
    setIsGenerating(true);

    window.setTimeout(() => {
      setIsGenerating(false);
      setGenerationPrompt("");
      alert(
        "AI cinematic short compiled successfully! Append payload row to discovery catalogue when storage is connected.",
      );
    }, 4000);
  };

  const toggleVideoPlayback = (shortId: string) => {
    const el = videoRefs.current[shortId];
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#080a0c] font-sans text-[#f8fafc]">
      <header className="z-20 flex w-full shrink-0 items-center justify-between border-b border-[#191f24] bg-[#111722]/80 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Film className="h-5 w-5 text-[#00f2ff]" />
          <h1 className="text-lg font-black tracking-tight text-white uppercase">
            Parable{" "}
            <span className="rounded border border-[#00f2ff]/20 bg-[#00f2ff]/10 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-[#00f2ff]">
              AI FILM STUDIO
            </span>
          </h1>
        </div>

        <div className="flex items-center rounded-lg border border-[#191f24] bg-[#0b0e11] p-1 font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("discover")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 transition-colors sm:px-4 ${
              activeTab === "discover"
                ? "bg-[#242c33] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Compass className="h-3.5 w-3.5" /> Catalogue
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 transition-colors sm:px-4 ${
              activeTab === "studio"
                ? "bg-[#242c33] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Wand2 className="h-3.5 w-3.5" /> Creator Deck
          </button>
        </div>
      </header>

      <div className="relative min-h-0 w-full flex-1">
        {activeTab === "discover" ? (
          <div
            data-testid="parable-shorts-catalogue"
            className="flex h-full w-full snap-y snap-mandatory flex-col items-center overflow-y-scroll bg-[#05070a]"
          >
            {shorts.map((short) => (
              <div
                key={short.id}
                className="relative flex h-full w-full max-w-[450px] shrink-0 snap-start items-center justify-center border-b border-neutral-900/40 p-4"
              >
                <div className="group relative h-full max-h-[820px] w-full overflow-hidden rounded-2xl border border-neutral-800/40 bg-black shadow-2xl">
                  <video
                    ref={(el) => {
                      videoRefs.current[short.id] = el;
                    }}
                    src={short.video_url}
                    className="h-full w-full object-cover"
                    loop
                    muted
                    playsInline
                    onClick={() => toggleVideoPlayback(short.id)}
                  />

                  <div className="absolute inset-x-0 bottom-0 z-10 space-y-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 text-xs select-text">
                    <h3 className="truncate text-sm font-black tracking-tight text-white">
                      @{profileUsername(short)}
                    </h3>
                    <h4 className="line-clamp-1 font-bold tracking-wide text-gray-200">
                      {short.title}
                    </h4>
                    <p className="line-clamp-2 font-medium text-gray-400">{short.description}</p>
                  </div>

                  <div className="absolute right-4 bottom-20 z-20 flex flex-col items-center gap-5 text-center font-mono text-[10px] font-bold text-gray-300">
                    <button
                      type="button"
                      className="rounded-full border border-neutral-800 bg-black/60 p-3 shadow-xl backdrop-blur-md transition-colors hover:text-red-500 active:scale-90"
                      aria-label="Like short"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </button>
                    <span>{short.likes_count.toLocaleString()}</span>

                    <button
                      type="button"
                      className="rounded-full border border-neutral-800 bg-black/60 p-3 shadow-xl backdrop-blur-md transition-colors hover:text-[#00f2ff] active:scale-90"
                      aria-label="View comments"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <span>{short.views_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            data-testid="parable-ai-studio-deck"
            className="grid h-full w-full grid-cols-1 gap-6 overflow-y-auto p-4 lg:grid-cols-2 lg:overflow-hidden lg:p-8"
          >
            <div className="h-fit space-y-6 rounded-2xl border border-[#191f24] bg-[#111722]/50 p-5 shadow-xl lg:h-full lg:overflow-y-auto">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-black tracking-wider text-white uppercase">
                  <Cpu className="h-4 w-4 text-[#00f2ff]" /> Character Setup
                </h2>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-gray-400">
                  Select an AI identity structure to generate synthetic performances.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  AI Persona Avatar Actor
                </label>
                <select
                  value={selectedActor}
                  onChange={(e) => setSelectedActor(e.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-[#191f24] bg-[#0b0e11] p-3 text-xs font-semibold text-white outline-none focus:border-[#00f2ff]/40"
                >
                  <option value="">-- Choose Virtual Actor Anchor --</option>
                  <option value="cinematic_pastor">
                    Pastor Virtual Archetype (Cinematic Voice v2)
                  </option>
                  <option value="futuristic_historian">
                    Cyber Historian (Voice Profile Echo-4)
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Director Prompt Context Instructions
                </label>
                <textarea
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  placeholder="Describe scene details, script dialogue, camera angles, or atmospheric configurations here..."
                  className="h-32 w-full resize-none rounded-lg border border-[#191f24] bg-[#0b0e11] p-3 text-xs leading-relaxed font-medium text-white outline-none placeholder:text-gray-700 focus:border-[#00f2ff]/40"
                />
              </div>

              <button
                type="button"
                onClick={() => void handleInitiateAiGeneration()}
                disabled={isGenerating || !generationPrompt.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#0ea5e9] py-3.5 text-xs font-black tracking-widest text-black uppercase shadow-lg transition-transform active:scale-[0.98] disabled:opacity-40"
              >
                <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "Generating Video Layers…" : "Render AI Short"}
              </button>

              <p className="font-mono text-[10px] text-[#64748b]">Creator session: {userId.slice(0, 8)}…</p>
            </div>

            <div className="flex min-h-[360px] flex-col rounded-2xl border border-[#191f24] bg-[#111722]/50 p-6 shadow-xl lg:min-h-0">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-black tracking-wider text-white uppercase">
                <Sparkles className="h-4 w-4 text-[#00f2ff]" /> Studio Monitor
              </h2>
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#191f24] bg-[#0b0e11] p-8 text-center">
                {isGenerating ? (
                  <>
                    <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#191f24] border-t-[#00f2fe]" />
                    <p className="text-sm font-bold text-[#00f2fe]">Compiling synthetic video chunks…</p>
                    <p className="mt-2 max-w-sm text-xs text-gray-400">
                      Assembling voice vectors and high-fidelity lighting passes.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-white">Studio monitor sandbox</p>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-gray-400">
                      Configure prompt fields in the left pane, then render to preview compilation
                      assets in this window.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
