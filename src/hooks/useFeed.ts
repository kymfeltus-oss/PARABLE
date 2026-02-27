'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useFeed = (userId?: string) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      
      const { data } = await query;
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, [userId]);

  return { posts, loading };
};
