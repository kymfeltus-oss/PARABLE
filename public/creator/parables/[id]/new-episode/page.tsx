"use client";

import { useState, useEffect } from "react";
// FIX: Change import from named export 'supabase' to named export 'createClient'
import { createClient } from "@/lib/supabaseClient"; 
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from "next/navigation";

export default function NewEpisodePage() {
  // FIX: Instantiate the client by calling the createClient function
  const supabase = createClient();

  const params = useParams();
  const parableId = params.id;
  const router = useRouter();

  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const uid = userData.user.id;

    const { data } = await supabase
      .from("creator_videos")
      .select("*")
      .eq("creator_id", uid)
      .order("created_at", { ascending: false });

    setVideos(data || []);
  }

  async function createEpisode() {
    if (!selectedVideo) return alert("Select a video.");
    if (!title.trim()) return alert("Episode title required.");
    if (!episodeNumber) return alert("Episode number required.");

    setLoading(true);

    const { error } = await supabase.from("episodes").insert({
      parable_id: parableId,
      cf_video_id: selectedVideo,
      title,
      description,
      episode_number: Number(episodeNumber),
    });

    if (error) {
      console.error(error);
      alert("Error saving episode");
      setLoading(false);
      return;
    }

    router.push(`/creator/parables/${parableId}`);
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-24 space-y-8">

        {/* Header */}
        <section>
          <h1 className="text-3xl font-extrabold">Add Episode</h1>
          <p className="text-xs text-gray-400 mt-1">
            Upload an episode to your Parable series.
          </p>
        </section>

        {/* Form */}
        <section className="bg-[#111] p-6 rounded-2xl border border-white/10 space-y-5">

          {/* Video Selection */}
          <div>
            <label className="text-xs text-gray-400">Choose Uploaded Video</label>
            <select
              className="mt-1 w-full bg-black border border-white/10 rounded-lg p-3 text-sm"
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
            >
              <option value="">Select a video</option>
              {videos.map((v) => (
                <option key={v.id} value={v.cf_video_id}>
                  {v.title} (ID {v.cf_video_id})
                </option>
              ))}
            </select>
          </div>

          {/* Episode Title */}
          <div>
            <label className="text-xs text-gray-400">Episode Title</label>
            <input
              className="mt-1 w-full bg-black border border-white/10 rounded-lg p-3 text-sm"
              placeholder="Example Faith plus Obedience Episode One"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Episode Number */}
          <div>
            <label className="text-xs text-gray-400">Episode Number</label>
            <input
              className="mt-1 w-full bg-black border border-white/10 rounded-lg p-3 text-sm"
              type="number"
              placeholder="1"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-400">Description</label>
            <textarea
              className="mt-1 w-full bg-black border border-white/10 rounded-lg p-3 text-sm"
              rows={4}
              placeholder="Short description of this episode"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            onClick={createEpisode}
            disabled={loading}
            className="
              w-full bg-violet-600 hover:bg-violet-700
              text-sm font-bold rounded-lg py-3
              disabled:opacity-50
            "
          >
            {loading ? "Saving..." : "Save Episode"}
          </button>

        </section>
      </main>
    </div>
  );
}
