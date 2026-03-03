"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PostCard from "./PostCard";
import { createClient } from "@/utils/supabase/client";

const POSTS_PER_PAGE = 20;

type FeedAuthor = {
  id: any;
  full_name: any;
  avatar_url: any;
};

type FeedPost = {
  id: any;
  content: any;
  media_url: any;
  created_at: any;
  author: FeedAuthor[];
};

export default function Feed() {
  const supabase = createClient();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadInitialPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, media_url, created_at, author:profiles(id, full_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(POSTS_PER_PAGE);

      if (error) throw error;

      const rows = (data ?? []) as FeedPost[];

      if (rows.length) {
        setPosts(rows);
        setCursor(rows[rows.length - 1].created_at as any);
        setHasMore(rows.length === POSTS_PER_PAGE);
      } else {
        setPosts([]);
        setCursor(null);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !cursor) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, media_url, created_at, author:profiles(id, full_name, avatar_url)")
        .order("created_at", { ascending: false })
        .lt("created_at", cursor)
        .limit(POSTS_PER_PAGE);

      if (error) throw error;

      const rows = (data ?? []) as FeedPost[];

      if (rows.length) {
        setPosts((prev) => [...prev, ...rows]);
        setCursor(rows[rows.length - 1].created_at as any);
        setHasMore(rows.length === POSTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, cursor, isLoading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  useEffect(() => {
    loadInitialPosts();

    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload: any) => {
          setPosts((prev) => [payload.new as FeedPost, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadInitialPosts, supabase]);

  return (
    <div className="flex flex-col gap-4">
      {posts.length === 0 && !isLoading && (
        <p className="text-gray-400 text-center mt-10">No posts yet. Be the first to share!</p>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} {...(post as any)} />
      ))}
      <div ref={sentinelRef} className="h-4" />
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border border-[#00f2ff] border-t-transparent" />
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <p className="text-gray-500 text-center py-8">No more posts</p>
      )}
    </div>
  );
}