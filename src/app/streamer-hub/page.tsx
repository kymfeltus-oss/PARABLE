// Force dynamic rendering to bypass static pre-render and stale compilation passes
export const dynamic = "force-dynamic";

import StreamerHubPageClient from "./StreamerHubPageClient";

export default function StreamerHubPage() {
  return <StreamerHubPageClient />;
}
