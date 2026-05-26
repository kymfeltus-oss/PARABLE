import Link from "next/link";
import ParableStudioHub from "@/components/studio-hub/ParableStudioHub";

export default function StudioHubPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#030306] pb-parable-bottom pt-parable-header text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_40%_at_50%_-10%,rgba(251,191,36,0.12),transparent_50%)]" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-6">
        <Link
          href="/parables"
          className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-[#00f2ff]/70 hover:text-[#00f2ff]"
        >
          ← Parables
        </Link>
        <ParableStudioHub />
      </div>
    </div>
  );
}
