"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { PlusCircle, Gauge, Coins, BookOpen, Radio, Video } from "lucide-react";
// FIX: Change import from named export 'supabase' to named export 'createClient'
import { createClient } from "@/lib/supabaseClient";

export default function ParablesDashboard() {
  // FIX: Instantiate the client by calling the createClient function
  const supabase = createClient();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [parables, setParables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const uid = userData.user.id;
    setProfileId(uid);

    // fetch parables created by user
    const { data } = await supabase
      .from("parables")
      .select("*")
      .eq("creator_id", uid)
      .order("created_at", { ascending: false });

    setParables(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-24 space-y-10">

        {/* Header */}
        <section>
          <h1 className="text-3xl font-extrabold">Parables Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your Parable series, episodes, analytics, and monetization.
          </p>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* New Series */}
          <Link
            href="/creator/parables/new-series"
            className="
              bg-[#111] p-6 rounded-2xl border border-white/10
              hover:border-[#53fc18]/50 transition flex flex-col items-center gap-3
            "
          >
            <BookOpen className="w-10 h-10 text-[#53fc18]" />
            <p className="font-bold text-sm">Create Series</p>
          </Link>

          {/* Upload Episode */}
          <Link
            href="/creator/parables/upload"
            className="
              bg-[#111] p-6 rounded-2xl border border-white/10
              hover:border-[#53fc18]/50 transition flex flex-col items-center gap-3
            "
          >
            <Video className="w-10 h-10 text-[#53fc18]" />
            <p className="font-bold text-sm">Upload Episode</p>
          </Link>

          {/* Earnings */}
          <Link
            href="/monetization"
            className="
              bg-[#111] p-6 rounded-2xl border border-white/10
              hover:border-[#53fc18]/50 transition flex flex-col items-center gap-3
            "
          >
            <Coins className="w-10 h-10 text-[#53fc18]" />
            <p className="font-bold text-sm">Earnings</p>
          </Link>

          {/* Analytics */}
          <Link
            href="/dashboard/analytics"
            className="
              bg-[#111] p-6 rounded-2xl border border-white/10
              hover:border-[#53fc18]/50 transition flex flex-col items-center gap-3
            "
          >
            <Gauge className="w-10 h-10 text-[#53fc18]" />
            <p className="font-bold text-sm">Analytics</p>
          </Link>

          {/* Streaming */}
          <Link
            href="/creator/tools"
            className="
              bg-[#111] p-6 rounded-2xl border border-white/10
              hover:border-[#53fc18]/50 transition flex flex-col items-center gap-3
            "
          >
            <Radio className="w-10 h-10 text-[#53fc18]" />
            <p className="font-bold text-sm">Streaming Studio</p>
          </Link>
        </section>

        {/* Series Section */}
        <section className="bg-[#111] p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Your Parable Series</h2>
            <Link
              href="/creator/parables/new-series"
              className="text-[#53fc18] text-xs font-bold"
            >
              + New Series
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-4 bg-black border border-white/10 rounded-xl text-center text-gray-400 text-sm">
              Loading series...
            </div>
          )}

          {/* No Series */}
          {!loading && parables.length === 0 && (
            <div className="p-4 bg-black border border-white/10 rounded-xl text-center text-gray-400 text-sm">
              No series yet. Create one to begin building your Parable collections.
            </div>
          )}

          {/* Series List */}
          {parables.map((p) => (
            <Link
              key={p.id}
              href={`/creator/parables/${p.id}`}
              className="
                block p-4 bg-black border border-white/10 rounded-xl
                hover:border-[#53fc18]/50 transition
              "
            >
              <p className="font-bold text-sm">{p.title}</p>
              <p className="text-xs text-gray-400">{p.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
