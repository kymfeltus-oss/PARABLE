"use client";

/**
 * Instagram-clone search row — PARABLE tokens: cyber border, Inter, dark field.
 */
export default function SearchBar({
  placeholder = "Search",
  className = "",
  variant = "dark",
}: {
  placeholder?: string;
  className?: string;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={[
          "pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2",
          isLight ? "text-[#8e8e8e]" : "text-[#00f2ff]/45",
        ].join(" ")}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        name="sanctuary-search"
        placeholder={placeholder}
        className={
          isLight
            ? "h-9 w-full rounded-lg border border-transparent bg-[#efefef] py-2 pl-10 pr-3 text-sm text-[#262626] placeholder:text-[#8e8e8e] focus:border-[#dbdbdb] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#dbdbdb]"
            : "h-9 w-full rounded-md border border-[#00f2ff]/25 bg-black/50 py-2 pl-10 pr-3 font-sans text-sm text-white placeholder:text-white/35 focus:border-[#00f2ff]/50 focus:outline-none focus:ring-2 focus:ring-[#00f2ff]/15"
        }
        autoComplete="off"
      />
    </div>
  );
}
