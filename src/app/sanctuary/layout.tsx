/**
 * Force fresh data at the route segment so CDN / browsers are less likely to serve
 * a stale shell for /sanctuary (client page still hydrates normally).
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SanctuaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
