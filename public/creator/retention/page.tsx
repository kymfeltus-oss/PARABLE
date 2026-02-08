"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function RetentionPage() {
  const supabase = createClient();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // FIX: Protect against null user
    if (!user) {
      setSessions([]);
      return;
    }

    // FIX: user.id now guaranteed safe
    const { data: streams } = await supabase
      .from("live_streams")
      .select("id")
      .eq("creator_id", user.id)
      .order("started_at", { ascending: false })
      .limit(1);

    const latest = streams?.[0]?.id;
    if (!latest) return;

    const { data } = await supabase
      .from("viewer_sessions")
      .select("*")
      .eq("stream_id", latest)
      .order("duration_seconds", { ascending: false });

    setSessions(data || []);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Viewer Retention</h1>

      <div className="space-y-3 max-w-xl">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="bg-[#111] border border-white/10 p-4 rounded flex justify-between"
          >
            <p className="text-sm">{s.viewer_id || "Guest"}</p>
            <p className="text-sm text-gray-300">
              {s.duration_seconds}s watched
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
