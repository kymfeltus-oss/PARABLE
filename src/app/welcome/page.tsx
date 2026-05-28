"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ParableCinematicIntro from "@/components/intro/ParableCinematicIntro";
import { createClient } from "@/utils/supabase/client";

/**
 * PARABLE cinematic intro — visual layer only.
 * Auth routing for ENTER is unchanged (session → My Sanctuary, else create-account).
 */
export default function WelcomePage() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  const handleEnter = async () => {
    if (entering) return;
    setEntering(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      router.push(session?.user ? "/my-sanctuary" : "/create-account");
    } catch {
      router.push("/create-account");
    } finally {
      setTimeout(() => setEntering(false), 650);
    }
  };

  return (
    <ParableCinematicIntro
      onEnter={() => void handleEnter()}
      entering={entering}
    />
  );
}
