const SESSION_ID = "7d4ac5";
const INGEST =
  "http://127.0.0.1:7923/ingest/97e0e67f-884b-4805-ae3c-197b09fd740e";

type AgentDebugEntry = {
  runId?: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
};

/** Browser-safe debug log (POST to ingest). No Node built-ins. */
export function agentDebugLog(entry: AgentDebugEntry): void {
  if (typeof window === "undefined") return;

  const payload = {
    sessionId: SESSION_ID,
    timestamp: Date.now(),
    ...entry,
  };

  // #region agent log
  fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION_ID,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
  // #endregion
}
