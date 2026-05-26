"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Video, Sparkles, LayoutGrid, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLogo from "@/components/AppLogo";

type StudyGroup = {
  id: string;
  name: string;
  description: string | null;
  host_id: string;
  created_at: string;
};

export default function TablePage() {
  const router = useRouter();
  const { userProfile, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const userId = userProfile?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setGroups([]);
      setGroupsLoading(false);
      return;
    }
    const supabase = createClient();
    (async () => {
      setGroupsLoading(true);
      const { data, error } = await supabase
        .from("study_group_members")
        .select("group_id, study_groups(id, name, description, host_id, created_at)")
        .eq("user_id", userId);
      setGroupsLoading(false);
      if (error) {
        console.error("Table: fetch groups", error);
        setGroups([]);
        return;
      }
      const list = (data ?? []).flatMap((row: { study_groups: StudyGroup | StudyGroup[] | null }) =>
        Array.isArray(row.study_groups) ? row.study_groups : row.study_groups ? [row.study_groups] : []
      ) as StudyGroup[];
      setGroups(list);
    })();
  }, [userId]);

  const handleCreateGroup = async () => {
    const name = createName.trim();
    if (!name || !userId || createSubmitting) return;
    setCreateSubmitting(true);
    setCreateError(null);
    const supabase = createClient();
    const { data: group, error: groupError } = await supabase
      .from("study_groups")
      .insert({ name, description: createDesc.trim() || null, host_id: userId })
      .select("id")
      .single();

    if (groupError || !group?.id) {
      setCreateError(groupError?.message ?? "Could not create group.");
      setCreateSubmitting(false);
      return;
    }

    const { error: memberError } = await supabase.from("study_group_members").insert({
      group_id: group.id,
      user_id: userId,
      role: "host",
    });

    if (memberError) {
      setCreateError(memberError.message);
      setCreateSubmitting(false);
      return;
    }

    setGroups((prev) => [
      ...prev,
      {
        id: group.id,
        name,
        description: createDesc.trim() || null,
        host_id: userId,
        created_at: new Date().toISOString(),
      },
    ]);
    setCreateName("");
    setCreateDesc("");
    setCreateOpen(false);
    setCreateSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#020107] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,242,255,0.06),transparent_65%),radial-gradient(circle_at_bottom,rgba(180,83,9,0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.12] mix-blend-soft-light" />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-full flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/my-sanctuary")}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 hover:border-[var(--color-cyber)]/60 transition"
          >
            <AppLogo size="md" showLabel />
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[9px] font-mono uppercase tracking-[3px] text-[var(--color-cyber)]/70">
                The Table
              </span>
              <span className="text-xs text-white/70">Digital Living Room</span>
            </div>
          </button>
          <button
            onClick={() => router.push("/sanctuary-reader")}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[2px] text-white/70 hover:border-[var(--color-cyber)]/60"
          >
            Sanctuary Reader
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="inline-flex h-1.5 w-10 rounded-full bg-gradient-to-r from-[var(--color-cyber)] via-sky-400 to-emerald-400 shadow-[0_0_16px_rgba(56,189,248,0.8)]" />
          <span className="font-mono uppercase tracking-[2.5px] text-white/60">
            Groups · Live rooms · Growth Temple
          </span>
        </div>

        <section className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-cyber)]" />
              <h2 className="text-sm font-semibold">Your groups</h2>
            </div>
            {userId && (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cyber)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[2px] text-black hover:bg-[#4df7ff]"
              >
                <Plus className="w-3.5 h-3.5" />
                Create group
              </button>
            )}
          </div>
          <div className="p-4 sm:p-6">
            {authLoading || groupsLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-white/50">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : !userId ? (
              <p className="text-sm text-white/60 text-center py-4">
                Sign in to create or see your groups.
              </p>
            ) : groups.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-white/60 mb-3">
                  No groups yet. Create a group to read together and sync live.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="rounded-full bg-[var(--color-cyber)] px-4 py-2 text-[11px] font-bold uppercase tracking-[2px] text-black hover:bg-[#4df7ff]"
                >
                  Create group
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {groups.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/table/${g.id}`)}
                      className="w-full text-left rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-[var(--color-cyber)]/40 transition"
                    >
                      <p className="font-semibold text-sm text-white/95">{g.name}</p>
                      {g.description && (
                        <p className="text-[11px] text-white/55 mt-0.5 line-clamp-1">
                          {g.description}
                        </p>
                      )}
                      <p className="text-[10px] text-white/40 mt-1">
                        {g.host_id === userId ? "You host" : "Member"} · Open
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {createOpen && userId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0f] p-5 shadow-xl">
              <h3 className="text-sm font-semibold mb-3">Create a group</h3>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Group name"
                className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-[var(--color-cyber)]/60 mb-3"
                disabled={createSubmitting}
              />
              <textarea
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-[var(--color-cyber)]/60 resize-none mb-3"
                disabled={createSubmitting}
              />
              {createError && (
                <p className="text-[11px] text-red-300 mb-3">{createError}</p>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCreateOpen(false);
                    setCreateError(null);
                  }}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/70 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={createSubmitting || !createName.trim()}
                  className="rounded-lg bg-[var(--color-cyber)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[2px] text-black disabled:opacity-50 flex items-center gap-2"
                >
                  {createSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-white/10 flex items-center gap-2">
            <Video className="w-4 h-4 text-[var(--color-cyber)]" />
            <h2 className="text-sm font-semibold">Live rooms</h2>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-white/60">
              Synchronized reader + built-in video so you can study face-to-face without Zoom.
            </p>
            <p className="mt-2 text-[11px] text-white/45">Coming soon</p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-white/10 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[var(--color-cyber)]" />
            <h2 className="text-sm font-semibold">Growth Temple</h2>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-white/60 mb-2">
              As your group completes daily readings, the Temple grows from tent to sanctuary.
            </p>
            <p className="text-[11px] text-white/45">Shared progress · Coming soon</p>
          </div>
        </section>

        <div className="flex justify-center pt-2">
          <button
            onClick={() => router.push("/sanctuary-reader")}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/15 px-4 py-2 text-[11px] font-semibold text-white/70 hover:border-[var(--color-cyber)]/60"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open Sanctuary Reader
          </button>
        </div>
      </div>
    </div>
  );
}
