"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SanctuaryActivityProvider } from "@/providers/SanctuaryActivityProvider";
import { debugSessionLog } from "@/lib/debug-session-log";

export default function MySanctuaryLayoutClient({ children }: { children: ReactNode }) {
  const { userProfile, loading } = useAuth();
  const userId = userProfile?.id;
  const prevBranchRef = useRef<string | null>(null);

  const branch = loading ? "auth-loading" : !userId ? "no-user" : "with-provider";

  useEffect(() => {
    if (prevBranchRef.current === branch) return;
    debugSessionLog(
      "MySanctuaryLayoutClient:branch",
      "layout branch changed",
      { branch, loading, hasUserId: Boolean(userId) },
      "H-B",
    );
    prevBranchRef.current = branch;
  }, [branch, loading, userId]);

  useEffect(() => {
    debugSessionLog("MySanctuaryLayoutClient:mount", "layout client mounted", {}, "H-D");
    return () => {
      debugSessionLog("MySanctuaryLayoutClient:unmount", "layout client unmounting", {}, "H-D");
    };
  }, []);

  return (
    <SanctuaryActivityProvider currentUserId={userId ?? null}>
      {children}
    </SanctuaryActivityProvider>
  );
}
