"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  deleteMessage,
  fetchConversationMessages,
  insertMessage,
  mapMessageRow,
  markConversationRead,
  markDelivered,
  upsertReaction,
} from "@/lib/messages/api";
import {
  DM_SEND_TIMEOUT_MS,
  type DmMessage,
  type DmMessageRow,
  type DmTypingPayload,
} from "@/lib/messages/types";
import { useMessagesOptional } from "@/providers/MessagesProvider";

type Options = {
  conversationId: string;
  currentUserId: string;
  currentUsername: string;
  partnerUsername: string;
};

export function useDmConversation({
  conversationId,
  currentUserId,
  currentUsername,
  partnerUsername,
}: Options) {
  const supabase = useMemo(() => createClient(), []);
  const messagesCtx = useMessagesOptional();
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingPartner, setTypingPartner] = useState<DmTypingPayload | null>(null);
  const [newMessagesBelow, setNewMessagesBelow] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingStopTimerRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef(0);
  const nearBottomRef = useRef(true);

  const isNearBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 96;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
    setNewMessagesBelow(false);
  }, []);

  const mergeIncoming = useCallback(
    (row: DmMessageRow) => {
      const mapped = mapMessageRow(row, currentUserId);
      setMessages((prev) => {
        if (prev.some((m) => m.id === mapped.id)) return prev;
        const withoutTemp = mapped.clientTempId
          ? prev.filter((m) => m.clientTempId !== mapped.clientTempId)
          : prev;
        return [...withoutTemp, mapped];
      });
      return mapped;
    },
    [currentUserId],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const rows = await fetchConversationMessages(supabase, conversationId, currentUserId);
        if (!cancelled) setMessages(rows);
        await markConversationRead(supabase, conversationId);
        void messagesCtx?.refreshInbox();
      } catch (err) {
        console.error("useDmConversation load:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    messagesCtx?.setActiveConversationId(conversationId);

    return () => {
      cancelled = true;
      messagesCtx?.setActiveConversationId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount per conversation only
  }, [conversationId, currentUserId, supabase]);

  useEffect(() => {
    const channel = supabase
      .channel(`dm-conversation-${conversationId}`, {
        config: { broadcast: { self: false } },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as DmMessageRow;
          if (row.sender_id === currentUserId) return;

          const mapped = mergeIncoming(row);
          void markDelivered(supabase, mapped.id);

          if (nearBottomRef.current) {
            window.setTimeout(() => scrollToBottom(true), 40);
          } else {
            setNewMessagesBelow(true);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as DmMessageRow;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === row.id
                ? {
                    ...m,
                    deliveredAt: row.delivered_at,
                    readAt: row.read_at,
                    localStatus: m.localStatus === "sending" ? m.localStatus : undefined,
                  }
                : m,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const old = payload.old as { id?: string };
          if (old.id) setMessages((prev) => prev.filter((m) => m.id !== old.id));
        },
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const p = payload as DmTypingPayload;
        if (p.userId === currentUserId) return;
        setTypingPartner(p);
        if (typingStopTimerRef.current) window.clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = window.setTimeout(() => setTypingPartner(null), 2500);
      })
      .on("broadcast", { event: "stop_typing" }, ({ payload }) => {
        const p = payload as { userId?: string };
        if (!p.userId || p.userId === currentUserId) return;
        setTypingPartner(null);
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message_reactions" },
        async () => {
          try {
            const rows = await fetchConversationMessages(supabase, conversationId, currentUserId);
            setMessages(rows);
          } catch {
            /* ignore */
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingStopTimerRef.current) window.clearTimeout(typingStopTimerRef.current);
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, supabase, mergeIncoming, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string, postId?: string | null) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const clientTempId = `temp-${crypto.randomUUID()}`;
      const optimistic: DmMessage = {
        id: clientTempId,
        clientTempId,
        conversationId,
        senderId: currentUserId,
        content: trimmed,
        postId: postId ?? null,
        createdAt: new Date().toISOString(),
        reactions: {},
        isOwn: true,
        localStatus: "sending",
      };

      setMessages((prev) => [...prev, optimistic]);
      window.setTimeout(() => scrollToBottom(true), 30);

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), DM_SEND_TIMEOUT_MS);

      try {
        const saved = await insertMessage(supabase, {
          conversationId,
          senderId: currentUserId,
          content: trimmed,
          postId,
          clientTempId,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.clientTempId === clientTempId
              ? { ...saved, localStatus: undefined, isOwn: true }
              : m,
          ),
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.clientTempId === clientTempId ? { ...m, localStatus: "failed" } : m)),
        );
      } finally {
        window.clearTimeout(timeout);
      }
    },
    [conversationId, currentUserId, supabase, scrollToBottom],
  );

  const retrySend = useCallback(
    async (tempId: string) => {
      const failed = messages.find((m) => m.clientTempId === tempId && m.localStatus === "failed");
      if (!failed) return;
      setMessages((prev) =>
        prev.map((m) => (m.clientTempId === tempId ? { ...m, localStatus: "sending" as const } : m)),
      );
      try {
        const saved = await insertMessage(supabase, {
          conversationId,
          senderId: currentUserId,
          content: failed.content,
          postId: failed.postId,
          clientTempId: tempId,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.clientTempId === tempId ? { ...saved, localStatus: undefined, isOwn: true } : m,
          ),
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.clientTempId === tempId ? { ...m, localStatus: "failed" as const } : m)),
        );
      }
    },
    [messages, conversationId, currentUserId, supabase],
  );

  const removeFailed = useCallback((tempId: string) => {
    setMessages((prev) => prev.filter((m) => m.clientTempId !== tempId));
  }, []);

  const unsendMessage = useCallback(
    async (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      try {
        await deleteMessage(supabase, messageId);
      } catch (err) {
        console.error("unsendMessage:", err);
      }
    },
    [supabase],
  );

  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, reactions: { ...m.reactions, [currentUserId]: emoji } } : m,
        ),
      );
      try {
        await upsertReaction(supabase, messageId, currentUserId, emoji);
      } catch {
        /* ignore */
      }
    },
    [currentUserId, supabase],
  );

  const broadcastTyping = useCallback(
    (hasText: boolean) => {
      const ch = channelRef.current;
      if (!ch) return;

      if (!hasText) {
        void ch.send({
          type: "broadcast",
          event: "stop_typing",
          payload: { userId: currentUserId },
        });
        return;
      }

      const now = Date.now();
      if (now - lastTypingSentRef.current < 3000) return;
      lastTypingSentRef.current = now;

      void ch.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUserId, username: currentUsername } satisfies DmTypingPayload,
      });
    },
    [currentUserId, currentUsername],
  );

  const handleListScroll = useCallback(() => {
    nearBottomRef.current = isNearBottom();
    if (nearBottomRef.current) setNewMessagesBelow(false);
  }, [isNearBottom]);

  const markVisibleAsRead = useCallback(async () => {
    try {
      await markConversationRead(supabase, conversationId);
      messagesCtx?.refreshInbox();
    } catch {
      /* ignore */
    }
  }, [supabase, conversationId, messagesCtx]);

  const lastOwnMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.isOwn) return messages[i]!;
    }
    return null;
  }, [messages]);

  return {
    messages,
    loading,
    typingPartner,
    typingLabel: typingPartner ? `${partnerUsername} is typing…` : null,
    newMessagesBelow,
    listRef,
    bottomRef,
    sendMessage,
    retrySend,
    removeFailed,
    unsendMessage,
    reactToMessage,
    broadcastTyping,
    scrollToBottom,
    handleListScroll,
    markVisibleAsRead,
    lastOwnMessage,
  };
}
