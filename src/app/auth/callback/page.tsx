'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { EmailOtpType } from '@supabase/supabase-js';

/**
 * Email confirmation and OAuth return URL. Exchanges ?code=, ?token_hash=, or
 * hash fragments for a session before sending the user to ?next= (default /my-sanctuary).
 * Replaces the old route handler so implicit (hash) flows work in the browser.
 */
function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [label, setLabel] = useState('Signing you in…');

  useEffect(() => {
    const run = async () => {
      const nextRaw = searchParams.get('next') || '/my-sanctuary';
      const next = nextRaw.startsWith('/') ? nextRaw : '/my-sanctuary';
      const supabase = createClient();

      const oauthError = searchParams.get('error');
      if (oauthError) {
        const desc = searchParams.get('error_description') || oauthError;
        router.replace(
          `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(desc)}`
        );
        return;
      }

      const code = searchParams.get('code');
      if (code) {
        setLabel('Confirming your account…');
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace(
            `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.message)}`
          );
          return;
        }
        router.replace(next);
        return;
      }

      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type') as EmailOtpType | null;
      if (token_hash && type) {
        setLabel('Confirming your email…');
        const { error } = await supabase.auth.verifyOtp({ type, token_hash });
        if (error) {
          router.replace(
            `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.message)}`
          );
          return;
        }
        router.replace(next);
        return;
      }

      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (hash.length > 1) {
        const h = new URLSearchParams(hash.slice(1));
        const access_token = h.get('access_token');
        const refresh_token = h.get('refresh_token');
        if (access_token && refresh_token) {
          setLabel('Signing you in…');
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) {
            router.replace(
              `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.message)}`
            );
            return;
          }
          window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
          router.replace(next);
          return;
        }
      }

      router.replace(
        `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
          'Invalid or expired link. Try signing in, or request a new confirmation email.'
        )}`
      );
    };

    void run();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-3 text-[#00f2ff] text-sm px-6 text-center">
      <div className="h-8 w-8 rounded-full border-2 border-[#00f2ff]/30 border-t-[#00f2ff] animate-spin" />
      <p>{label}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f2ff] text-sm">
          Loading…
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
