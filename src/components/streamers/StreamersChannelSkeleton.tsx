"use client";

type Props = {
  isGamerView: boolean;
  count?: number;
};

function ChannelRowSkeleton({ isGamerView }: { isGamerView: boolean }) {
  const bone = isGamerView ? "bg-[#242F37]" : "bg-[#24272c]";
  const boneDim = isGamerView ? "bg-[#242F37]/70" : "bg-[#24272c]/70";

  return (
    <div className="flex w-full animate-pulse flex-row items-center gap-3 rounded-lg p-2">
      <div className={`relative h-10 w-10 shrink-0 rounded-full ${bone}`} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className={`h-3 w-24 rounded ${bone}`} />
        <div className={`h-2 w-16 rounded ${boneDim}`} />
      </div>
      <div className={`h-2 w-8 shrink-0 rounded ${boneDim}`} />
    </div>
  );
}

/** Left-rail loading placeholders — matches Kick channel row geometry. */
export default function StreamersChannelSkeleton({ isGamerView, count = 6 }: Props) {
  return (
    <div className="space-y-1" aria-busy="true" aria-label="Loading recommended channels">
      {Array.from({ length: count }, (_, i) => (
        <ChannelRowSkeleton key={i} isGamerView={isGamerView} />
      ))}
    </div>
  );
}
