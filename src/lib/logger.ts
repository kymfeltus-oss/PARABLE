// src/lib/logger.ts

import type { ErrorInfo } from "react";

interface ErrorLogPayload {
  message: string;
  url?: string;
  componentStack?: string;
  userId?: string;
  timestamp: string;
}

/**
 * Sends runtime application exceptions safely to your logging endpoint (Axiom/Sentry)
 */
export async function logProductionError(
  error: Error,
  errorInfo?: ErrorInfo,
  userId?: string,
) {
  const payload: ErrorLogPayload = {
    message: error.message || "Unknown runtime exception captured.",
    url: typeof window !== "undefined" ? window.location.href : undefined,
    componentStack: errorInfo?.componentStack ?? undefined,
    userId: userId,
    timestamp: new Date().toISOString(),
  };

  // Log locally in development mode for easier debugging paths
  if (process.env.NODE_ENV === "development") {
    console.error("[DEVELOPMENT LOGGER CAPTURE]:", payload);
    return;
  }

  try {
    // Send asynchronously to prevent blocking the UI layout threads
    await fetch("/api/logs/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (logErr) {
    console.error("Logging endpoint execution pipeline failed:", logErr);
  }
}
