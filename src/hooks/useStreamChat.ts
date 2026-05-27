"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { resolveStreamChatRoomId } from "@/lib/stream-chat-room";

export type StreamChatMessage = {
  id: string;
  user: string;
  text: string;
};

type UseStreamChatOptions = {
  streamKey: string | null | undefined;
  senderDisplayName?: string;
};

export function useStreamChat({ streamKey, senderDisplayName = "You" }: UseStreamChatOptions) {
  const [chatMessages, setChatMessages] = useState<StreamChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const roomId = useMemo(() => resolveStreamChatRoomId(streamKey), [streamKey]);
  const chatEnabled = Boolean(roomId);

  useEffect(() => {
    if (!roomId) {
      setChatMessages([]);
      setChatError(null);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    async function fetchChatHistory() {
      const { data, error } = await supabase
        .from("stream_chat_messages")
        .select("id, body, display_name")
        .eq("stream_id", roomId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (cancelled) return;

      if (error) {
        console.error("useStreamChat history:", error.message);
        const friendly =
          error.code === "PGRST205" || /schema cache/i.test(error.message)
            ? "Live chat table is not ready. Run supabase/schema-stream-chat.sql in your Supabase project."
            : error.message;
        setChatError(friendly);
        return;
      }

      setChatError(null);
      setChatMessages(
        (data ?? []).map((row) => ({
          id: row.id,
          user: row.display_name?.trim() || "Anonymous",
          text: row.body,
        })),
      );
    }

    void fetchChatHistory();

    const chatChannel = supabase
      .channel(`realtime:chat:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stream_chat_messages",
          filter: `stream_id=eq.${roomId}`,
        },
        (payload) => {
          const row = payload.new as {
            id?: string;
            body?: string;
            display_name?: string;
          };
          if (!row.id || !row.body) return;

          const incoming: StreamChatMessage = {
            id: row.id,
            user: row.display_name?.trim() || "Anonymous",
            text: row.body,
          };

          setChatMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(chatChannel);
    };
  }, [roomId]);

  const sendChatMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !roomId) return;

      const currentText = newMessage.trim();
      setNewMessage("");

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setChatError("Sign in to participate in live chat.");
        return;
      }

      setSending(true);
      setChatError(null);

      const label =
        senderDisplayName.trim() ||
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "Anonymous";

      const { error } = await supabase.from("stream_chat_messages").insert({
        stream_id: roomId,
        sender_id: user.id,
        display_name: label,
        body: currentText,
      });

      setSending(false);

      if (error) {
        console.error("Failed to sync chat transmission:", error.message);
        setChatError(error.message);
        setNewMessage(currentText);
      }
    },
    [newMessage, roomId, senderDisplayName],
  );

  return {
    roomId,
    chatEnabled,
    chatMessages,
    newMessage,
    setNewMessage,
    chatError,
    sending,
    sendChatMessage,
  };
}
