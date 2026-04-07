"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import AppLogo from "@/components/AppLogo";
import {
  BookOpenText,
  Users,
  Sparkles,
  LogOut,
  Settings,
  ChevronRight,
} from "lucide-react";

type StudyGroup = {
  id: string;
  name: string;
  description: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { userProfile, avatarUrl, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const userId = userProfile?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setGroupsLoading(false);
      return;
    }
    const supabase = createClient();
    supabase
      .from("study_group_members")
      .select("group_id, study_groups(id, name, description)")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        setGroupsLoading(false);
        if (error) return;
        const list = (data ?? [])
          .flatMap((row: { study_groups: StudyGroup | StudyGroup[] | null }) =>
            Array.isArray(row.study_groups) ? row.study_groups : row.study_groups ? [row.study_groups] : []
          ) as StudyGroup[];
        setGroups(list);
      });
  }, [userId]);

  const isStudyAI = process.env.NEXT_PUBLIC_APP_VARIANT === "parable-study-ai";
  if (!isStudyAI) {
    router.replace("/profile");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#020107] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.06),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.12] mix-blend-soft-light" />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-full flex-col gap-6 px-4 py-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <AppLogo size="md" showLabel />
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/sanctuary-reader")}
              className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/20"
            >
              Open Reader
            </button>
          </div>
        </header>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex h-1.5 w-10 rounded-full bg-amber-500/80 shadow-[0_0_12px_rgba(234,179,8,0.5)]" />
          <span className="font-mono uppercase tracking-[2.5px] text-white/60">
            Your dashboard
          </span>
        </div>

        {authLoading ? (
          <div className="py-12 text-center text-white/50 text-sm">Loading…</div>
        ) : (
          <>
            <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500/40 overflow-hidden bg-black/50 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl || "/logo.svg"}
                    alt={userProfile?.username || "You"}
                    className="w-full h-full object-cover"
                    onError={fallbackAvatarOnError}
                  />
                </div>
                <div>
                  <p className="font-semibold text-white/95">
                    {userProfile?.username || userProfile?.full_name || "User"}
                  </p>
                  <p className="text-[11px] text-white/50">PARABLE Study AI</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/profile")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-[11px] font-medium text-white/80 hover:bg-white/10"
                >
                  <Settings className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => window.location.assign("/logout")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-[11px] font-medium text-white/80 hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-semibold">Shortcuts</span>
              </div>
              <div className="divide-y divide-white/5">
                <button
                  onClick={() => router.push("/sanctuary-reader")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <BookOpenText className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/95">Sanctuary Reader</p>
                    <p className="text-[11px] text-white/50">AI Scholar · De-Coder · Steel Man</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>
                <button
                  onClick={() => router.push("/table")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/95">The Table</p>
                    <p className="text-[11px] text-white/50">Groups · Live rooms</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>
                <button
                  onClick={() => router.push("/lab")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/95">The Lab</p>
                    <p className="text-[11px] text-white/50">Creator tools</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-semibold">Your groups</span>
                <button
                  onClick={() => router.push("/table")}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  See all
                </button>
              </div>
              <div className="p-4">
                {groupsLoading ? (
                  <p className="text-[11px] text-white/50">Loading…</p>
                ) : groups.length === 0 ? (
                  <p className="text-[11px] text-white/50">No groups yet. Create one from The Table.</p>
                ) : (
                  <ul className="space-y-2">
                    {groups.slice(0, 3).map((g) => (
                      <li key={g.id}>
                        <button
                          onClick={() => router.push(`/table/${g.id}`)}
                          className="w-full text-left rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/90 hover:border-amber-500/30"
                        >
                          {g.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
