export type ReelRow = import("./db-fields").ReelsDbRow;

export type ReelAuthor = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

export type ReelFeedItem = {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  audioTitle: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  author: ReelAuthor;
  isDemo?: boolean;
};

export type ReelsFeedResponse = {
  reels: ReelFeedItem[];
  currentUserId: string | null;
};

export type ReelUploadPayload = {
  caption?: string;
  audioTitle?: string;
};

export type ReelUploadProgressStep =
  | "validating"
  | "uploading"
  | "publishing"
  | "done"
  | "error";
