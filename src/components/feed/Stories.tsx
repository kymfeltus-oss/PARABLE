"use client";

import { useEffect, useMemo, useState } from "react";
import FellowshipCircles, { type FellowshipSeed } from "./FellowshipCircles";
import { createClient } from "@/utils/supabase/client";
import {
  SIMULATION_PROFILE_USERNAMES,
  orderSimulationProfiles,
} from "@/lib/simulation-profiles";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_live?: boolean | null;
};

function rowsToSeeds(rows: ProfileRow[]): FellowshipSeed[] {
  return rows.map((p) => ({
    id: p.id,
    profileId: p.id,
    label: (p.full_name?.trim() || p.username?.replace(/_/g, " ").trim() || "Member"),
    imageUrl: p.avatar_url?.trim() || undefined,
    initials: (p.full_name || p.username || "M").slice(0, 2),
    isLive: p.is_live === true,
  }));
}

/**
 * Fellowship Circles — Sarah, James, and Michael (`sister_sarah`, `pastor_james`, `michael`).
 * Each circle links to `/profile/${id}`. `pastor_james` shows live ring + badge when `is_live` is true.
 */
export default function Stories() {
  const [seeds, setSeeds] = useState<FellowshipSeed[]>([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, is_live")
        .in("username", [...SIMULATION_PROFILE_USERNAMES]);

      if (cancelled) return;
      if (error) {
        console.error("Stories fellowship profiles:", error.message);
        setSeeds([]);
        return;
      }
      const ordered = orderSimulationProfiles((data ?? []) as ProfileRow[]);
      setSeeds(rowsToSeeds(ordered));
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel("fellowship-profiles-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const row = payload.new as { id?: string; is_live?: boolean; username?: string | null };
          const id = row.id;
          if (!id || typeof row.is_live !== "boolean") return;
          setSeeds((prev) =>
            prev.map((s) => {
              const pid = s.profileId ?? s.id;
              if (pid !== id) return s;
              return { ...s, isLive: row.is_live === true };
            }),
          );
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, []);

  return (
    <div className="my-3 w-full shrink-0 border-b border-neutral-900 bg-black pb-2 pt-1">
      <FellowshipCircles className="mb-0 px-3 py-3 sm:px-4 sm:py-4" seeds={seeds} />
    </div>
  );
}
