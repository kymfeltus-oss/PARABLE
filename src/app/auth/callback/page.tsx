"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const finishAuth = async () => {
      // This forces Supabase to hydrate the session after email verification
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace("/my-sanctuary");
      } else {
        // fallback (rare but safe)
        router.replace("/login");
      }
    };

    finishAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="text-[11px] font-black uppercase tracking-[4px] text-[#00f2fe]">
          Finalizing Access
        </div>
        <div className="mt-3 text-sm text-white/70 italic">
          Preparing your sanctuary…
        </div>
      </div>
    </div>
  );
}
