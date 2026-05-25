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
import { DEMO_PERSONAS, type DemoHomeFeedPost } from "@/lib/demo-personas";
import {
  SIMULATED_COMMENT_PHRASES,
  type ActivityActor,
  type ActivityFeedMutations,
  type ActivityNotification,
} from "@/lib/sanctuary-activity/types";

type SanctuaryActivityContextValue = {
  notifications: ActivityNotification[];
  unreadCount: number;
  markAllRead: () => void;
  triggerDemoEvent: () => void;
  registerTargetPosts: (posts: DemoHomeFeedPost[]) => void;
  registerMutations: (mutations: ActivityFeedMutations | null) => void;
};

const SanctuaryActivityContext = createContext<SanctuaryActivityContextValue | null>(null);

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

function buildNotificationId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type Props = {
  currentUserId: string | null;
  children: ReactNode;
};

export function SanctuaryActivityProvider({ currentUserId, children }: Props) {
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const targetPostsRef = useRef<DemoHomeFeedPost[]>([]);
  const mutationsRef = useRef<ActivityFeedMutations | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const simActors = useMemo<ActivityActor[]>(
    () =>
      DEMO_PERSONAS.map((p) => ({
        id: p.id,
        username: p.username,
        avatar_url: p.avatar_url,
      })),
    [],
  );

  const registerTargetPosts = useCallback(
    (posts: DemoHomeFeedPost[]) => {
      if (!currentUserId) {
        targetPostsRef.current = posts;
        return;
      }
      const ownPosts = posts.filter((p) => p.userId === currentUserId);
      targetPostsRef.current = ownPosts.length > 0 ? ownPosts : posts;
    },
    [currentUserId],
  );

  const registerMutations = useCallback((mutations: ActivityFeedMutations | null) => {
    mutationsRef.current = mutations;
  }, []);

  const pushNotification = useCallback((notification: ActivityNotification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((count) => count + 1);
  }, []);

  const runSimulation = useCallback(() => {
    const targets = targetPostsRef.current;
    const actor = pickRandom(simActors);
    const post = pickRandom(targets);
    if (!actor || !post) return;

    const isLike = Math.random() < 0.5;
    const createdAt = Date.now();

    if (isLike) {
      mutationsRef.current?.applyLike(post.id);
      pushNotification({
        id: buildNotificationId(),
        kind: "like",
        actor,
        postId: post.id,
        postMediaUrl: post.media_url,
        createdAt,
        read: false,
      });
      return;
    }

    const phrase = pickRandom([...SIMULATED_COMMENT_PHRASES]) ?? "Wow!";
    mutationsRef.current?.applyComment(post.id, phrase, actor);
    pushNotification({
      id: buildNotificationId(),
      kind: "comment",
      actor,
      postId: post.id,
      postMediaUrl: post.media_url,
      commentText: phrase,
      createdAt,
      read: false,
    });
  }, [pushNotification, simActors]);

  const scheduleNextSimulation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const delayMs = 15000 + Math.floor(Math.random() * 15001);
    timerRef.current = setTimeout(() => {
      runSimulation();
      scheduleNextSimulation();
    }, delayMs);
  }, [runSimulation]);

  useEffect(() => {
    if (!currentUserId) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    scheduleNextSimulation();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleNextSimulation, currentUserId]);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAllRead,
      triggerDemoEvent: runSimulation,
      registerTargetPosts,
      registerMutations,
    }),
    [notifications, unreadCount, markAllRead, runSimulation, registerTargetPosts, registerMutations],
  );

  return (
    <SanctuaryActivityContext.Provider value={value}>{children}</SanctuaryActivityContext.Provider>
  );
}

export function useSanctuaryActivity() {
  const ctx = useContext(SanctuaryActivityContext);
  if (!ctx) {
    throw new Error("useSanctuaryActivity must be used within SanctuaryActivityProvider");
  }
  return ctx;
}

export function useSanctuaryActivityOptional() {
  return useContext(SanctuaryActivityContext);
}
