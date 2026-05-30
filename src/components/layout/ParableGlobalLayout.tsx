"use client";

import { usePathname } from "next/navigation";
import ParableGlobalHeader from "@/components/navigation/ParableGlobalHeader";
import { getShellProfile, shouldHideGlobalTopStack } from "@/lib/app-shell-profiles";
import { GlobalPulseProvider } from "@/providers/GlobalPulseProvider";

/**
 * Global in-app shell: optional top header → profile-aware main workspace.
 * `FULL_BLEED` (streaming / watch / stream) drops header and max-width constraints.
 */
export default function ParableGlobalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const profile = getShellProfile(pathname);
  const fullBleed = profile === "FULL_BLEED";
  const hideGlobalTopStack = shouldHideGlobalTopStack(pathname);

  return (
    <GlobalPulseProvider>
      <div
        className={[
          "flex min-h-0 min-w-0 flex-1 flex-col",
          fullBleed
            ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0b0e11]"
            : "",
        ].join(" ")}
      >
        {!hideGlobalTopStack ? (
          <div className="flex min-w-0 shrink-0 flex-col">
            <ParableGlobalHeader />
          </div>
        ) : null}
        <main
          data-parable-shell-profile={profile}
          className={[
            "relative flex min-h-0 min-w-0 flex-1 flex-col",
            fullBleed ? "h-full w-full overflow-hidden" : "overflow-hidden",
          ].join(" ")}
        >
          {children}
        </main>
      </div>
    </GlobalPulseProvider>
  );
}
