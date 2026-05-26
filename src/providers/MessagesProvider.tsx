"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchInboxThreads, mapMessageRow } from "@/lib/messages/api";
import type { DmMessageRow } from "@/lib/messages/types";

type MessagesContextValue = {
  currentUserId: string | null;
  unreadCount: number;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  refreshInbox: () => Promise<void>;
  decrementUnread: (count?: number) => void;
  incrementUnread: (count?: number) => void;
  notifyIncomingMessage: (message: { conversationId: string; senderId: string }) => void;
};

const MessagesContext = createContext<MessagesContextValue | null>(null);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { userProfile } = useAuth();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const currentUserId = userProfile?.id ?? null;

  const [unreadCount, setUnreadCount] = useState(0);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const activeConversationRef = useRef<string | null>(null);

  const setActiveConversationId = useCallback((id: string | null) => {
    activeConversationRef.current = id;
    setActiveConversationIdState(id);
  }, []);

  const refreshInbox = useCallback(async () => {
    if (!currentUserId) {
      setUnreadCount(0);
      return;
    }
    try {
      const threads = await fetchInboxThreads(supabase, currentUserId);
      const total = threads.reduce((sum, t) => sum + t.unreadCount, 0);
      setUnreadCount(total);
    } catch {
      /* schema may not be applied yet */
    }
  }, [currentUserId, supabase]);

  useEffect(() => {
    void refreshInbox();
  }, [refreshInbox]);

  useEffect(() => {
    const match = pathname?.match(/^\/messages\/([^/]+)$/);
    if (match && match[1] !== "with") {
      setActiveConversationId(match[1]!);
    } else if (!pathname?.startsWith("/messages/")) {
      setActiveConversationId(null);
    }
  }, [pathname, setActiveConversationId]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`dm-inbox-global-${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as DmMessageRow;
          if (row.sender_id === currentUserId) return;

          const active = activeConversationRef.current;
          if (active === row.conversation_id) {
            void supabase.rpc("mark_dm_delivered", { message_id: row.id });
            return;
          }

          setUnreadCount((c) => c + 1);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => {
          void refreshInbox();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase, refreshInbox]);

  const incrementUnread = useCallback((count = 1) => {
    setUnreadCount((c) => c + count);
  }, []);

  const decrementUnread = useCallback((count = 1) => {
    setUnreadCount((c) => Math.max(0, c - count));
  }, []);

  const notifyIncomingMessage = useCallback(
    (message: { conversationId: string; senderId: string }) => {
      if (!currentUserId || message.senderId === currentUserId) return;
      if (activeConversationRef.current === message.conversationId) return;
      incrementUnread();
    },
    [currentUserId, incrementUnread],
  );

  const value = useMemo(
    () => ({
      currentUserId,
      unreadCount,
      activeConversationId,
      setActiveConversationId,
      refreshInbox,
      decrementUnread,
      incrementUnread,
      notifyIncomingMessage,
    }),
    [
      currentUserId,
      unreadCount,
      activeConversationId,
      setActiveConversationId,
      refreshInbox,
      decrementUnread,
      incrementUnread,
      notifyIncomingMessage,
    ],
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error("useMessages must be used within MessagesProvider");
  }
  return ctx;
}

export function useMessagesOptional() {
  return useContext(MessagesContext);
}
