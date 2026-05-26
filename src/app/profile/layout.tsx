import MySanctuaryLayoutClient from "@/app/my-sanctuary/MySanctuaryLayoutClient";

/** Keeps sanctuary activity provider available on profile tab navigation. */
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <MySanctuaryLayoutClient>{children}</MySanctuaryLayoutClient>;
}
