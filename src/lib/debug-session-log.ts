const INGEST =
  "http://127.0.0.1:7923/ingest/97e0e67f-884b-4805-ae3c-197b09fd740e";

/** Debug-mode client log bridge → local ingest + dev /api/debug-log */
export function debugSessionLog(payload: {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
}): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    sessionId: "7d4ac5",
    timestamp: Date.now(),
    ...payload,
  });
  // #region agent log
  void fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "7d4ac5",
    },
    body,
  }).catch(() => {});
  // #endregion
  if (process.env.NODE_ENV === "production") return;
  void fetch("/api/debug-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  }).catch(() => {});
}
