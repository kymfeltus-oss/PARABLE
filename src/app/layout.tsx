"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ParableGlobalLayout from "@/components/layout/ParableGlobalLayout";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

const APP_TITLE =
  process.env.NEXT_PUBLIC_APP_VARIANT === "parable-study-ai"
    ? "PARABLE Study AI"
    : "PARABLE";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const entryPages = ["/", "/welcome", "/login", "/create-account"];
  const shouldHideNav = entryPages.includes(pathname ?? "");
  const useAppShell = !shouldHideNav;

  const isSanctuaryRoute = (pathname ?? "").startsWith("/sanctuary");
  const isMySanctuaryHome = (pathname ?? "").startsWith("/my-sanctuary");

  useEffect(() => {
    document.title = APP_TITLE;
  }, []);

  const isStudyAI = process.env.NEXT_PUBLIC_APP_VARIANT === "parable-study-ai";

  return (
    <html lang="en" className={useAppShell ? "dark h-full max-h-screen overflow-hidden" : "dark"}>
      <body
        className={`${inter.className} bg-black text-white antialiased ${isStudyAI ? "variant-study-ai" : "selection:bg-[#00f2ff] selection:text-black"} ${useAppShell ? "flex h-full max-h-screen min-h-0 flex-col" : ""}`}
        data-git-sha={process.env.NEXT_PUBLIC_GIT_SHA ?? ""}
        {...(useAppShell ? { "data-app-shell": "" } : {})}
      >
        <AuthProvider>
          {useAppShell ? (
            <div className="flex h-screen min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#070708]">
              <ParableGlobalLayout>
                {isMySanctuaryHome ? (
                  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="mx-auto flex h-full min-h-0 w-full flex-1 justify-center overflow-hidden px-0 sm:px-2">
                      <div
                        className="flex h-full min-h-0 w-full min-w-0 max-w-[470px] flex-1 flex-col overflow-hidden border-x border-white/[0.07] bg-black lg:max-w-[min(100%,920px)]"
                        data-parable-app-shell
                      >
                        {children}
                      </div>
                    </div>
                  </div>
                ) : isSanctuaryRoute ? (
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="mx-auto flex min-h-0 w-full flex-1 justify-center overflow-hidden">
                      <div
                        className="flex min-h-0 w-full min-w-0 max-w-[430px] flex-1 flex-col overflow-hidden border-x border-white/[0.07] bg-black md:max-w-[480px] lg:max-w-[560px]"
                        data-parable-app-shell
                      >
                        {children}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-hide">
                    <div className="mx-auto flex min-h-0 w-full max-w-[430px] flex-col border-x border-white/[0.07] bg-black md:max-w-[480px] lg:max-w-[560px]">
                      {children}
                    </div>
                  </div>
                )}
              </ParableGlobalLayout>
              <BottomNav />
            </div>
          ) : (
            <>{children}</>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
