"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
// FIX: Change import from named export 'supabase' to named export 'createClient'
import { createClient } from "@/lib/supabaseClient"; 
import { Radio, Video } from "lucide-react";

type LiveStream = {
  id: string;
  title: string;
  category: string;
  thumbnail_url: string | null;
  rtmp_url: string | null;
  stream_key: string | null;
  cloudflare_input_id: string | null;
  is_live: boolean;
};

export default function BroadcastPage() {
  // FIX: Instantiate the client by calling the createClient function
  const supabase = createClient(); 
  
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingInput, setCreatingInput] = useState(false);

  useEffect(() => {
    loadStream();
  }, []);

  async function loadStream() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("live_streams")
      .select("*")
      .eq("creator_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setStream(data as LiveStream);
    }

    setLoading(false);
  }

  async function ensureCloudflareInput() {
    if (!stream || stream.cloudflare_input_id) return;

    setCreatingInput(true);

    const res = await fetch("/api/live/create-input", {
      method: "POST",
      body: JSON.stringify({ streamId: stream.id }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();
    setCreatingInput(false);

    if (!res.ok) {
      alert(json.error || "Failed to create Cloudflare input");
      return;
    }

    if (json.stream) {
      setStream(json.stream);
    }
  }

  async function endStream() {
    if (!stream) return;

    const { error } = await supabase
      .from("live_streams")
      .update({ is_live: false })
      .eq("id", stream.id);

    if (error) {
      alert("Failed to end stream");
      return;
    }

    alert("Stream ended");
    await loadStream();
  }

  useEffect(() => {
    if (stream && !stream.cloudflare_input_id) {
      ensureCloudflareInput();
    }
  }, [stream]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pb-24">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 pt-24">
          <p className="text-gray-400 text-sm">Loading broadcast...</p>
        </main>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-black text-white pb-24">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 pt-24">
          <p className="text-gray-400 text-sm">
            No live stream configuration found. Go through Go Live Setup first.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-24 space-y-12">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <Radio className="w-6 h-6 text-[#53fc18]" />
              Live Broadcast
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {stream.title} • {stream.category}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">Status</p>
            <p className="text-sm font-bold text-[#53fc18]">
              {stream.is_live ? "LIVE" : "Ready"}
            </p>
          </div>
        </header>

        {/* VIDEO PLAYER */}
        <section className="space-y-3">
          <div className="aspect-video bg-black border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
            {stream.cloudflare_input_id ? (
              <iframe
                src={`https://iframe.videodelivery.net/${stream.cloudflare_input_id}`}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <p className="text-gray-500 text-sm">
                Creating Cloudflare live input...
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Once you start streaming from your encoder, your live video will appear here.
          </p>
        </section>

        {/* ENCODER INFO */}
        <section className="parable-card space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Video className="w-5 h-5 text-[#53fc18]" /> Encoder Settings
          </h2>

          <div>
            <p className="text-xs text-gray-400">RTMP URL</p>
            <p className="text-sm select-all">
              {stream.rtmp_url || "Waiting on Cloudflare configuration"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Stream Key</p>
            <p className="text-sm select-all text-[#53fc18]">
              {stream.stream_key || "Waiting on Cloudflare configuration"}
            </p>
          </div>

          <p className="text-[11px] text-gray-500">
            Paste the RTMP URL and Stream Key into OBS, Ecamm, Restream, or your encoder.
          </p>
        </section>

        {/* ACTIONS */}
        <section className="flex items-center justify-between gap-4">
          <button
            onClick={endStream}
            className="px-5 py-2 rounded-full text-xs font-bold bg-red-600 hover:bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
          >
            End Stream
          </button>

          {creatingInput && (
            <p className="text-xs text-gray-400">Creating Cloudflare input...</p>
          )}
        </section>
      </main>
    </div>
  );
}
