"use client";

import { useEffect, useState } from "react";
// FIX: Change import from named export 'supabase' to named export 'createClient'
import { createClient } from "@/lib/supabaseClient"; 

type CreatorVideo = {
  id: number;
  title: string | null;
  description: string | null;
  cf_video_id: string | null;
  created_at: string;
  status: string | null;
};

export default function CreatorUploadsPage() {
  // FIX: Instantiate the client by calling the createClient function
  const supabase = createClient(); 

  const [profileId, setProfileId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videos, setVideos] = useState<CreatorVideo[]>([]);

  useEffect(() => {
    loadProfileAndVideos();
  }, []);

  async function loadProfileAndVideos() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (!profile) return;

    setProfileId(profile.id);

    const { data: vids } = await supabase
      .from("creator_videos")
      .select("*")
      .eq("creator_id", profile.id)
      .order("created_at", { ascending: false });

    setVideos(vids || []);
  }

  async function handleUpload() {
    if (!profileId) {
      alert("No profile found");
      return;
    }
    if (!file) {
      alert("Select a video file first");
      return;
    }
    if (!title.trim()) {
      alert("Enter a title");
      return;
    }

    try {
      setUploading(true);

      // step one get direct upload URL from our API route
      const res = await fetch("/api/creator/videos/direct-upload", {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok) {
        console.error(json);
        alert("Failed to create upload URL");
        setUploading(false);
        return;
      }

      const { uploadURL, uid } = json;

      // step two upload file to Cloudflare Stream
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
      });

      if (!uploadRes.ok) {
        alert("Cloudflare upload failed");
        setUploading(false);
        return;
      }

      // step three save metadata in Supabase
      const { error } = await supabase.from("creator_videos").insert({
        creator_id: profileId,
        title,
        description,
        cf_video_id: uid,
        status: "processing",
      });

      if (error) {
        console.error(error);
        alert("Failed to save video record");
      } else {
        alert("Video uploaded");
        setTitle("");
        setDescription("");
        setFile(null);
        await loadProfileAndVideos();
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-4">Creator Uploads</h1>
      <p className="text-xs text-gray-400 mb-6">
        Upload Parables, sermons, or episodes to Cloudflare Stream. Then use them across
        your Parable series and streams.
      </p>

      <div className="bg-[#111] p-5 rounded-2xl border border-white/10 mb-10 space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Title</label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example Faith plus Obedience Episode One"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Description</label>
          <textarea
            className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-sm"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of this Parable or stream"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Video file</label>
          <input
            type="file"
            accept="video/*"
            className="text-xs"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
          />
          {file && (
            <p className="text-[11px] text-gray-400 mt-1">
              Selected {file.name}
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-6 py-2 bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 text-sm"
        >
          {uploading ? "Uploading..." : "Upload to Cloudflare Stream"}
        </button>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Your uploads</h2>

        {videos.length === 0 && (
          <p className="text-xs text-gray-500">
            No videos uploaded yet. Your Parable library will appear here.
          </p>
        )}

        <div className="space-y-3">
          {videos.map((v) => (
            <div
              key={v.id}
              className="bg-[#111] p-4 rounded-2xl border border-white/10 text-sm"
            >
              <p className="font-semibold">{v.title}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Cloudflare id {v.cf_video_id}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Status {v.status} created {new Date(v.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
