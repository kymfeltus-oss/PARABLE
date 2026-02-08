"use client";

import { useState } from "react";

const CATEGORIES = [
  "Sermon","Worship","Prayer","Teaching","Prophetic","Music","Podcast",
  "Talk Show","Gaming","Bible Study","Testimony","Youth Ministry",
  "Women's Ministry","Men's Ministry","Live Event","Conference","Q&A Session"
];

export default function GoLivePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoLive() {
    try {
      setLoading(true);
      setError("");

      let thumbnailUrl = "";

      // Upload thumbnail first
      if (thumbnail) {
        const form = new FormData();
        form.append("file", thumbnail);

        const uploadRes = await fetch(
          "https://api.parablestreaming.com/api/upload-thumbnail",
          { method: "POST", body: form }
        );
        const uploadJson = await uploadRes.json();

        if (!uploadJson.ok) throw new Error(uploadJson.error);
        thumbnailUrl = uploadJson.url;
      }

      // Create stream
      const res = await fetch(
        "https://api.parablestreaming.com/api/stream-live",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, category, thumbnailUrl })
        }
      );

      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      // Redirect to Stream Manager
      window.location.href = `/creator/stream/${json.streamId}`;

    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Go Live</h1>

      {error && (
        <div className="bg-red-900 text-red-300 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <label>Stream Title</label>
      <input
        className="w-full p-3 bg-[#111] rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Category</label>
      <select
        className="w-full p-3 bg-[#111] rounded mb-4"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <label>Thumbnail</label>
      <input
        type="file"
        className="w-full mb-6"
        onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleGoLive}
        disabled={loading}
        className="px-6 py-3 bg-[#53fc18] text-black font-bold rounded"
      >
        {loading ? "Starting…" : "Go Live"}
      </button>
    </div>
  );
}
