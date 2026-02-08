import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Replace these with your actual Supabase URL and Anon Key
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}