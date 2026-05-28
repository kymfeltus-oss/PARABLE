"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ParableCinematicIntro from "@/components/intro/ParableCinematicIntro";
import { createClient } from "@/utils/supabase/client";
import StudyAIFlash from "./StudyAIFlash";

/**
 * App entry — cinematic MP4 flash intro at `/`.
 * ENTER → My Sanctuary (session) or create-account.
 */
export default function FlashPage() {
  if (process.env.NEXT_PUBLIC_APP_VARIANT === "parable-study-ai") {
    return <StudyAIFlash />;
  }
  return <ParableFlashIntro />;
}

function ParableFlashIntro() {
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
