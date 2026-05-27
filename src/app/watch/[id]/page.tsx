"use client";

import { useParams } from "next/navigation";
import KickWatchExperience from "@/components/kick-home/KickWatchExperience";

export default function WatchChannelPage() {
  const params = useParams();
  const raw = params?.id;
  const id =
    typeof raw === "string" ? raw : Array.isArray(raw) && raw[0] ? raw[0] : "";

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-slate-400">
        Invalid channel.
      </div>
    );
  }

  return <KickWatchExperience channelId={id} />;
}
