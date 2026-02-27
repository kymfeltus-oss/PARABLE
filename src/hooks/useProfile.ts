import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

export function useProfile() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['authenticated_profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) return null;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
