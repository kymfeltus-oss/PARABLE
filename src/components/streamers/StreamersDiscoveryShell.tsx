"use client";

import type { ReactNode } from "react";

type Props = {
  leftSidebar: ReactNode;
  centerStage: ReactNode;
  rightChat: ReactNode;
};

/**
 * Kick global discovery shell — edge-to-edge `#080a0c`, 240px · flex · 340px (lg+).
 */
export default function StreamersDiscoveryShell({ leftSidebar, centerStage, rightChat }: Props) {
  return (
    <div
      data-testid="stream-discovery-stage"
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#080a0c] font-sans text-[#f8fafc] antialiased selection:bg-[#00f2fe]/30"
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {leftSidebar}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{centerStage}</div>
        {rightChat}
      </div>
    </div>
  );
}
