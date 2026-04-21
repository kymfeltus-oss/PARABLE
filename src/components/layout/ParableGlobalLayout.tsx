"use client";

import GlobalPulseTicker from "@/components/GlobalPulseTicker";
import MainHeader from "@/components/MainHeader";
import { GlobalPulseProvider } from "@/providers/GlobalPulseProvider";

/**
 * Global in-app shell (same role as a root `App.tsx` in CRA): top stack is
 * `GlobalPulseTicker` (z-index 100) → `MainHeader` → scrollable `children`.
 */
export default function ParableGlobalLayout({ children }: { children: React.ReactNode }) {
  return (
    <GlobalPulseProvider>
      <div className="flex min-w-0 shrink-0 flex-col">
        <GlobalPulseTicker />
        <MainHeader />
      </div>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </GlobalPulseProvider>
  );
}
