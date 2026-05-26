import MySanctuaryLayoutClient from "./MySanctuaryLayoutClient";

export default function MySanctuaryLayout({ children }: { children: React.ReactNode }) {
  return <MySanctuaryLayoutClient>{children}</MySanctuaryLayoutClient>;
}
