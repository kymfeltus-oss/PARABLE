'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import PostCard from '@/components/PostCard';
import FeedTabs from '@/components/FeedTabs';

const POSTS_PER_PAGE = 10;

export default function MySanctuary() {
  const supabase = createClient();

  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastPostTimestamp, setLastPostTimestamp] = useState<string | null>(null);
  const [feedType, setFeedType] = useState<'all' | 'following' | 'trending'>('all');

  const fetchInitialPosts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      let query = supabase
        .from('posts')
        .select('*, likes(count), comments(id, content, created_at, profiles(full_name, avatar_url)), profiles(id, full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(POSTS_PER_PAGE);

      if (feedType === 'following') {
        const { data: followedUsers } = await supabase
          .from('follows')
          .select('followee_id')
          .eq('follower_id', user.id);

        const followeeIds = followedUsers?.map(f => f.followee_id) || [];
        if (followeeIds.length === 0) {
          setDbPosts([]);
          setHasMore(false);
          return;
        }
        query = query.in('profile_id', followeeIds);
      }

      const { data: posts } = await query;

      if (posts && posts.length > 0) {
        const formattedPosts = posts.map((p: any) => ({
          ...p,
          likes_count: p.likes?.[0]?.count ?? 0,
          comments_count: p.comments?.length ?? 0,
        }));

        setDbPosts(formattedPosts);
        setLastPostTimestamp(posts[posts.length - 1].created_at);
        setHasMore(posts.length === POSTS_PER_PAGE);
      } else {
        setDbPosts([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [supabase, feedType]);

  const loadMorePosts = useCallback(async () => {
    if (!lastPostTimestamp || isLoadingMore || !hasMore) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsLoadingMore(true);
    try {
      let query = supabase
        .from('posts')
        .select('*, likes(count), comments(id, content, created_at, profiles(full_name, avatar_url)), profiles(id, full_name, avatar_url)')
        .lt('created_at', lastPostTimestamp)
        .order('created_at', { ascending: false })
        .limit(POSTS_PER_PAGE);

      if (feedType === 'following') {
        const { data: followedUsers } = await supabase
          .from('follows')
          .select('followee_id')
          .eq('follower_id', user.id);

        const followeeIds = followedUsers?.map(f => f.followee_id) || [];
        if (followeeIds.length === 0) {
          setHasMore(false);
          return;
        }
        query = query.in('profile_id', followeeIds);
      }

      const { data: newPosts } = await query;

      if (newPosts && newPosts.length > 0) {
        const formattedPosts = newPosts.map((p: any) => ({
          ...p,
          likes_count: p.likes?.[0]?.count ?? 0,
          comments_count: p.comments?.length ?? 0,
        }));

        setDbPosts(prev => [...prev, ...formattedPosts]);
        setLastPostTimestamp(newPosts[newPosts.length - 1].created_at);
        setHasMore(newPosts.length === POSTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [supabase, lastPostTimestamp, isLoadingMore, hasMore, feedType]);

  useEffect(() => {
    fetchInitialPosts();
  }, [fetchInitialPosts]);

  useEffect(() => {
    setDbPosts([]);
    setLastPostTimestamp(null);
    setHasMore(true);
    fetchInitialPosts();
  }, [feedType, fetchInitialPosts]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMorePosts]);

  return (
    <div className="w-full bg-black text-white min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <FeedTabs activeTab={feedType} onTabChange={setFeedType} />

        {dbPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dbPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onComment={(postId) => console.log('Comment:', postId)}
                onShare={(postId) => console.log('Share:', postId)}
              />
            ))}
          </div>
        )}

        {isLoadingMore && <div className="text-center py-8"><p className="text-gray-400">Loading...</p></div>}
        {!hasMore && dbPosts.length > 0 && <div className="text-center py-8"><p className="text-gray-500">No more posts</p></div>}
      </div>
    </div>
  );
}