"use client";

import { useState } from "react";

export default function StreamKeyPage() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const res = await fetch(
      "https://api.parablestreaming.com/api/stream-key",
      { method: "POST" }
    );
    const json = await res.json();
    if (json.ok) setKey(json.streamKey);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Your Stream Key</h1>

      <button
        onClick={generate}
        disabled={loading}
        className="px-4 py-3 bg-[#53fc18] text-black font-bold rounded"
      >
        {loading ? "Generating..." : "Generate New Stream Key"}
      </button>

      {key && (
        <div className="mt-4 p-4 bg-[#111] border border-white/10 rounded">
          {key}
        </div>
      )}
    </div>
  );
}
