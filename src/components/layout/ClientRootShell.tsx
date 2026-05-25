"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import ParableGlobalLayout from "@/components/layout/ParableGlobalLayout";
import { shellColumnClass, shellKindFromPathname } from "@/lib/app-shell-widths";
import { AuthProvider } from "@/providers/AuthProvider";
import { MessagesProvider } from "@/providers/MessagesProvider";
import SanctuaryDebugProbe from "@/components/sanctuary-home/SanctuaryDebugProbe";

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

  const isSanctuaryRoute = (pathname ?? "").startsWith("/sanctuary");
  const isMySanctuaryHome =
    (pathname ?? "").startsWith("/my-sanctuary") ||
    (pathname ?? "").startsWith("/profile") ||
    (pathname ?? "").startsWith("/messages") ||
    (pathname ?? "").startsWith("/create") ||
    (pathname ?? "").startsWith("/live") ||
    (pathname ?? "").startsWith("/reels");
  const shellKind = shellKindFromPathname(pathname);

  useEffect(() => {
    document.title = APP_TITLE;
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
    } else {
      body.removeAttribute("data-app-shell");
    }
  }, [useAppShell]);

  return (
    <AuthProvider>
      <MessagesProvider>
        <SanctuaryDebugProbe />
      {useAppShell ? (
        <div className="flex h-screen min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#070708]">
          <ParableGlobalLayout>
            {isMySanctuaryHome ? (
              <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                <div className="mx-auto flex h-full min-h-0 w-full flex-1 justify-center overflow-hidden px-0 sm:px-2 lg:px-4">
                  <div className={shellColumnClass(shellKind)} data-parable-app-shell>
                    {children}
                  </div>
                </div>
              </div>
            ) : isSanctuaryRoute ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="mx-auto flex min-h-0 w-full flex-1 justify-center overflow-hidden px-0 sm:px-2 lg:px-4">
                  <div className={shellColumnClass(shellKind)} data-parable-app-shell>
                    {children}
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-hide">
                <div className={["mx-auto", shellColumnClass(shellKind)].join(" ")} data-parable-app-shell>
                  {children}
                </div>
              </div>
            )}
          </ParableGlobalLayout>
          <BottomNav />
        </div>
      ) : (
        children
      )}
      </MessagesProvider>
    </AuthProvider>
  );
}
