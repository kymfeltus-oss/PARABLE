/** True when reels tables are not deployed yet (safe to fall back to demo feed). */
export function isReelsSchemaUnavailable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  const code = error.code ?? "";
  if (code === "42P01" || code === "PGRST205" || code === "PGRST200") return true;
  return (
    (msg.includes("reels") || msg.includes("reel_views")) &&
    (msg.includes("does not exist") ||
      msg.includes("schema cache") ||
      msg.includes("could not find") ||
      msg.includes("relation"))
  );
}

export { REELS_SCHEMA_SETUP_HINT } from "./constants";
