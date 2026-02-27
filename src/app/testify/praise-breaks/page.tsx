"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Simple route that lands users on Testify with Praise Breaks selected.
 * This keeps your app feeling like a real product (shareable deep link).
 */
export default function PraiseBreaksShortcut() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/testify?tab=praise");
  }, [router]);

  return null;
}
