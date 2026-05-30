// Keep sanctuary subtree off the static generation path
export const dynamic = "force-dynamic";

import MySanctuaryLayoutClient from "./MySanctuaryLayoutClient";

export default function MySanctuaryLayout({ children }: { children: React.ReactNode }) {
  return <MySanctuaryLayoutClient>{children}</MySanctuaryLayoutClient>;
}
