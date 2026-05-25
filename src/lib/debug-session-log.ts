/** Debug session 3be6a2 — remove after verification */
export function debugSessionLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
) {
  // #region agent log
  fetch("http://127.0.0.1:7815/ingest/7d474b5d-acb7-46da-a8cc-4cf6e658ca33", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "3be6a2" },
    body: JSON.stringify({
      sessionId: "3be6a2",
      location,
      message,
      data,
      hypothesisId,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}
