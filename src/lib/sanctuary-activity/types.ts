export type ActivityKind = "like" | "comment";

export type ActivityActor = {
  id: string;
  username: string;
  avatar_url: string;
};

export type ActivityNotification = {
  id: string;
  kind: ActivityKind;
  actor: ActivityActor;
  postId: string;
  postMediaUrl: string;
  commentText?: string;
  createdAt: number;
  read: boolean;
};

export type ActivityFeedMutations = {
  applyLike: (postId: string) => void;
  applyComment: (postId: string, text: string, actor: ActivityActor) => void;
};

export type ActivityNavIntent = {
  postId: string;
  openComments: boolean;
};

export const SANCTUARY_ACTIVITY_NAV_KEY = "sanctuary:activity-nav";

export const SIMULATED_COMMENT_PHRASES = [
  "Wow!",
  "Clean layout!",
  "Amazing work!",
  'This looks incredible! 🔥',
  "So good!",
  "Love this energy!",
  "Powerful message 🙌",
  "Needed this today!",
] as const;
