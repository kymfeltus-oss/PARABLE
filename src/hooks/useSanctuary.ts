import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useSanctuary = (userId: string) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchPosts = async () => {
      const { data } = await supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setData(data || []);
    };
    fetchPosts();

    // 2. REALTIME: Listen for changes
    const channel = supabase.channel('sanctuary_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setData(prev => [payload.new, ...prev]);
        // Handle UPDATE/DELETE here
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { data };
};
