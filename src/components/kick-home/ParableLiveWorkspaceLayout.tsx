"use client";

import type { ReactNode } from "react";

type Props = {
  topNav: ReactNode;
  leftSidebar: ReactNode;
  main: ReactNode;
  rightChat: ReactNode;
  mobileChat?: ReactNode;
};

/**
 * Three-column Parable Live workspace: left channels · center discovery · right chat.
 */
export default function ParableLiveWorkspaceLayout({
  topNav,
  leftSidebar,
  main,
  rightChat,
  mobileChat,
}: Props) {
  return (
    <div
      data-testid="stream-workspace"
      className="flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-[#0b0e11] font-inter text-[#e2e8f0] selection:bg-[#00f2fe]/30"
    >
      {topNav}
      <div className="flex min-h-0 flex-1 pt-14">
        {leftSidebar}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div
            data-testid="stream-center"
            className="min-h-0 flex-1 overflow-y-auto custom-scrollbar pb-[max(0px,env(safe-area-inset-bottom,0px))]"
          >
            {main}
          </div>
          {mobileChat ? <div className="shrink-0 border-t border-[#24272c] lg:hidden">{mobileChat}</div> : null}
        </div>
        {rightChat}
      </div>
    </div>
  );
}
