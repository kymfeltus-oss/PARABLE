/** Dev-only client log bridge → POST /api/debug-log → .cursor/debug-7d4ac5.log */
export function debugSessionLog(payload: {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
}): void {
  if (process.env.NODE_ENV === "production") return;
  void fetch("/api/debug-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "7d4ac5",
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
}
