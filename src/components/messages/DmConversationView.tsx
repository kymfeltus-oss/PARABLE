"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { useAuth } from "@/hooks/useAuth";
import { useDmConversation } from "@/hooks/useDmConversation";
import DmComposer from "@/components/messages/DmComposer";
import DmMessageBubble from "@/components/messages/DmMessageBubble";
import type { DmProfileSnippet } from "@/lib/messages/types";

type Props = {
  conversationId: string;
  partner: DmProfileSnippet;
};

export default function DmConversationView({ conversationId, partner }: Props) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const currentUserId = userProfile?.id ?? "";
  const currentUsername =
    userProfile?.username?.trim() || userProfile?.full_name?.trim() || "You";
  const partnerName = partner.username?.trim() || partner.full_name?.trim() || "Member";

  const dm = useDmConversation({
    conversationId,
    currentUserId,
    currentUsername,
    partnerUsername: partnerName,
  });

  if (!currentUserId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#64748B]">
        Sign in to view messages.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#01040A] font-sans text-[#F8FAFC]">
      <header className="flex shrink-0 items-center gap-3 border-b border-[#06111E] bg-[#02040A]/95 px-3 py-2.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="text-[#94A3B8] hover:text-[#00F2FE]"
          aria-label="Back to inbox"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link
          href={`/profile/${encodeURIComponent(partner.username ?? partner.id)}`}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={partner.avatar_url ?? "/demo/avatars/default.svg"}
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-1 ring-[#06111E]"
            onError={fallbackAvatarOnError}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{partnerName}</p>
            <p className="truncate text-[11px] text-[#64748B]">Active now</p>
          </div>
        </Link>
      </header>

      <div
        ref={dm.listRef}
        onScroll={dm.handleListScroll}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4"
      >
        {dm.loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#00F2FE]" />
          </div>
        ) : dm.messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#64748B]">
            Say hello to @{partnerName}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {dm.messages.map((message) => (
              <DmMessageBubble
                key={message.clientTempId ?? message.id}
                message={message}
                showDeliveryStatus={dm.lastOwnMessage?.id === message.id}
                onRetry={() => void dm.retrySend(message.clientTempId!)}
                onDeleteFailed={() => dm.removeFailed(message.clientTempId!)}
                onUnsend={() => void dm.unsendMessage(message.id)}
                onReact={(emoji) => void dm.reactToMessage(message.id, emoji)}
                onVisible={() => void dm.markVisibleAsRead()}
              />
            ))}
          </div>
        )}
        <div ref={dm.bottomRef} className="h-1" />

        {dm.newMessagesBelow ? (
          <div className="pointer-events-none sticky bottom-2 z-20 flex justify-center pt-2">
            <button
              type="button"
              className="pointer-events-auto rounded-full border border-[#06111E] bg-[#020712] px-4 py-1.5 text-xs font-semibold text-[#00F2FE] shadow-lg"
              onClick={() => dm.scrollToBottom(true)}
            >
              New Messages Below
            </button>
          </div>
        ) : null}
      </div>

      <DmComposer
        typingLabel={dm.typingLabel}
        onSend={(text) => void dm.sendMessage(text)}
        onDraftChange={(_, hasText) => dm.broadcastTyping(hasText)}
      />
    </div>
  );
}
