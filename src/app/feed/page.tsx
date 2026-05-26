import { redirect } from "next/navigation";

/** Removed — Sanctuary (social feed) lives at `/sanctuary`. */
export default function LegacyFeedRedirect() {
  redirect("/sanctuary");
}
