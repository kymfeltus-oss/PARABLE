"use client";

import { useState, useTransition } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Sparkles, Play, Square, MonitorPlay, PenSquare } from "lucide-react";

export default function CreatorToolsPage() {
  const [isLive, setIsLive] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const creatorId = "demo-creator-1"; // TODO: replace with real auth user / creator id

  async function handleGoLive() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/streams/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creatorId,
            title: "Live: Parable Test Stream",
            thumbnail: "/td-jakes.jpg",
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setIsLive(true);
          setStatusMessage("You are now LIVE on Parable.");
        } else {
          setStatusMessage("Could not go live. Try again.");
        }
      } catch (e) {
        setStatusMessage("Error connecting to server.");
      }
    });
  }

  async function handleStopLive() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/streams/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creatorId }),
        });
        const data = await res.json();
        if (data.ok) {
          setIsLive(false);
          setStatusMessage("Stream ended.");
        } else {
          setStatusMessage("Could not stop stream. Try again.");
        }
      } catch (e) {
        setStatusMessage("Error connecting to server.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 mt-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#53fc18]">
              Creator Tools
            </h1>
            <p className="text-sm text-gray-400 mt-2 max-w-xl">
              Prep sermons, manage streams, and control your live presence on Parable.
            </p>
          </div>
          <Sparkles className="w-8 h-8 text-[#53fc18] hidden sm:block" />
        </div>

        {/* Go Live Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#0d0d0d] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Go Live Control</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Toggle your live status on Parable. This is the control center
                  for when your ministry or channel is broadcasting.
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                  isLive ? "bg-red-600 text-white" : "bg-gray-700 text-gray-200"
                }`}
              >
                {isLive ? "LIVE" : "OFFLINE"}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <button
                onClick={isLive ? handleStopLive : handleGoLive}
                disabled={isPending}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm ${
                  isLive
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-[#53fc18] text-black hover:bg-[#6bff3a]"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isLive ? (
                  <>
                    <Square className="w-4 h-4" />
                    End Stream
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Go Live on Parable
                  </>
                )}
              </button>

              <div className="text-xs text-gray-400">
                {isPending
                  ? "Updating live status..."
                  : statusMessage || "Your live status will appear on Home when connected to the backend."}
              </div>
            </div>
          </div>

          {/* Shortcuts Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
            <h3 className="text-sm font-bold mb-2">Quick Tools</h3>

            <Link
              href="/tools/sermon-prep"
              className="flex items-center gap-3 text-xs text-gray-200 hover:text-white"
            >
              <div className="w-8 h-8 rounded-xl bg-[#53fc18]/20 flex items-center justify-center">
                <PenSquare className="w-4 h-4 text-[#53fc18]" />
              </div>
              <div>
                <p className="font-semibold">AI Sermon Assist</p>
                <p className="text-[11px] text-gray-400">
                  Draft & refine your sermon before going live.
                </p>
              </div>
            </Link>

            <Link
              href="/creator/tools/teleprompter"
              className="flex items-center gap-3 text-xs text-gray-200 hover:text-white"
            >
              <div className="w-8 h-8 rounded-xl bg-[#53fc18]/20 flex items-center justify-center">
                <MonitorPlay className="w-4 h-4 text-[#53fc18]" />
              </div>
              <div>
                <p className="font-semibold">Sermon Teleprompter</p>
                <p className="text-[11px] text-gray-400">
                  Upload notes and read them while streaming.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
