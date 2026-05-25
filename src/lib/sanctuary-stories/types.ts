export type StoryMediaType = "image" | "video";

export type StoryItem = {
  id: string;
  mediaUrl: string;
  mediaType: StoryMediaType;
  createdAt: string;
  viewed: boolean;
};

export type StoryUserGroup = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  hasUnviewed: boolean;
  stories: StoryItem[];
};

export type StoriesFeedResponse = {
  groups: StoryUserGroup[];
  currentUserId: string | null;
};

export type StoryViewPayload = {
  storyId: string;
};
