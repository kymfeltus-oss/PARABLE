"use client";

// FIX: Removed the extra '=' sign here
import { useState, useEffect } from "react"; 

// FIX: Use a named import for the createClient function
import { createClient } from "@/lib/supabaseClient"; 
import Navbar from "@/components/Navbar";
import { Upload, Radio } from "lucide-react";
import { useRouter } from "next/navigation"; // Added router import back in

export default function GoLiveSetupPage() {
  const router = useRouter(); // Initialize router

  // FIX: Instantiate the client by calling the createClient function
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Sermons");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ["Sermons", "Worship", "Music", "Gaming", "Encouragement", "Live Podcast"];

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    setCreatorId(userData.user.id);
  }

  async function uploadThumbnail() {
    if (!thumbnail || !creatorId) return "";

    const filePath = `live_thumbs/${creatorId}-${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from("thumbnails")
      .upload(filePath, thumbnail);

    if (error) {
      console.error(error);
      return "";
    }

    const url = supabase.storage.from("thumbnails").getPublicUrl(filePath).data.publicUrl;
    setThumbnailUrl(url);
    return url;
  }

  async function createStream() {
    if (!title || !creatorId) {
      alert("Please enter a title");
      return;
    }

    setLoading(true);

    let uploadedThumbUrl = thumbnailUrl;

    if (thumbnail && !uploadedThumbUrl) {
      uploadedThumbUrl = await uploadThumbnail();
    }

    const rtmpUrl = "rtmp://live.cloudflare.com";
    const streamKey = `cf_stream_${creatorId}_${Date.now()}`;

    const { error } = await supabase.from("live_streams").insert({
      creator_id: creatorId,
      title,
      category,
      thumbnail_url: uploadedThumbUrl,
      is_live: false,
      rtmp_url: rtmpUrl,
      stream_key: streamKey,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to create stream");
      return;
    }

    // Redirect to the preview page using Next.js router
    router.push("/creator/live/preview");
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-24 space-y-10">

        <h1 className="text-4xl font-black mb-6 drop-shadow-[0_0_12px_#53fc18]">
          Go Live Setup
        </h1>

        <div className="parable-card space-y-6">

          {/* TITLE */}
          <div>
            <label className="text-xs text-gray-400">Stream Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg bg-[#111] border border-white/10 text-sm"
              placeholder="Ex: Sunday Morning Service"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-xs text-gray-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg bg-[#111] border border-white/10 text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* THUMBNAIL */}
          <div>
            <label className="text-xs text-gray-400">Thumbnail</label>
            <div className="mt-2 flex flex-col gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                className="text-sm"
              />
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  className="w-full rounded-lg border border-white/10"
                />
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={createStream}
            disabled={loading}
            className="w-full bg-[#53fc18] text-black font-bold rounded-xl py-3 shadow-[0_0_12px_#53fc18] hover:brightness-110 transition"
          >
            {loading ? "Saving..." : "Continue to Live Preview"}
          </button>
        </div>

        {/* STREAM KEY PREVIEW */}
        <div className="mt-10">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#53fc18]" /> RTMP Ingest Information
          </h2>

          <p className="text-xs text-gray-400 mb-1">RTMP URL:</p>
          <p className="text-sm mb-3 select-all">rtmp://live.cloudflare.com</p>

          <p className="text-xs text-gray-400 mb-1">Stream Key:</p>
          <p className="text-sm select-all text-[#53fc18]">
            Generated after saving setup
          </p>
        </div>
      </main>
    </div>
  );
}
