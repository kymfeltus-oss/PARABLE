"use client";

import { useState } from "react";
// FIX: Change import from named export 'supabase' to named export 'createClient'
import { createClient } from "@/lib/supabaseClient"; 
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function NewSeriesPage() {
  const router = useRouter();
  // FIX: Instantiate the client by calling the createClient function
  const supabase = createClient(); 

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function createSeries() {
    if (!title.trim()) {
      alert("Series title required");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const creatorId = userData.user?.id;

    if (!creatorId) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("parables").insert({
      creator_id: creatorId,
      title,
      description
    });

    if (error) {
      console.error(error);
      alert("Error creating series");
      setLoading(false);
      return;
    }

    router.push("/creator/parables/dashboard");
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-24 space-y-8">

        {/* Header */}
        <section>
          <h1 className="text-3xl font-extrabold">Create New Series</h1>
          <p className="text-xs text-gray-400 mt-1">
            Build your first Parable series. Add episodes later.
          </p>
        </section>

        {/* Form */}
        <section className="bg-[#111] p-6 rounded-2xl border border-white/10 space-y-5">

          {/* Title Field */}
          <div>
            <label className="text-xs text-gray-400">Series Title</label>
            <input
              className="mt-1 w-full bg-black border border-white/10 rounded-lg p-3 text-sm"
              placeholder="Example Faith and Obedience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="text-xs text-gray-400">Description</label>
            <textarea
              className="mt-1 w-full bg-black border border-white/10 rounded-lg p-3 text-sm"
              rows={4}
              placeholder="Short description of this Parable series"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            onClick={createSeries}
            disabled={loading}
            className="
              w-full bg-violet-600 hover:bg-violet-700
              text-sm font-bold rounded-lg py-3
              disabled:opacity-50
            "
          >
            {loading ? "Saving..." : "Create Series"}
          </button>
        </section>
      </main>
    </div>
  );
}
