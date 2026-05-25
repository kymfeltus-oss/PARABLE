import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DM_MESSAGE_SELECT,
  type DmInboxThread,
  type DmMessage,
  type DmMessageRow,
  type DmProfileSnippet,
} from "@/lib/messages/types";

function reactionsMap(rows: DmMessageRow["message_reactions"]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const row of rows ?? []) {
    map[row.user_id] = row.emoji;
  }
  return map;
}

export function mapMessageRow(row: DmMessageRow, currentUserId: string): DmMessage {
  return {
    id: row.id,
    clientTempId: row.client_temp_id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    postId: row.post_id,
    createdAt: row.created_at,
    deliveredAt: row.delivered_at,
    readAt: row.read_at,
    reactions: reactionsMap(row.message_reactions),
    isOwn: row.sender_id === currentUserId,
  };
}

export async function findOrCreateConversation(
  supabase: SupabaseClient,
  otherUserId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("find_or_create_dm_conversation", {
    other_user_id: otherUserId,
  });
  if (error) throw error;
  return data as string;
}

export async function fetchConversationMessages(
  supabase: SupabaseClient,
  conversationId: string,
  currentUserId: string,
): Promise<DmMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(DM_MESSAGE_SELECT)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as DmMessageRow[]).map((row) => mapMessageRow(row, currentUserId));
}

export async function insertMessage(
  supabase: SupabaseClient,
  payload: {
    conversationId: string;
    senderId: string;
    content: string;
    postId?: string | null;
    clientTempId?: string;
  },
): Promise<DmMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: payload.conversationId,
      sender_id: payload.senderId,
      content: payload.content,
      post_id: payload.postId ?? null,
      client_temp_id: payload.clientTempId ?? null,
    })
    .select(DM_MESSAGE_SELECT)
    .single();

  if (error) throw error;
  return mapMessageRow(data as DmMessageRow, payload.senderId);
}

export async function deleteMessage(supabase: SupabaseClient, messageId: string): Promise<void> {
  const { error } = await supabase.from("messages").delete().eq("id", messageId);
  if (error) throw error;
}

export async function markDelivered(supabase: SupabaseClient, messageId: string): Promise<void> {
  const { error } = await supabase.rpc("mark_dm_delivered", { message_id: messageId });
  if (error) throw error;
}

export async function markConversationRead(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<void> {
  const { error } = await supabase.rpc("mark_dm_conversation_read", { conv_id: conversationId });
  if (error) throw error;
}

export async function upsertReaction(
  supabase: SupabaseClient,
  messageId: string,
  userId: string,
  emoji: string,
): Promise<void> {
  const { error } = await supabase.from("message_reactions").upsert(
    { message_id: messageId, user_id: userId, emoji },
    { onConflict: "message_id,user_id" },
  );
  if (error) throw error;
}

export async function fetchInboxThreads(
  supabase: SupabaseClient,
  currentUserId: string,
): Promise<DmInboxThread[]> {
  const { data: memberships, error: memErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", currentUserId);

  if (memErr) throw memErr;
  const convIds = (memberships ?? []).map((m) => m.conversation_id as string);
  if (convIds.length === 0) return [];

  const { data: participants, error: partErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id, profiles:user_id ( id, username, full_name, avatar_url )")
    .in("conversation_id", convIds);

  if (partErr) throw partErr;

  const { data: messages, error: msgErr } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, created_at, read_at")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false });

  if (msgErr) throw msgErr;

  const lastReadByConv = new Map(
    (memberships ?? []).map((m) => [m.conversation_id as string, m.last_read_at as string | null]),
  );

  const threads: DmInboxThread[] = [];

  for (const convId of convIds) {
    const others = (participants ?? []).filter(
      (p) => p.conversation_id === convId && p.user_id !== currentUserId,
    );
    const otherRaw = others[0]?.profiles;
    const otherProfile = (Array.isArray(otherRaw) ? otherRaw[0] : otherRaw) as DmProfileSnippet | null;
    if (!otherProfile) continue;

    const convMessages = (messages ?? []).filter((m) => m.conversation_id === convId);
    const latest = convMessages[0];
    if (!latest) continue;

    const lastRead = lastReadByConv.get(convId);
    const unreadCount = convMessages.filter(
      (m) =>
        m.sender_id !== currentUserId &&
        !m.read_at &&
        (!lastRead || new Date(m.created_at) > new Date(lastRead)),
    ).length;

    threads.push({
      conversationId: convId,
      otherUser: otherProfile,
      preview: latest.content as string,
      previewAt: latest.created_at as string,
      unreadCount,
    });
  }

  threads.sort((a, b) => new Date(b.previewAt).getTime() - new Date(a.previewAt).getTime());
  return threads;
}

export async function fetchDmRecipients(
  supabase: SupabaseClient,
  currentUserId: string,
): Promise<DmProfileSnippet[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id, profiles:following_id ( id, username, full_name, avatar_url )")
    .eq("follower_id", currentUserId);

  if (error) throw error;

  const rows = (data ?? [])
    .map((row) => {
      const p = row.profiles;
      return (Array.isArray(p) ? p[0] : p) as DmProfileSnippet | null;
    })
    .filter(Boolean) as DmProfileSnippet[];

  return rows;
}

export async function fetchConversationPartner(
  supabase: SupabaseClient,
  conversationId: string,
  currentUserId: string,
): Promise<DmProfileSnippet | null> {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select("user_id, profiles:user_id ( id, username, full_name, avatar_url )")
    .eq("conversation_id", conversationId)
    .neq("user_id", currentUserId)
    .maybeSingle();

  if (error) throw error;
  const p = data?.profiles;
  return (Array.isArray(p) ? p[0] : p) as DmProfileSnippet | null;
}

export async function sendPostToFollowers(
  supabase: SupabaseClient,
  senderId: string,
  followerIds: string[],
  postId: string,
): Promise<void> {
  const content = "Shared a post with you";
  for (const followerId of followerIds) {
    const conversationId = await findOrCreateConversation(supabase, followerId);
    await insertMessage(supabase, {
      conversationId,
      senderId,
      content,
      postId,
    });
  }
}

export function deliveryLabel(message: DmMessage): string | null {
  if (!message.isOwn || message.localStatus === "sending" || message.localStatus === "failed") {
    return null;
  }
  if (message.readAt) {
    const t = new Date(message.readAt);
    return `Seen ${t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  if (message.deliveredAt) return "Delivered";
  return "Sent";
}
