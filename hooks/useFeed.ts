import { useInfiniteQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

export function useFeed() {
  const supabase = createClient();

  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(pageParam ? (pageParam as any).start : 0, pageParam ? (pageParam as any).end : 9);

      if (error) throw error;
      return data;
    },
    initialPageParam: { start: 0, end: 9 },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 10) return null;
      const nextStart = allPages.length * 10;
      return { start: nextStart, end: nextStart + 9 };
    },
  });
}
