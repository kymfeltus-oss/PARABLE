import { createClient } from '@/utils/supabase/client'; 

export const handleFlashNavigation = async () => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session ? "/hub" : "/welcome";
  } catch (error) {
    console.error("Auth Failure:", error);
    return "/welcome"; // Default fallback so the app doesn't crash
  }
};