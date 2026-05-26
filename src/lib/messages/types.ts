export type DmLocalStatus = "sending" | "sent" | "failed";

export type DmDeliveryStatus = "sent" | "delivered" | "seen";

export type DmProfileSnippet = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export type DmMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  post_id: string | null;
  client_temp_id: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
  message_reactions?: { emoji: string; user_id: string }[] | null;
};

export type DmMessage = {
  id: string;
  clientTempId?: string | null;
  conversationId: string;
  senderId: string;
  content: string;
  postId?: string | null;
  createdAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  localStatus?: DmLocalStatus;
  reactions: Record<string, string>;
  isOwn: boolean;
};

export type DmInboxThread = {
  conversationId: string;
  otherUser: DmProfileSnippet;
  preview: string;
  previewAt: string;
  unreadCount: number;
};

export type DmTypingPayload = {
  userId: string;
  username: string;
};

export const DM_MESSAGE_SELECT = `
  id,
  conversation_id,
  sender_id,
  content,
  post_id,
  client_temp_id,
  delivered_at,
  read_at,
  created_at,
  message_reactions ( emoji, user_id )
`;

export const DM_SEND_TIMEOUT_MS = 12_000;
