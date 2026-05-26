import { createBrowserClient } from '@supabase/ssr'
import { getBrowserSupabaseUrl } from '@/utils/supabase/browser-url'
import { getSupabaseConfigError, resolveSupabaseUrl } from '@/utils/supabase/resolve-url'

export { getSupabaseConfigError }

export function createClient() {
  const url = getBrowserSupabaseUrl()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return createBrowserClient(url, anonKey)
}

export function getDirectSupabaseUrl(): string {
  return resolveSupabaseUrl()
}
