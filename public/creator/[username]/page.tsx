"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  ministry_name: string | null;
  creator_category: string | null;
  social_links: string | null;
  slug: string | null;
};

type Stream = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  replay_url: string | null;
  slug: string | null;
  is_live: boolean;
  started_at: string | null;
  creator_id: string;
  category: string | null;
};

export default function CreatorChannelPage({ params }: any) {
  const supabase = createClient();
  const username = params.username;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Logged-in viewer
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setViewerId(user?.id || null);

      // Load creator profile
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (!profileRow) {
        setError("Creator not found");
        return;
      }

      setProfile(profileRow);

      // Load all creator streams
      const { data: streamRows } = await supabase
        .from("live_streams")
        .select("*")
        .eq("creator_id", profileRow.id)
        .order("started_at", { ascending: false });

      setStreams(streamRows || []);

      // Check if current viewer follows creator
      if (user) {
        const { data: followRow } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", user.id)
          .eq("creator_id", profileRow.id)
          .maybeSingle();

        setIsFollowing(!!followRow);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function followCreator() {
    if (!viewerId || !profile) return;

    await fetch("https://api.parablestreaming.com/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId: profile.id }),
    });

    setIsFollowing(true);
  }

  async function unfollowCreator() {
    if (!viewerId || !profile) return;

    await fetch("https://api.parablestreaming.com/api/unfollow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId: profile.id }),
    });

    setIsFollowing(false);
  }

  if (error)
    return (
      <div className="min-h-screen bg-black text-white p-6 text-center">
        {error}
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-black text-white p-6 text-center">
        Loading…
      </div>
    );

  const liveStream = streams.find((s) => s.is_live);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-24 h-24 rounded-full overflow-hidden border border-white/20 bg-[#111]">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl">
              ?
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{profile.display_name}</h1>
          {profile.ministry_name && (
            <p className="text-gray-400">{profile.ministry_name}</p>
          )}
          {profile.creator_category && (
            <p className="text-xs text-[#53fc18] mt-1">
              {profile.creator_category}
            </p>
          )}
        </div>

        {viewerId && viewerId !== profile.id && (
          <button
            onClick={isFollowing ? unfollowCreator : followCreator}
            className={`ml-auto px-4 py-2 rounded-lg font-bold ${
              isFollowing
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#53fc18] text-black hover:brightness-110"
            }`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {/* BIO */}
      {profile.bio && (
        <p className="text-gray-300 mb-10 max-w-2xl">{profile.bio}</p>
      )}

      {/* LIVE NOW */}
      {liveStream && (
        <>
          <h2 className="text-2xl font-bold text-[#53fc18] mb-4">Live Now 🔴</h2>
          <a
            href={`https://live.parablestreaming.com/live/${liveStream.slug}`}
            className="block max-w-xl mb-12"
          >
            <img
              src={liveStream.thumbnail_url || "/placeholder.jpg"}
              className="w-full h-60 object-cover rounded-lg border border-white/10"
            />
            <h3 className="text-xl font-bold mt-2">{liveStream.title}</h3>
          </a>
        </>
      )}

      {/* REPLAYS */}
      <h2 className="text-xl font-bold mb-4">Replays</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
        {streams
          .filter((s) => s.replay_url)
          .map((s) => (
            <a key={s.id} href={`/replay/${s.id}`} className="block">
              <img
                src={s.thumbnail_url || "/placeholder.jpg"}
                className="w-full h-40 object-cover rounded-lg border border-white/10"
              />
              <p className="mt-2 font-bold">{s.title}</p>
            </a>
          ))}
      </div>
    </div>
  );
}
