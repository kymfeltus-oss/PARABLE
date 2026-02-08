"use client";

import { useEffect, useState } from "react";

export default function StreamManagerPage({ params }: any) {
  const { id } = params;

  const [stream, setStream] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStream();
  }, []);

  async function loadStream() {
    try {
      const res = await fetch(
        `https://api.parablestreaming.com/api/stream/get?id=${id}`,
        { cache: "no-store" }
      );

      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      setStream(json.stream);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function endStream() {
    await fetch("https://api.parablestreaming.com/api/stream/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamId: id })
    });

    window.location.href = "/creator/dashboard";
  }

  if (error)
    return <div className="text-red-400 p-6">Error: {error}</div>;

  if (!stream)
    return <div className="text-white p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{stream.title}</h1>

      {stream.is_live ? (
        <p className="text-red-500 mb-4">● LIVE</p>
      ) : (
        <p className="text-gray-400 mb-4">Stream Offline</p>
      )}

      <img
        src={stream.thumbnail_url}
        className="w-full max-w-lg rounded mb-6 border border-white/20"
      />

      <div className="flex gap-4">
        <button
          onClick={endStream}
          className="px-6 py-3 bg-red-600 text-white rounded"
        >
          End Stream
        </button>

        <a
          href={`https://live.parablestreaming.com/live/${stream.slug}`}
          target="_blank"
          className="px-6 py-3 bg-[#53fc18] text-black font-bold rounded"
        >
          View Live Page
        </a>
      </div>
    </div>
  );
}
