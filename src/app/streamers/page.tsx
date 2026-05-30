// Force dynamic rendering to bypass static pre-render and stale compilation passes
export const dynamic = "force-dynamic";

import StreamersPageClient from "./StreamersPageClient";

export default function StreamersPage() {
  return <StreamersPageClient />;
}
