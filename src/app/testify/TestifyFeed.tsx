"use client";

import { useState } from "react";

type FeedMode = "for_you" | "following" | "praise_breaks";

export default function TestifyFeed() {
  const [mode, setMode] = useState<FeedMode>("for_you");

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(0,242,255,0.12),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(0,242,255,0.08),transparent_45%)]" />

      {/* PAGE GRID */}
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-8">

        {/* LEFT — ONLINE */}
        <aside className="col-span-3 hidden lg:block">
          <div className="rounded-2xl border border-cyan-400/10 bg-black/80 p-4 backdrop-blur">
            <h3 className="mb-4 text-xs tracking-widest text-cyan-300 uppercase">
              Online Now
            </h3>

            <div className="space-y-3">
              <OnlineUser name="You" />
              <OnlineUser name="Parable" />
            </div>
          </div>
        </aside>

        {/* CENTER — FEED */}
        <main className="col-span-12 lg:col-span-6 space-y-6">

          {/* FEED TABS */}
          <div className="flex gap-3">
            <Tab label="For You" active={mode === "for_you"} onClick={() => setMode("for_you")} />
            <Tab label="Following" active={mode === "following"} onClick={() => setMode("following")} />
            <Tab label="Praise Breaks" active={mode === "praise_breaks"} onClick={() => setMode("praise_breaks")} />
          </div>

          {/* COMPOSER */}
          <div className="rounded-2xl border border-cyan-400/10 bg-black/80 p-4 backdrop-blur">
            <textarea
              placeholder="Share what’s moving in your spirit…"
              className="w-full resize-none bg-transparent text-sm text-white placeholder:text-cyan-200/40 focus:outline-none"
              rows={3}
            />

            <div className="mt-3 flex justify-between">
              <button className="text-xs text-cyan-300">Praise Break 🙌🏾</button>
              <button className="rounded-full border border-cyan-400/30 px-4 py-1 text-xs text-cyan-300 hover:bg-cyan-400/10">
                Post
              </button>
            </div>
          </div>

          {/* POST */}
          <Post praise />
          <Post />
        </main>

        {/* RIGHT — SUGGESTED */}
        <aside className="col-span-3 hidden lg:block">
          <div className="rounded-2xl border border-cyan-400/10 bg-black/80 p-4 backdrop-blur">
            <h3 className="mb-4 text-xs tracking-widest text-cyan-300 uppercase">
              Discover
            </h3>

            <SuggestedUser name="Creator One" />
            <SuggestedUser name="Creator Two" />
          </div>
        </aside>

      </div>
    </div>
  );
}

/* ===== COMPONENTS ===== */

function Tab({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1 text-xs transition ${
        active
          ? "border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
          : "border border-transparent text-white/50 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function Post({ praise }: { praise?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-4 backdrop-blur border ${
        praise
          ? "border-cyan-400/40 shadow-[0_0_30px_rgba(0,242,255,0.35)] animate-pulse"
          : "border-cyan-400/10 bg-black/80"
      }`}
    >
      <div className="mb-2 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-cyan-400/30" />
        <div>
          <p className="text-sm font-medium">Parable</p>
          <p className="text-xs text-white/40">2 min ago</p>
        </div>
        {praise && (
          <span className="ml-auto rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs text-cyan-300">
            🙌🏾 Praise Break
          </span>
        )}
      </div>

      <p className="text-sm text-white/90">
        When the spirit moves, you move. No explanation needed.
      </p>

      <div className="mt-4 flex gap-4 text-xs text-cyan-300">
        <span>🙌🏾 124</span>
        <span>💬 18</span>
        <span>🔖 Save</span>
      </div>
    </div>
  );
}

function OnlineUser({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-8 w-8 rounded-full bg-cyan-400/30">
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2ff]" />
      </div>
      <span className="text-sm">{name}</span>
    </div>
  );
}

function SuggestedUser({ name }: { name: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm">{name}</span>
      <button className="text-xs text-cyan-300">Follow</button>
    </div>
  );
}
