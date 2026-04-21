"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Radio } from "lucide-react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

export type NotificationRow = {
  id?: string;
  receiver_id?: string;
  sender_id?: string;
  type?: string;
  post_id?: string | null;
  created_at?: string;
  [key: string]: unknown;
};

type Sender = {
  username: string | null;
  avatar_url: string | null;
};

export type ToastPayload = NotificationRow & { sender?: Sender | null };

type Props = {
  /** Recipient profile id — must match `auth.uid()` rows you can receive via Realtime. */
  currentUserId: string | null;
};

function toastCopy(type: string | undefined): string {
  switch (type) {
    case "like":
      return "praised your post!";
    case "comment":
      return "commented on your post.";
    case "follow":
      return "started following you.";
    default:
      return "sent you an update.";
  }
}

/**
 * Same fixed slot + motion as in-app notifications; use from Hub when someone goes live.
 */
export function HubStreamLiveToast({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDismiss, 5200);
    return () => window.clearTimeout(t);
  }, [message, onDismiss]);

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 32 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="pointer-events-auto fixed right-3 top-[4.75rem] z-[200] flex max-w-[min(calc(100vw-1.5rem),20rem)] items-center gap-3 rounded-xl border border-[#5865F2]/45 bg-[#12131a] p-3 shadow-2xl shadow-black/60 md:right-5 md:top-20"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/15">
            <Radio className="h-5 w-5 text-red-400" aria-hidden strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#5865F2]">Live in the sanctuary</p>
            <p className="mt-0.5 text-[13px] leading-snug text-white">{message}</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold text-gray-500 hover:bg-white/5 hover:text-white"
          >
            Dismiss
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Subscribes to `public.notifications` INSERTs where `receiver_id` is the signed-in user
 * (enable Realtime on that table in Supabase). See `supabase/schema-notifications.sql`.
 */
export default function NotificationToast({ currentUserId }: Props) {
  const [notification, setNotification] = useState<ToastPayload | null>(null);

  const clearSoon = useCallback(() => {
    const t = window.setTimeout(() => setNotification(null), 5200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`live-notifications-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        async (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
          const row = payload.new as NotificationRow | null | undefined;
          const senderId = row?.sender_id;
          if (!senderId) return;

          const { data: sender } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", senderId)
            .maybeSingle();

          setNotification({ ...row, sender: sender ?? null });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!notification) return;
    return clearSoon();
  }, [notification, clearSoon]);

  const handleDismiss = () => setNotification(null);

  return (
    <AnimatePresence>
      {notification ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 32 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="pointer-events-auto fixed right-3 top-[4.75rem] z-[200] flex max-w-[min(calc(100vw-1.5rem),20rem)] items-center gap-3 rounded-xl border border-[#00f2ff]/35 bg-[#18191c] p-3 shadow-2xl shadow-black/60 md:right-5 md:top-20"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40">
            <Bell className="h-5 w-5 text-[#00f2ff]" aria-hidden />
          </div>
          {notification.sender?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={notification.sender.avatar_url}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full border border-neutral-700 object-cover"
              onError={fallbackAvatarOnError}
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-xs font-bold text-white/70">
              {(notification.sender?.username ?? "?").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">
              @
              {notification.sender?.username?.trim() || notification.sender_id?.slice(0, 8) || "someone"}
            </p>
            <p className="text-[10px] leading-snug text-gray-400">
              {toastCopy(notification.type)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold text-gray-500 hover:bg-white/5 hover:text-white"
          >
            Dismiss
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
