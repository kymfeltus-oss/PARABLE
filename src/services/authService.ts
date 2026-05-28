import { createClient } from '@/utils/supabase/client'; 

export const handleFlashNavigation = async () => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session ? "/hub" : "/";
  } catch (error) {
    console.error("Auth Failure:", error);
    return "/"; // Default fallback so the app doesn't crash
  }
};