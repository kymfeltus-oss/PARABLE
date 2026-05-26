/** Home feed skeleton — matches `SanctuaryHomeFeed` layout during server prefetch. */
export default function MySanctuaryHomeLoadingSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#01040A] pb-20">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-4 pt-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex gap-4 overflow-hidden rounded-2xl border border-[#06111E] bg-[#06111E] p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`story-${i}`} className="flex min-w-[76px] shrink-0 flex-col items-center gap-2">
                <div className="h-14 w-14 rounded-full bg-[#0f172a]" />
                <div className="h-2 w-12 rounded bg-[#0f172a]" />
              </div>
            ))}
          </div>

          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={`post-${i}`}
              className="overflow-hidden rounded-2xl border border-[#06111E] bg-[#020712]"
            >
              <div className="flex items-center gap-3 border-b border-[#06111E] px-4 py-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-[#0f172a]" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-[#0f172a]" />
                  <div className="h-2 w-16 rounded bg-[#0f172a]" />
                </div>
              </div>
              <div className="aspect-[4/3] bg-[#06111E]" />
              <div className="flex gap-4 px-4 py-3">
                <div className="h-4 w-4 rounded bg-[#0f172a]" />
                <div className="h-4 w-4 rounded bg-[#0f172a]" />
                <div className="h-4 w-4 rounded bg-[#0f172a]" />
              </div>
            </div>
          ))}
        </div>

        <aside className="hidden space-y-4 lg:block">
          <div className="h-56 rounded-2xl border border-[#06111E] bg-[#020712]" />
        </aside>
      </div>
    </div>
  );
}
