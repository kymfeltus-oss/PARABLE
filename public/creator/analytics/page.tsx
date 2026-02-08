"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function AnalyticsPage() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("stream_metrics")
      .select("*")
      .order("created_at", { ascending: false });

    setMetrics(data || []);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <div className="space-y-4">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="bg-[#111] border border-white/10 p-4 rounded-xl"
          >
            <p className="font-bold">Stream: {m.stream_id}</p>
            <p className="text-sm text-gray-400">
              Viewers: {m.viewer_count}
            </p>
            <p className="text-xs text-gray-500">{m.created_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
