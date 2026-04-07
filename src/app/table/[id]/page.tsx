"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AppLogo from "@/components/AppLogo";
import { ArrowLeft, Users, BookOpen, MessageCircle, LayoutGrid } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type StudyGroup = {
  id: string;
  name: string;
  description: string | null;
  host_id: string;
  created_at: string;
};

export default function TableGroupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    (async () => {
      const { data, error: e } = await supabase
        .from("study_groups")
        .select("id, name, description, host_id, created_at")
        .eq("id", id)
        .single();
      setLoading(false);
      if (e) {
        setError(e.message);
        setGroup(null);
        return;
      }
      setGroup(data as StudyGroup);
    })();
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen bg-[#020107] text-white flex items-center justify-center">
        <p className="text-white/60">Invalid group.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020107] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,242,255,0.06),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.12] mix-blend-soft-light" />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-full flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/table")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 hover:border-[var(--color-cyber)]/60 transition"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--color-cyber)]" />
            <span className="text-xs font-semibold">The Table</span>
          </button>
          <AppLogo size="sm" showLabel className="opacity-90" />
        </header>

        {loading && (
          <div className="flex items-center justify-center py-12 text-white/50">
            <span className="text-sm">Loading group…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {!loading && group && (
          <>
            <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
              <h1 className="text-xl font-bold text-white/95">{group.name}</h1>
              {group.description && (
                <p className="text-sm text-white/60 mt-1">{group.description}</p>
              )}
              <p className="text-[11px] text-white/40 mt-2">Reading plan & live session coming soon.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-[var(--color-cyber)]/40 transition"
              >
                <BookOpen className="w-5 h-5 text-[var(--color-cyber)]" />
                <div>
                  <p className="text-sm font-semibold">Plan</p>
                  <p className="text-[11px] text-white/50">Daily reading schedule</p>
                </div>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-[var(--color-cyber)]/40 transition"
              >
                <MessageCircle className="w-5 h-5 text-[var(--color-cyber)]" />
                <div>
                  <p className="text-sm font-semibold">Chat</p>
                  <p className="text-[11px] text-white/50">Group conversation</p>
                </div>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-[var(--color-cyber)]/40 transition"
              >
                <LayoutGrid className="w-5 h-5 text-[var(--color-cyber)]" />
                <div>
                  <p className="text-sm font-semibold">Temple</p>
                  <p className="text-[11px] text-white/50">Shared progress</p>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/50">
              <Users className="w-4 h-4" />
              <span>Invite link & live sync coming soon.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
