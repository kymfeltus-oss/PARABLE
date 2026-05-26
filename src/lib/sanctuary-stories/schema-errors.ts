/** True when stories tables are not deployed yet (safe to fall back to demo tray). */
export function isStoriesSchemaUnavailable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  const code = error.code ?? "";
  if (code === "42P01" || code === "PGRST205" || code === "PGRST200") return true;
  return (
    msg.includes("stories") &&
    (msg.includes("does not exist") ||
      msg.includes("schema cache") ||
      msg.includes("could not find") ||
      msg.includes("relation"))
  );
}

export const STORIES_SCHEMA_SETUP_HINT =
  "Run supabase/schema-stories.sql in the Supabase SQL Editor to enable story uploads.";
