"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SanctuaryActivityProvider } from "@/providers/SanctuaryActivityProvider";

export default function MySanctuaryLayoutClient({ children }: { children: ReactNode }) {
  const { userProfile } = useAuth();
  const userId = userProfile?.id;

  return (
    <SanctuaryActivityProvider currentUserId={userId ?? null}>
      {children}
    </SanctuaryActivityProvider>
  );
}
