'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function LogoutPage() {
  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut({ scope: 'global' });
        // Clean up local app caches so the next user does not inherit prior UI state.
        window.localStorage.removeItem('parable:testimonies');
        window.localStorage.removeItem('parable:following');
        window.localStorage.removeItem('parable:custom-followers');
        window.localStorage.removeItem('parable:following-notifications');
      } catch {
        // ignore errors
      } finally {
        window.location.replace('/login?logged_out=1');
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen bg-[#010101] text-white flex items-center justify-center">
      <p className="text-xs sm:text-sm font-black uppercase tracking-[6px] text-white/50">
        Signing you out...
      </p>
    </div>
  );
}

