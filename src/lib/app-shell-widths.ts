/**
 * Responsive widths for the in-app shell so mobile uses full width while
 * laptop/desktop expands (no permanent “phone column” on large screens).
 */

export type ShellColumnKind = "default" | "sanctuary" | "mySanctuary";

/** Main content column: borders + max-width by route kind */
export function shellKindFromPathname(pathname: string | null | undefined): ShellColumnKind {
  const p = pathname ?? "";
  if (p.startsWith("/my-sanctuary")) return "mySanctuary";
  if (p.startsWith("/sanctuary")) return "sanctuary";
  return "default";
}

export function shellColumnClass(kind: ShellColumnKind): string {
  const base =
    "flex w-full min-h-0 min-w-0 flex-col border-x border-white/[0.07] bg-black";

  switch (kind) {
    case "mySanctuary":
      return [
        base,
        "h-full flex-1 overflow-hidden",
        "max-w-full",
        "lg:max-w-[min(100%,1200px)] xl:max-w-[min(100%,1320px)]",
      ].join(" ");
    case "sanctuary":
      return [
        base,
        "h-full flex-1 overflow-hidden",
        "max-w-full",
        "sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl",
      ].join(" ");
    default:
      return [base, "min-h-0", "max-w-full", "lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl"].join(" ");
  }
}

/** Bottom nav inner — same horizontal bounds as the content column */
export function shellBottomNavInnerClass(kind: ShellColumnKind): string {
  const pad = "w-full px-2 sm:px-3 lg:px-4";
  switch (kind) {
    case "mySanctuary":
      return `${pad} max-w-full lg:max-w-[min(100%,1200px)] xl:max-w-[min(100%,1320px)] mx-auto`;
    case "sanctuary":
      return `${pad} max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto`;
    default:
      return `${pad} max-w-full lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto`;
  }
}

/** Main header inner row — aligns with content column */
export function shellHeaderInnerClass(kind: ShellColumnKind): string {
  const pad = "flex w-full items-center justify-between gap-3 px-4 sm:px-5";
  switch (kind) {
    case "mySanctuary":
      return `${pad} max-w-full lg:max-w-[min(100%,1200px)] xl:max-w-[min(100%,1320px)] mx-auto`;
    case "sanctuary":
      return `${pad} max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto`;
    default:
      return `${pad} max-w-full lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto`;
  }
}
