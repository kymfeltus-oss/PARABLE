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
      <div className="flex h-[100dvh] items-center justify-center bg-slate-950 text-slate-400">
        Invalid channel.
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden md:min-h-0 md:h-auto md:overflow-visible">
      <KickWatchExperience channelId={id} />
    </div>
  );
}
