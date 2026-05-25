"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { debugSessionLog } from "@/lib/debug-session-log";

function isSuspenseDevToolsMessage(text: string): boolean {
  return text.includes("cleaning up async info") || text.includes("Suspense boundary");
}

/** Captures route transitions and runtime errors for debug session 3be6a2. */
export default function SanctuaryDebugProbe() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const prev = prevPathRef.current;
    if (prev !== pathname) {
      debugSessionLog(
        "SanctuaryDebugProbe:route",
        "pathname changed",
        { from: prev, to: pathname, runId: "post-fix-3" },
        "H-C",
      );
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    const logRuntimeSignal = (
      source: string,
      text: string,
      hypothesisId: string,
      stack?: string,
    ) => {
      debugSessionLog(
        "SanctuaryDebugProbe:runtime",
        "runtime signal captured",
        {
          source,
          text: text.slice(0, 320),
          fromDevTools: Boolean(stack?.includes("installHook.js")),
          pathname: pathnameRef.current,
          runId: "post-fix-3",
        },
        hypothesisId,
      );
    };

    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const text = args.map((a) => (typeof a === "string" ? a : String(a))).join(" ");
      const stack = new Error().stack ?? "";
      if (isSuspenseDevToolsMessage(text)) {
        logRuntimeSignal("console.error", text, "H-A", stack);
      } else if (text.includes("Error") || text.includes("error")) {
        logRuntimeSignal("console.error", text, "H-runtime", stack);
      }
      originalError.apply(console, args);
    };

    const onWindowError = (event: ErrorEvent) => {
      const stack = event.error instanceof Error ? event.error.stack : undefined;
      const hypothesisId = isSuspenseDevToolsMessage(event.message ?? "") ? "H-A" : "H-runtime";
      logRuntimeSignal("window.error", event.message ?? "", hypothesisId, stack);
    };

    window.addEventListener("error", onWindowError);

    return () => {
      console.error = originalError;
      window.removeEventListener("error", onWindowError);
    };
  }, []);

  return null;
}
