"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Radio } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { getDemoPersonaById } from "@/lib/demo-personas";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_live?: boolean | null;
};

export default function StreamViewerPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = String((params as { streamId?: string }).streamId ?? "");
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!streamId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const demo = getDemoPersonaById(streamId);
      if (demo) {
        if (!cancelled) {
          setProfile({
            id: demo.id,
            username: demo.username,
            full_name: demo.full_name,
            avatar_url: demo.avatar_url,
            is_live: demo.is_live,
          });
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, is_live")
        .eq("id", streamId)
        .maybeSingle();

      if (!cancelled) {
        setProfile((data as ProfileRow | null) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [streamId, supabase]);

  const displayName = profile?.full_name?.trim() || profile?.username?.trim() || "Broadcaster";

  return (
    <div className="flex min-h-screen flex-col bg-[#01040A] text-[#F8FAFC]">
      <header className="flex items-center gap-3 border-b border-[#06111E] px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full p-2 text-[#94A3B8] hover:bg-[#06111E] hover:text-[#F8FAFC]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
              onError={fallbackAvatarOnError}
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="flex items-center gap-1 text-[11px] text-[#00F2FE]">
              <Radio className="h-3 w-3 animate-pulse" />
              Live broadcast
            </p>
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center bg-[#020712] p-6">
        {loading ? (
          <p className="text-sm text-[#94A3B8]">Connecting to stream…</p>
        ) : (
          <>
            <div className="mb-6 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-[#00F2FE]/30 bg-[#06111E] shadow-[0_0_40px_rgba(0,242,254,0.12)]">
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="rounded-full bg-[#00F2FE]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#00F2FE]">
                  Live now
                </span>
                <p className="text-lg font-bold">{displayName}</p>
                <p className="max-w-md text-sm text-[#94A3B8]">
                  Sanctuary live room for stream <span className="font-mono text-[#CBD5E1]">{streamId.slice(0, 8)}…</span>
                </p>
              </div>
            </div>
            <Link
              href="/live-studio"
              className="rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#01040A]"
            >
              Open in Live Studio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
