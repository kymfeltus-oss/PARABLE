/** Dev-only: suppress known React DevTools + React 19 Suspense instrumentation noise. */
const MARKERS = [
  "cleaning up async info",
  "Suspense boundary",
  "React instrumentation encountered an error",
] as const;

let installed = false;
let noticeShown = false;

export function isReactDevToolsSuspenseNoise(text: string): boolean {
  return MARKERS.some((marker) => text.includes(marker));
}

function formatConsoleArgs(args: unknown[]): string {
  return args.map((arg) => (typeof arg === "string" ? arg : String(arg))).join(" ");
}

export function installDevReactDevToolsGuard(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const text = formatConsoleArgs(args);
    if (isReactDevToolsSuspenseNoise(text)) {
      if (!noticeShown) {
        noticeShown = true;
        console.info(
          "[PARABLE dev] Suppressed a known React DevTools instrumentation warning (harmless in dev). Update or disable the React DevTools extension to avoid it entirely.",
        );
      }
      return;
    }
    originalError.apply(console, args);
  };

  window.addEventListener(
    "error",
    (event) => {
      const message = event.message ?? "";
      if (!isReactDevToolsSuspenseNoise(message)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
}
