"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import ParableGlobalLayout from "@/components/layout/ParableGlobalLayout";
import { shellColumnClass, shellKindFromPathname } from "@/lib/app-shell-widths";
import {
  getShellProfile,
  isFullBleedRoute,
  shellUsesViewportLock,
} from "@/lib/app-shell-profiles";
import { installDevReactDevToolsGuard } from "@/lib/dev-react-devtools-guard";
import { AuthProvider } from "@/providers/AuthProvider";
import { MessagesProvider } from "@/providers/MessagesProvider";

const APP_TITLE =
  process.env.NEXT_PUBLIC_APP_VARIANT === "parable-study-ai"
    ? "PARABLE Study AI"
    : "PARABLE";

const isStudyAI = process.env.NEXT_PUBLIC_APP_VARIANT === "parable-study-ai";

export default function ClientRootShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const entryPages = ["/", "/welcome", "/login", "/create-account"];
  const shouldHideNav = entryPages.includes(pathname ?? "");
  const useAppShell = !shouldHideNav;

  const shellProfile = getShellProfile(pathname);
  const fullBleed = isFullBleedRoute(pathname);
  const viewportLock = shellUsesViewportLock(pathname);
  const shellKind = shellKindFromPathname(pathname);

  useEffect(() => {
    document.title = APP_TITLE;
    installDevReactDevToolsGuard();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("h-full", useAppShell);
    html.classList.toggle("max-h-screen", useAppShell);
    html.classList.toggle("overflow-hidden", useAppShell);

    const body = document.body;
    body.classList.toggle("flex", useAppShell);
    body.classList.toggle("h-full", useAppShell);
    body.classList.toggle("max-h-screen", useAppShell);
    body.classList.toggle("min-h-0", useAppShell);
    body.classList.toggle("flex-col", useAppShell);
    body.classList.toggle("variant-study-ai", isStudyAI);
    body.classList.toggle("selection:bg-[#00f2ff]", !isStudyAI);
    body.classList.toggle("selection:text-black", !isStudyAI);

    if (useAppShell) {
      body.setAttribute("data-app-shell", "");
      body.setAttribute("data-shell-profile", shellProfile);
    } else {
      body.removeAttribute("data-app-shell");
      body.removeAttribute("data-shell-profile");
    }
  }, [useAppShell, shellProfile]);

  function renderShellContent() {
    if (fullBleed) {
      return (
        <div
          className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden"
          data-parable-streaming-shell
        >
          {children}
        </div>
      );
    }

    if (shellProfile === "CONSTRAINED_SCROLL") {
      return (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mx-auto flex h-full min-h-0 w-full flex-1 justify-center overflow-hidden px-0 sm:px-2 lg:px-4">
            <div className={shellColumnClass(shellKind)} data-parable-app-shell>
              {children}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-hide">
        <div className={["mx-auto", shellColumnClass(shellKind)].join(" ")} data-parable-app-shell>
          {children}
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <MessagesProvider>
        {useAppShell ? (
          <div
            className={[
              "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#070708]",
              viewportLock ? "h-dvh" : "h-screen",
            ].join(" ")}
          >
            <ParableGlobalLayout>{renderShellContent()}</ParableGlobalLayout>
            <BottomNav />
          </div>
        ) : (
          children
        )}
      </MessagesProvider>
    </AuthProvider>
  );
}
