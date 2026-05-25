import MySanctuaryProfileServer from "@/app/my-sanctuary/MySanctuaryProfileServer";

/** Profile tab — Instagram-style sanctuary profile (canonical URL). */
export default function ProfilePage() {
  return <MySanctuaryProfileServer loginNext="/profile" />;
}
