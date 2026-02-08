"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function EarningsPage() {
  const supabase = createClient();
  const [earnings, setEarnings] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("earnings")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    setEarnings(data || []);
  }

  const total = earnings.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Earnings</h1>
      <p className="text-xl text-[#53fc18] font-bold mb-4">
        Total: ${(total / 100).toFixed(2)}
      </p>

      <div className="space-y-3">
        {earnings.map((e) => (
          <div
            key={e.id}
            className="bg-[#111] border border-white/10 p-4 rounded-xl text-sm flex justify-between"
          >
            <div>
              <p className="font-bold">${(e.amount / 100).toFixed(2)}</p>
              <p className="text-gray-400">{e.source}</p>
            </div>
            <p className="text-xs text-gray-500">{e.created_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
