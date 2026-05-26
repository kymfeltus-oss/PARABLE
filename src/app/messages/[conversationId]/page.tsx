"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DmConversationView from "@/components/messages/DmConversationView";
import { fetchConversationPartner } from "@/lib/messages/api";
import type { DmProfileSnippet } from "@/lib/messages/types";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = String((params as { conversationId?: string }).conversationId ?? "");
  const { userProfile, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [partner, setPartner] = useState<DmProfileSnippet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!userProfile?.id) {
      router.replace(`/login?next=/messages/${encodeURIComponent(conversationId)}`);
      return;
    }
    if (!conversationId) return;

    let cancelled = false;
    void (async () => {
      try {
        const p = await fetchConversationPartner(supabase, conversationId, userProfile.id);
        if (!cancelled) setPartner(p);
      } catch {
        if (!cancelled) setPartner(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, userProfile?.id, conversationId, supabase, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#01040A]">
        <Loader2 className="h-6 w-6 animate-spin text-[#00F2FE]" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-[#01040A] px-6 text-center text-sm text-[#64748B]">
        <p>Conversation not found.</p>
        <button
          type="button"
          className="text-[#00F2FE] hover:underline"
          onClick={() => router.push("/messages")}
        >
          Back to inbox
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DmConversationView conversationId={conversationId} partner={partner} />
    </div>
  );
}
