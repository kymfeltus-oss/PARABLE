import { isLikelySupabaseApiUrl, resolveSupabaseUrl } from '@/utils/supabase/resolve-url'

/**
 * In development, route browser Supabase traffic through Next (`/supabase-proxy` → project URL)
 * so sign-in works when extensions, DNS, or TLS block direct requests to *.supabase.co.
 *
 * Server code should keep using resolveSupabaseUrl() (no relay).
 */
export function getBrowserSupabaseUrl(): string {
  const direct = resolveSupabaseUrl()
  if (typeof window === 'undefined') return direct
  if (!shouldUseBrowserRelay()) return direct
  if (!isLikelySupabaseApiUrl(direct)) return direct
  return `${window.location.origin}/supabase-proxy`
}

export function shouldUseBrowserRelay(): boolean {
  if (process.env.NEXT_PUBLIC_SUPABASE_BROWSER_RELAY === '1') return true
  if (process.env.NEXT_PUBLIC_SUPABASE_BROWSER_RELAY === '0') return false
  return process.env.NODE_ENV === 'development'
}
