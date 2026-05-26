import { redirect } from "next/navigation";

/** Legacy path — canonical live create flow lives at `/create/live`. */
export default function LiveBroadcastPage() {
  redirect("/create/live");
}
