import MySanctuaryPublicProfileServer from "@/app/my-sanctuary/MySanctuaryPublicProfileServer";

type Props = {
  params: Promise<{ userId: string }>;
};

/** Public sanctuary profile — Instagram layout. Accepts UUID or username (e.g. `/profile/pastor_james`). */
export default async function ProfileByHandlePage({ params }: Props) {
  const { userId } = await params;
  return (
    <MySanctuaryPublicProfileServer
      handle={userId}
      loginNext={`/profile/${encodeURIComponent(userId)}`}
    />
  );
}
