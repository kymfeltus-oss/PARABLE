"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

type Row = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type PostLite = {
  id: string;
  media_url: string | null;
  content: string | null;
  created_at: string | null;
};

export default function ProfileByUserIdPage() {
  const params = useParams();
  const router = useRouter();
  const userId = String((params as { userId?: string })?.userId ?? "");
  const { userProfile, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Row | null>(null);
  const [posts, setPosts] = useState<PostLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwn = Boolean(userProfile?.id && userId && userProfile.id === userId);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data: p, error: pErr } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, role")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (pErr || !p) {
        setNotFound(true);
        setProfile(null);
        setPosts([]);
        setLoading(false);
        return;
      }
      setProfile(p as Row);
      const { data: grid } = await supabase
        .from("posts")
        .select("id, media_url, content, created_at")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);
      if (!cancelled) {
        setPosts((grid ?? []) as PostLite[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-black text-neutral-500">
        Loading…
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-black px-4 text-center">
        <p className="text-neutral-400">Profile not found.</p>
        <button
          type="button"
          onClick={() => router.push("/my-sanctuary")}
          className="text-sm font-semibold text-[#00f2ff] hover:underline"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const displayName = profile.username || profile.full_name || "Member";
  const handle = profile.username || displayName;

  return (
    <div className="min-h-full bg-[#050506] pb-parable-bottom text-white">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/90 px-3 py-3 backdrop-blur-md">
        <button type="button" onClick={() => router.back()} className="text-sm text-[#00f2ff]">
          ← Back
        </button>
        {isOwn ? (
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/5"
          >
            <Settings className="h-3.5 w-3.5" />
            Edit
          </Link>
        ) : (
          <span className="text-[10px] text-neutral-500">Profile</span>
        )}
      </header>

      <div className="mx-auto max-w-[470px] px-4 pt-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 bg-neutral-900">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
                onError={fallbackAvatarOnError}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-neutral-500">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-sm text-neutral-500">@{handle}</p>
            {profile.role ? (
              <p className="mt-2 text-xs text-neutral-400">{profile.role}</p>
            ) : null}
          </div>
        </div>

        <h2 className="mt-10 border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Posts
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-1 sm:gap-2">
          {posts.length === 0 ? (
            <p className="col-span-3 py-8 text-center text-sm text-neutral-500">No posts yet.</p>
          ) : (
            posts.map((p) => (
              <Link
                key={p.id}
                href={`/sanctuary/${p.id}`}
                className="relative aspect-square overflow-hidden rounded-md bg-neutral-900"
              >
                {p.media_url ? (
                  /\.(mp4|webm|mov)(\?|$)/i.test(p.media_url.split("?")[0] ?? "") ? (
                    <video src={p.media_url} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.media_url} alt="" className="h-full w-full object-cover" />
                  )
                ) : (
                  <div className="flex h-full items-center p-1 text-center text-[10px] text-neutral-500">
                    {(p.content ?? "").slice(0, 40)}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
