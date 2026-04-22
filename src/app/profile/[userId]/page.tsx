"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Settings, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import HubBackground from "@/components/HubBackground";

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
      <div className="relative min-h-[50vh] overflow-hidden bg-[#030306] pb-parable-bottom">
        <div className="fixed inset-0 z-0">
          <HubBackground />
        </div>
        <div className="relative z-10 flex min-h-[50vh] flex-col items-center justify-center gap-4 text-white/40">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00f2ff]/30 border-t-[#00f2ff]" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00f2ff]/60">Loading profile</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="relative flex min-h-[50vh] flex-col items-center justify-center gap-4 overflow-hidden bg-[#030306] px-4 text-center">
        <div className="fixed inset-0 z-0">
          <HubBackground />
        </div>
        <div className="relative z-10 max-w-sm rounded-2xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#00f2ff]/60" />
          <p className="text-sm text-white/60">Profile not found.</p>
          <button
            type="button"
            onClick={() => router.push("/my-sanctuary")}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#00f2ff] to-cyan-400 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_24px_rgba(0,242,255,0.25)]"
          >
            Back to Sanctuary
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile.username || profile.full_name || "Member";
  const handle = profile.username || displayName;

  return (
    <div className="relative min-h-full overflow-hidden bg-[#030306] pb-parable-bottom text-white selection:bg-[#00f2ff]/25">
      <div className="fixed inset-0 z-0">
        <HubBackground />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#00f2ff]/[0.05] via-transparent to-black/90" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,242,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.12)_1px,transparent_1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.08] bg-black/70 px-4 py-3.5 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/70 transition hover:border-[#00f2ff]/35 hover:text-[#00f2ff]"
        >
          <ArrowLeft size={16} className="text-[#00f2ff]" />
          Back
        </button>
        {isOwn ? (
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-[#00f2ff]/35 bg-[#00f2ff]/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#00f2ff] transition hover:bg-[#00f2ff]/20"
          >
            <Settings className="h-3.5 w-3.5" />
            Edit
          </Link>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">Public profile</span>
        )}
      </header>

      <div className="relative z-10 mx-auto max-w-lg px-4 pb-12 pt-6 sm:max-w-xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black/45 p-8 shadow-[0_0_60px_rgba(0,242,255,0.08)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#00f2ff]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-5 text-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#00f2ff]/50 to-fuchsia-500/30 opacity-80 blur-md" />
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[#030306] bg-black/80 shadow-[0_0_40px_rgba(0,242,255,0.2)]">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={fallbackAvatarOnError}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#00f2ff]/20 to-black text-2xl font-black text-[#00f2ff]">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#00f2ff]/70">Sanctuary member</p>
              <h1 className="mt-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 font-mono text-sm text-[#00f2ff]/80">@{handle}</p>
              {profile.role ? (
                <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60">
                  {profile.role}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <h2 className="mt-10 flex items-center gap-2 border-b border-white/[0.08] pb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#00f2ff]/90">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]" />
          Posts
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
          {posts.length === 0 ? (
            <p className="col-span-3 rounded-2xl border border-dashed border-[#00f2ff]/25 bg-[#00f2ff]/[0.03] py-12 text-center text-sm text-white/45">
              No posts yet.
            </p>
          ) : (
            posts.map((p) => (
              <Link
                key={p.id}
                href={`/sanctuary/${p.id}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-black/50 transition hover:border-[#00f2ff]/40 hover:shadow-[0_0_20px_rgba(0,242,255,0.12)]"
              >
                {p.media_url ? (
                  /\.(mp4|webm|mov)(\?|$)/i.test(p.media_url.split("?")[0] ?? "") ? (
                    <video src={p.media_url} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.media_url} alt="" className="h-full w-full object-cover" />
                  )
                ) : (
                  <div className="flex h-full items-center p-1 text-center text-[10px] text-white/35">
                    {(p.content ?? "").slice(0, 40)}
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
