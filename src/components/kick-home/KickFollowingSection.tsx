"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
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
  collapsed: boolean;
};

export default function KickFollowingSection({ collapsed }: Props) {
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
      console.error("KickFollowingSection:", error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const out: FollowProfile[] = [];
    for (const row of data ?? []) {
      const raw = (row as { profiles?: FollowProfile | FollowProfile[] }).profiles;
      const p = Array.isArray(raw) ? raw[0] : raw;
      if (p?.id) {
        out.push({
          id: p.id,
          username: p.username ?? null,
          full_name: p.full_name ?? null,
          avatar_url: p.avatar_url ?? null,
          is_live: typeof p.is_live === "boolean" ? p.is_live : null,
        });
      }
    }
    setRows(out);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!collapsed) {
    return (
      <div className="mb-3 w-full shrink-0 border-b border-[#24272c] pb-3" data-testid="stream-following-section">
        <p className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-widest text-[#64748b]">
          Following
        </p>
        <div className="flex max-h-[220px] flex-col gap-0.5 overflow-y-auto custom-scrollbar px-1">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#00f2fe]/60" />
            </div>
          ) : rows.length === 0 ? (
            <p className="px-3 py-4 text-center text-[10px] text-[#64748b]">
              Follow creators to see them here.
            </p>
          ) : (
            rows.map((p) => {
              const label = p.username?.trim() || p.full_name?.trim() || "Streamer";
              const live = p.is_live === true;
              return (
                <Link
                  key={p.id}
                  href={`/watch/${p.id}`}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-[#24272c]"
                >
                  <div
                    className={[
                      "relative h-8 w-8 shrink-0 rounded-full p-[2px]",
                      live ? "bg-red-600" : "bg-transparent",
                    ].join(" ")}
                  >
                    <div className="h-full w-full overflow-hidden rounded-full bg-[#24272c]">
                      {p.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.avatar_url}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={fallbackAvatarOnError}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-[#64748b]">
                          {label.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {live ? (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded bg-red-600 px-1 text-[7px] font-black uppercase text-white">
                        Live
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{label}</p>
                    <p className="text-[10px] text-[#64748b]">{live ? "Live now" : "Offline"}</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (loading || rows.length === 0) {
    return collapsed ? <div className="mb-2 border-b border-[#24272c]" aria-hidden /> : null;
  }

  return (
    <div className="mb-2 flex flex-col items-center gap-2 border-b border-[#24272c] pb-2">
      {rows.slice(0, 6).map((p) => {
        const label = p.username?.trim() || p.full_name?.trim() || "?";
        const live = p.is_live === true;
        return (
          <Link
            key={p.id}
            href={`/watch/${p.id}`}
            title={label}
            className={[
              "relative h-9 w-9 shrink-0 rounded-full p-[2px]",
              live ? "bg-red-600" : "bg-transparent",
            ].join(" ")}
          >
            <div className="h-full w-full overflow-hidden rounded-full bg-[#24272c]">
              {p.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={fallbackAvatarOnError}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-[#64748b]">
                  {label.slice(0, 1)}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
