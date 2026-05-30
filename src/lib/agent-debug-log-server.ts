import "server-only";
import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";

const SESSION_ID = "7d4ac5";

type AgentDebugEntry = {
  runId?: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
};

/** Server-only NDJSON append for debug session `7d4ac5`. */
export function agentDebugLogServer(entry: AgentDebugEntry): void {
  const payload = {
    sessionId: SESSION_ID,
    timestamp: Date.now(),
    ...entry,
  };
  try {
    const dir = join(process.cwd(), ".cursor");
    mkdirSync(dir, { recursive: true });
    appendFileSync(join(dir, "debug-7d4ac5.log"), `${JSON.stringify(payload)}\n`);
  } catch {
    /* ignore */
  }
}
