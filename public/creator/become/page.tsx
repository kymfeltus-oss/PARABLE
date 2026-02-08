"use client";

// UPDATED: Use a named import for the createClient function
import { createClient } from "@/lib/supabaseClient"; 
import { useState, useEffect } from "react";

export default function BecomeCreatorPage() {
  // Call the function inside the component to get the supabase client instance
  const supabase = createClient(); 

  const [userId, setUserId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    async function loadUser() {
      // Use the local 'supabase' constant here
      const { data: { user } } = await supabase.auth.getUser(); 
      if (user) setUserId(user.id);
    }
    loadUser();
  }, []); // Note: useEffect dependencies can be tricky with supabase instance, but this pattern is common for client components

  async function submit() {
    if (!userId || !selectedType) return;

    // Use the local 'supabase' constant here
    await supabase
      .from("profiles")
      .update({
        role: "creator",
        creator_type: selectedType,
      })
      .eq("id", userId);

    alert("You are now a creator!");
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Become a Creator</h1>

      <p className="mb-6 text-gray-300">
        Select what type of creator you want to be on Parable.
      </p>

      <div className="grid grid-cols-1 gap-4 max-w-md">
        <button
          onClick={() => setSelectedType("creator")}
          className={`p-4 rounded border ${
            selectedType === "creator" ? "border-violet-500" : "border-gray-700"
          }`}
        >
          General Creator
        </button>

        <button
          onClick={() => setSelectedType("musician")}
          className={`p-4 rounded border ${
            selectedType === "musician" ? "border-violet-500" : "border-gray-700"
          }`}
        >
          Musician / Artist
        </button>

        <button
          onClick={() => setSelectedType("streamer")}
          className={`p-4 rounded border ${
            selectedType === "streamer" ? "border-violet-500" : "border-gray-700"
          }`}
        >
          Live Streamer
        </button>

        <button
          onClick={() => setSelectedType("pastor")}
          className={`p-4 rounded border ${
            selectedType === "pastor" ? "border-violet-500" : "border-gray-700"
          }`}
        >
          Pastor / Ministry Leader
        </button>
      </div>

      <button
        onClick={submit}
        className="mt-6 px-6 py-2 bg-violet-600 rounded-lg hover:bg-violet-700"
      >
        Save and Continue
      </button>
    </div>
  );
}
