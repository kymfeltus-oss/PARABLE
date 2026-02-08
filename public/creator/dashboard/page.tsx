"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import {
  Radio,
  Upload,
  Pencil,
  UserRound,
  BarChart3,
  Activity
} from "lucide-react";

type Profile = {
  display_name?: string | null;
  ministry_name?: string | null;
  creator_category?: string | null;
  avatar_url?: string | null;
  onboarding_complete?: boolean | null;
};

export default function CreatorDashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: p } = await supabase
        .from("profiles")
        .select("display_name,ministry_name,creator_category,avatar_url,onboarding_complete")
        .eq("id", user.id)
        .maybeSingle();

      setProfile((p as Profile) || null);
      setLoading(false);
    }

    load();
  }, [supabase]);

  const displayName =
    profile?.display_name || profile?.ministry_name || "Creator";
  const subtitleParts = [
    profile?.ministry_name ? profile.ministry_name : null,
    profile?.creator_category ? profile.creator_category : null
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-black border border-white/15 overflow-hidden flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserRound className="w-7 h-7 text-gray-500" />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-extrabold neon-text">
                {displayName}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                {subtitleParts.length > 0 ? subtitleParts.join(" • ") : "Creator dashboard"}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {profile?.onboarding_complete ? "Profile complete • Ready to go live" : "Complete setup to unlock all tools"}
              </p>
            </div>
          </div>

          {/* Secondary actions */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/profile-setup/creator"
              className="px-4 py-2 rounded-lg bg-black border border-white/15 text-xs hover:border-white/25 transition inline-flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit profile
            </Link>

            <Link
              href="/creator/ministry"
              className="px-4 py-2 rounded-lg bg-black border border-white/15 text-xs hover:border-white/25 transition inline-flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              View ministry hub
            </Link>
          </div>
        </div>

        {/* Hero: Go Live */}
        <div className="mt-10 bg-[#111] border border-white/10 rounded-2xl p-8 shadow-[0_0_30px_rgba(83,252,24,0.18)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-xl font-extrabold mb-2">
                Go live now
              </h2>
              <p className="text-sm text-gray-400 max-w-xl">
                Start a live stream and connect with your audience in real time.
                Build community, encourage viewers, and grow your reach.
              </p>
              {loading && (
                <p className="text-xs text-gray-500 mt-2">
                  Loading your creator profile…
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/creator/go-live"
                className="neon-button inline-flex items-center justify-center gap-2 text-sm"
              >
                <Radio className="w-4 h-4" />
                Go Live
              </Link>

              <Link
                href="/creator/messages"
                className="px-5 py-3 rounded-lg bg-black border border-white/15 text-sm font-semibold hover:border-white/25 transition inline-flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload message
              </Link>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Followers" value="0" />
          <StatCard title="Total views" value="0" />
          <StatCard title="Streams" value="0" />
          <StatCard title="Messages" value="0" />
        </div>

        {/* Recent activity */}
        <div className="mt-10 bg-[#111] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-300">
              Recent activity
            </h3>
            <BarChart3 className="w-4 h-4 text-gray-500" />
          </div>

          <div className="mt-4 space-y-3 text-sm text-gray-400">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>Last stream</span>
              <span className="text-gray-500">None yet</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>Last upload</span>
              <span className="text-gray-500">None yet</span>
            </div>
            <div className="flex items-center justify-between">
              <span>New followers</span>
              <span className="text-gray-500">0</span>
            </div>
          </div>
        </div>

        {/* Secondary tools */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToolCard
            title="Monetization"
            description="Set up offerings, support options, and future subscriptions."
            href="/monetization"
            badge="Coming soon"
          />
          <ToolCard
            title="Analytics"
            description="Track views, watch time, engagement, and growth trends."
            href="/tools"
            badge="Coming soon"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">
        {title}
      </p>
      <p className="text-3xl font-extrabold mt-2">
        {value}
      </p>
    </div>
  );
}

function ToolCard({
  title,
  description,
  href,
  badge
}: {
  title: string;
  description: string;
  href: string;
  badge: string;
}) {
  return (
    <Link
      href={href}
      className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition block"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-extrabold mb-2">{title}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded bg-black border border-white/10 text-gray-400">
          {badge}
        </span>
      </div>
    </Link>
  );
}
