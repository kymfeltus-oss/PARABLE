"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/providers/MessagesProvider";
import {
  fetchDmRecipients,
  fetchInboxThreads,
  findOrCreateConversation,
} from "@/lib/messages/api";
import type { DmInboxThread, DmProfileSnippet } from "@/lib/messages/types";
import { getSanctuaryShareFollowers } from "@/lib/sanctuary-home-interactions";
import { DEMO_PERSONA_IDS } from "@/lib/demo-personas";

function relativePreviewTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function demoSuggestedRecipients(): DmProfileSnippet[] {
  return getSanctuaryShareFollowers().map((f) => ({
    id: DEMO_PERSONA_IDS[f.username as keyof typeof DEMO_PERSONA_IDS] ?? f.id,
    username: f.username,
    full_name: f.username,
    avatar_url: f.avatar_url,
  }));
}

export default function DmInboxView() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { refreshInbox } = useMessages();
  const supabase = useMemo(() => createClient(), []);
  const currentUserId = userProfile?.id ?? null;

  const [threads, setThreads] = useState<DmInboxThread[]>([]);
  const [suggested, setSuggested] = useState<DmProfileSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      setSuggested(demoSuggestedRecipients());
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [inbox, recipients] = await Promise.all([
        fetchInboxThreads(supabase, currentUserId),
        fetchDmRecipients(supabase, currentUserId),
      ]);
      setThreads(inbox);
      setSuggested(recipients.length > 0 ? recipients : demoSuggestedRecipients());
      await refreshInbox();
    } catch (err) {
      setThreads([]);
      setSuggested(demoSuggestedRecipients());
      setError(
        err instanceof Error
          ? err.message
          : "Inbox unavailable — apply supabase/schema-messages.sql and enable Realtime.",
      );
    } finally {
      setLoading(false);
    }
  }, [currentUserId, supabase, refreshInbox]);

  useEffect(() => {
    void load();
  }, [load]);

  const startChat = async (otherUserId: string) => {
    if (!currentUserId) {
      router.push("/login?next=/messages");
      return;
    }
    try {
      const conversationId = await findOrCreateConversation(supabase, otherUserId);
      router.push(`/messages/${conversationId}`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not start conversation.");
    }
  };

  return (
    <div className="min-h-full bg-[#01040A] pb-6 font-sans text-[#F8FAFC]">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#06111E] bg-[#02040A]/95 px-4 py-3 backdrop-blur-md">
        <Link href="/my-sanctuary" className="text-[#94A3B8] hover:text-[#00F2FE]" aria-label="Back to feed">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Send className="h-5 w-5 shrink-0 fill-[#00F2FE]/20 text-[#00F2FE]" />
          <h1 className="truncate text-base font-bold">Messages</h1>
        </div>
      </header>

      {!currentUserId ? (
        <div className="px-6 py-16 text-center text-sm text-[#64748B]">
          <Link href="/login?next=/messages" className="font-semibold text-[#00F2FE] hover:underline">
            Sign in
          </Link>{" "}
          to view your inbox.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#00F2FE]" />
        </div>
      ) : (
        <>
          {error ? (
            <p className="border-b border-[#06111E]/60 px-4 py-2 text-center text-[11px] text-[#64748B]">
              {error}
            </p>
          ) : null}

          {threads.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-[#64748B]">
              No conversations yet. Start one below.
            </p>
          ) : (
            <ul className="divide-y divide-[#06111E]/80">
              {threads.map((thread) => {
                const name =
                  thread.otherUser.username?.trim() ||
                  thread.otherUser.full_name?.trim() ||
                  "Member";
                return (
                  <li key={thread.conversationId}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#06111E]/40"
                      onClick={() => router.push(`/messages/${thread.conversationId}`)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thread.otherUser.avatar_url ?? "/demo/avatars/default.svg"}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover ring-1 ring-[#06111E]"
                        onError={fallbackAvatarOnError}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{name}</span>
                          <span className="shrink-0 text-[11px] text-[#64748B]">
                            {relativePreviewTime(thread.previewAt)}
                          </span>
                        </div>
                        <p className="truncate text-[13px] text-[#94A3B8]">{thread.preview}</p>
                      </div>
                      {thread.unreadCount > 0 ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00F2FE] px-1 text-[10px] font-bold text-[#01040A]">
                          {thread.unreadCount}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <section className="mt-6 px-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              New message
            </p>
            <div className="flex flex-wrap gap-2">
              {suggested.slice(0, 8).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="rounded-full border border-[#06111E] px-3 py-1.5 text-xs text-[#CBD5E1] hover:border-[#00F2FE]/40 hover:text-[#00F2FE]"
                  onClick={() => void startChat(user.id)}
                >
                  @{user.username ?? user.full_name ?? "member"}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
