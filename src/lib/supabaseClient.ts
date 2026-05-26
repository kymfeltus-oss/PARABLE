import { createBrowserClient } from "@supabase/ssr";
import { getBrowserSupabaseUrl } from "@/utils/supabase/browser-url";

export function createClient() {
  const url = getBrowserSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Provide fallback empty strings to prevent the build-time crash
  return createBrowserClient(
    url || "",
    anonKey || ""
  );
}

export const supabase = createClient();