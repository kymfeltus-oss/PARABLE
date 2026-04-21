"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

type FollowProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_live: boolean | null;
};

type Props = {
  className?: string;
};

/**
 * Left rail — followed creators with Twitch-style LIVE ring (`is_live`).
 */
export default function StreamersFollowSidebar({ className = "" }: Props) {
  const [rows, setRows] = useState<FollowProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("follows")
      .select(
        `
        following_id,
        profiles:following_id ( id, username, full_name, avatar_url, is_live )
      `,
      )
      .eq("follower_id", user.id);

    if (error) {
      console.error("StreamersFollowSidebar:", error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const out: FollowProfile[] = [];
    for (const row of data ?? []) {
      const raw = (row as { profiles?: FollowProfile | FollowProfile[] }).profiles;
      const p = Array.isArray(raw) ? raw[0] : raw;
      if (p?.id)
        out.push({
          id: p.id,
          username: p.username ?? null,
          full_name: p.full_name ?? null,
          avatar_url: p.avatar_url ?? null,
          is_live: typeof p.is_live === "boolean" ? p.is_live : null,
        });
    }
    setRows(out);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel("streamers-follow-sidebar-profiles")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => {
          void load();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [load]);

  return (
    <aside
      className={[
        "parable-live-surface flex w-full flex-col rounded-xl shadow-xl shadow-black/40 xl:sticky xl:top-[5.5rem] xl:max-h-[calc(100vh-7rem)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="border-b border-white/[0.06] px-3 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Following</p>
        <h2 className="mt-1 text-sm font-bold text-white">Followed streamers</h2>
      </div>

      <div className="scrollbar-hide flex max-h-[420px] flex-1 flex-col gap-1 overflow-y-auto px-2 py-2 xl:max-h-none">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#00f2ff]/60" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg px-2 py-8 text-center text-xs text-white/40">
            <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
            Follow creators from profiles or Sanctuary — they&apos;ll show up here.
          </div>
        ) : (
          rows.map((p) => {
            const label = p.username?.trim() || p.full_name?.trim() || "Streamer";
            const live = p.is_live === true;
            return (
              <Link
                key={p.id}
                href={`/stream/${p.id}`}
                className="group flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-white/[0.05]"
              >
                <div
                  className={[
                    "relative h-10 w-10 shrink-0 rounded-full p-[2px]",
                    live
                      ? "animate-pulse bg-red-600 shadow-[0_0_14px_rgba(239,68,68,0.75)]"
                      : "bg-white/10",
                  ].join(" ")}
                >
                  <div className="h-full w-full overflow-hidden rounded-full bg-zinc-900 ring-2 ring-[#0e0e10]">
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={fallbackAvatarOnError}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/50">
                        {label.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white group-hover:text-[#00f2ff]">{label}</p>
                  {live ? (
                    <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">Live</p>
                  ) : (
                    <p className="text-[10px] text-white/35">Offline</p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
