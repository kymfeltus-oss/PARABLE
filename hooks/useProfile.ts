import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

export function useProfile() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['authenticated_profile'],
    queryFn: async () => {
      // Get the current logged-in user from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Fetch their specific profile details
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }
      
      return data;
    },
    // Keep the profile data fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
  });
}
