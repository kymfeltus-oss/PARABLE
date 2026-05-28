"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import StreamCard from "@/components/kick-home/StreamCard";
import { createClient } from "@/utils/supabase/client";
import {
  fetchCategoryBySlug,
  formatCategoryLabel,
  profileRowToStreamerRecord,
  type ProfileDiscoveryRow,
  type StreamCategoryRow,
} from "@/lib/categories";
import { streamerToCardData } from "@/lib/kick-home-data";
import { getAllStreamersDemoRecords } from "@/lib/streamers-demo-simulation";
import type { StreamerProfileRecord } from "@/lib/streamers-types";

export default function CategoryBrowsePage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug =
    typeof rawSlug === "string" ? rawSlug : Array.isArray(rawSlug) && rawSlug[0] ? rawSlug[0] : "";

  const supabase = useMemo(() => createClient(), []);
  const [category, setCategory] = useState<StreamCategoryRow | null>(null);
  const [streamers, setStreamers] = useState<StreamerProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const cat = await fetchCategoryBySlug(supabase, slug);
        if (!cat) {
          if (!cancelled) {
            setCategory(null);
            setStreamers([]);
            setLoadError("Category not found.");
          }
          return;
        }

        const { data: profileRows, error: profilesError } = await supabase
          .from("profiles")
          .select(
            "id, username, avatar_url, viewer_count, current_category, is_live, stream_title",
          )
          .eq("category_id", cat.id)
          .eq("is_live", true)
          .gte("viewer_count", 0)
          .order("viewer_count", { ascending: false });

        if (profilesError) {
          console.warn("category browse profiles:", profilesError.message);
        }

        let mapped = (profileRows ?? []).map((row) =>
          profileRowToStreamerRecord(row as ProfileDiscoveryRow),
        );

        if (mapped.length === 0) {
          const demo = getAllStreamersDemoRecords().filter(
            (s) =>
              s.status === "live" &&
              s.liveCategory.toLowerCase().includes(cat.name.toLowerCase().split(" ")[0] ?? ""),
          );
          mapped = demo.length > 0 ? demo : getAllStreamersDemoRecords().filter((s) => s.status === "live").slice(0, 6);
        }

        if (!cancelled) {
          setCategory(cat);
          setStreamers(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load category.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, supabase]);

  const cards = useMemo(() => streamers.map((s) => streamerToCardData(s)), [streamers]);

  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0e11] text-slate-400">
        Invalid category.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] font-inter text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Link
          href="/streamers"
          className="mb-4 inline-flex items-center gap-2 text-xs text-white/50 hover:text-[#00f2fe]"
        >
          <ArrowLeft size={14} />
          Back to streamers
        </Link>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            Loading category…
          </div>
        ) : loadError || !category ? (
          <div className="rounded-xl border border-[#24272c] bg-[#191b1f] px-6 py-12 text-center">
            <p className="text-sm text-[#94a3b8]">{loadError ?? "Category not found."}</p>
          </div>
        ) : (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {formatCategoryLabel(category)}
              </h1>
              <p className="mt-1 text-sm text-[#64748b]">
                {streamers.length} live {streamers.length === 1 ? "channel" : "channels"} · sorted by viewers
              </p>
            </header>

            {cards.length === 0 ? (
              <div className="rounded-xl border border-[#24272c] bg-[#191b1f] px-6 py-12 text-center text-sm text-[#94a3b8]">
                No one is live in this category right now. New streams with 0 viewers will appear here when they go
                live.
              </div>
            ) : (
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {cards.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
