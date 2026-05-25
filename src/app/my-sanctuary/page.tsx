import MySanctuaryHomeServer from "./MySanctuaryHomeServer";

/** Sanctuary tab — authenticated home feed (`SanctuaryHomeFeed`). */
export default function MySanctuaryPage() {
  return <MySanctuaryHomeServer loginNext="/my-sanctuary" />;
}
