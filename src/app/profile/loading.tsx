import "@/styles/my-sanctuary-instagram.css";

/** Profile tab skeleton — Instagram-style layout while server data loads. */
export default function ProfileLoadingSkeleton() {
  return (
    <div className="my-sanctuary-ig min-h-full animate-pulse select-none pb-parable-bottom">
      <div className="container py-12">
        <header className="profile">
          <div className="profile-image flex justify-center">
            <div className="h-[7.7rem] w-[7.7rem] rounded-full bg-[#dbdbdb] md:h-[15.2rem] md:w-[15.2rem]" />
          </div>

          <div className="profile-user-settings space-y-4">
            <div className="h-6 w-1/3 max-w-[16rem] rounded bg-[#dbdbdb]" />
            <div className="h-8 w-28 rounded border border-[#dbdbdb] bg-[#efefef]" />
          </div>

          <div className="profile-stats">
            <ul className="flex gap-6 md:gap-8">
              <li className="h-4 w-16 rounded bg-[#dbdbdb]" />
              <li className="h-4 w-20 rounded bg-[#dbdbdb]" />
              <li className="h-4 w-20 rounded bg-[#dbdbdb]" />
            </ul>
          </div>

          <div className="profile-bio space-y-2">
            <div className="h-3 w-3/4 max-w-md rounded bg-[#dbdbdb]" />
            <div className="h-3 w-1/2 max-w-xs rounded bg-[#efefef]" />
          </div>
        </header>

        <nav className="profile-tabs mt-4">
          <div className="profile-tabs-list border-t border-[#dbdbdb] pt-4">
            <div className="h-3 w-12 rounded bg-[#dbdbdb]" />
            <div className="h-3 w-12 rounded bg-[#efefef]" />
            <div className="h-3 w-14 rounded bg-[#efefef]" />
          </div>
        </nav>

        <div className="mt-8 space-y-12">
          <section aria-hidden="true">
            <div className="mb-4 h-3 w-28 rounded bg-[#dbdbdb]" />
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`posts-${i}`} className="aspect-square rounded bg-[#efefef] ring-1 ring-[#dbdbdb]" />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
