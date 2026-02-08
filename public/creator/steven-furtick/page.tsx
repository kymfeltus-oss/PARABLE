"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Users, Sparkles, Gift, Crown, Video, Play } from "lucide-react";

const tabs = ["Home", "Videos", "Clips", "About", "Chat"] as const;
type TabKey = (typeof tabs)[number];

export default function FurtickProfile() {
  const [activeTab, setActiveTab] = useState<TabKey>("Home");

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">

        {/* HERO LIVESTREAM */}
        <section className="rounded-2xl overflow-hidden border border-white/10">
          <div className="relative w-full pt-[56.25%] bg-black">
            <iframe
              src="https://www.youtube.com/embed/XXGQyKyEdz8"
              className="absolute inset-0 w-full h-full object-cover"
              allowFullScreen
            ></iframe>

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase animate-pulse">
                LIVE
              </span>
              <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                <Users className="w-3 h-3" /> 12,841 watching
              </span>
            </div>
          </div>
        </section>

        {/* CREATOR HEADER */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/steven-furtick.jpg"
              className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Steven Furtick <Sparkles className="w-4 h-4 text-blue-400" />
              </h1>
              <p className="text-xs text-gray-400">@stevenfurtick • Elevation Church</p>
              <div className="text-[11px] text-gray-400 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> 900k followers
                </span>
                <span className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-yellow-400" /> Level 14
                </span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 flex-wrap">
            <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold">
              Follow
            </button>
            <button className="bg-green-500 text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1">
              <Crown className="w-3 h-3" /> Subscribe
            </button>
            <button className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1">
              <Gift className="w-3 h-3" /> Send Seeds
            </button>
          </div>
        </section>

        {/* TABS */}
        <section className="border-b border-white/10 pb-2 flex gap-4 text-xs font-bold uppercase tracking-wide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 ${
                activeTab === tab ? "text-blue-400 border-b-2 border-blue-500" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </section>

        {/* TAB RENDER */}
        <section>
          {activeTab === "Home" && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Play className="w-4 h-4" /> Featured Message
                </h2>

                <div className="aspect-video border border-white/10 rounded-xl overflow-hidden">
                  <iframe
                    src="https://www.youtube.com/embed/XXGQyKyEdz8"
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>

                <p className="text-sm text-gray-300">
                  <span className="font-bold">God Is Not Done With You</span> — A message of hope, clarity, and faith.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#111] border border-white/10 p-4 rounded-xl text-xs text-gray-300">
                  <h3 className="font-bold text-gray-400 mb-2 uppercase tracking-wide">
                    About Steven
                  </h3>
                  Steven Furtick is the lead pastor of Elevation Church and creator of Elevation Worship.
                </div>

                <div className="bg-[#111] border border-white/10 p-4 rounded-xl text-xs text-gray-300">
                  <h3 className="font-bold text-gray-400 mb-2 uppercase tracking-wide">Links</h3>
                  <p>• elevationchurch.org</p>
                  <p>• YouTube @stevenfurtick</p>
                  <p>• IG: @stevenfurtick</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Videos" && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Video className="w-4 h-4" /> Videos
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#111] rounded-xl overflow-hidden border border-white/10">
                  <div className="aspect-video">
                    <iframe
                      src="https://www.youtube.com/embed/XXGQyKyEdz8"
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold">When God Whispers</p>
                    <p className="text-[11px] text-gray-400">2 days ago • 120k views</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Clips" && (
            <p className="text-xs text-gray-400">Clips coming soon…</p>
          )}

          {activeTab === "About" && (
            <div className="text-sm text-gray-300 space-y-2 max-w-2xl">
              <h2 className="text-lg font-bold">About Steven Furtick</h2>
              <p>
                Steven’s messages focus on faith, identity, confidence, and purpose. His passion is
                equipping believers with the clarity and courage to walk out their calling.
              </p>
            </div>
          )}

          {activeTab === "Chat" && (
            <div className="bg-[#111] border border-white/10 p-4 rounded-xl">
              <p className="text-xs text-gray-400">Chat opens during live streams.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
