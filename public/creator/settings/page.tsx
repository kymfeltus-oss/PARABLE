"use client";

import Navbar from "@/components/Navbar";

export default function CreatorSettings() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-10 space-y-8">

        <h1 className="text-3xl font-black mb-2">Creator Settings</h1>
        <p className="text-gray-400 mb-6">Update your creator profile, banner, avatar, and preferences.</p>

        <div className="space-y-8 bg-[#111] border border-white/10 p-8 rounded-2xl">

          <div>
            <label className="text-xs uppercase text-gray-400 font-bold mb-2 block">Display Name</label>
            <input className="bg-black border border-white/20 rounded-lg w-full px-4 py-2" placeholder="Your Name" />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-bold mb-2 block">Bio</label>
            <textarea className="bg-black border border-white/20 rounded-lg w-full p-4" rows={4} placeholder="Tell your followers about your ministry..."></textarea>
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-bold mb-2 block">Avatar Image URL</label>
            <input className="bg-black border border-white/20 rounded-lg w-full px-4 py-2" placeholder="https://..." />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-bold mb-2 block">Banner Image URL</label>
            <input className="bg-black border border-white/20 rounded-lg w-full px-4 py-2" placeholder="https://..." />
          </div>

          <button className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-lg">
            Save Changes
          </button>

        </div>

      </main>
    </div>
  );
}
