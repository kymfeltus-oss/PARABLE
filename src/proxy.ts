import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isParableDevGuestAllowed } from "@/lib/parable-dev-guest";
import { resolveSupabaseUrl } from "@/utils/supabase/resolve-url";

const PROXY_DEBUG_INGEST =
  "http://127.0.0.1:7923/ingest/97e0e67f-884b-4805-ae3c-197b09fd740e";

function proxyDebugLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
): void {
  // #region agent log
  fetch(PROXY_DEBUG_INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "7d4ac5",
    },
    body: JSON.stringify({
      sessionId: "7d4ac5",
      runId: "post-fix-4",
      hypothesisId: "H3",
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

/**
 * IMPORTANT:
 * - This proxy runs before pages load (prevents login "flash")
 * - Must ALWAYS allow Next internals + static assets (logo.svg issue)
 */
function isPublic(pathname: string) {
  // Next internals + static
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/robots")) return true;
  if (pathname.startsWith("/sitemap")) return true;
  // Dev browser relay → Supabase (must not redirect to /login or responses become HTML)
  if (pathname.startsWith("/supabase-proxy")) return true;

  // allow common static file types anywhere (prevents /logo.svg being redirected)
  if (
    pathname.match(
      /\.(?:svg|png|jpg|jpeg|webp|gif|ico|css|js|map|txt|woff|woff2|ttf|eot|mp4|webm)$/i,
    )
  ) {
    return true;
  }

  // public routes
  if (pathname === "/") return true;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/auth/callback")) return true;
  if (pathname.startsWith("/create-account")) return true;
  if (pathname.startsWith("/welcome")) return true;
  if (pathname.startsWith("/logout")) return true;

  // public creator pages (logged-out users can view)
  if (pathname.startsWith("/creator")) return true;

  // streaming discovery + watch (guest browse; premium actions gated in UI)
  if (pathname.startsWith("/streamers")) return true;
  if (pathname.startsWith("/streamer-hub")) return true;
  if (pathname.startsWith("/watch")) return true;
  if (pathname === "/stream" || pathname.startsWith("/stream/")) return true;
  if (pathname.startsWith("/live-studio")) return true;

  if (pathname.startsWith("/parables")) return true;
  if (pathname.startsWith("/writers-hub")) return true;
  if (pathname.startsWith("/studio-hub")) return true;

  return false;
}

function isApi(pathname: string) {
  return pathname.startsWith("/api");
}

function buildLoginRedirect(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return url;
}

// ✅ Next.js will run either default export or named `proxy`
export default async function proxy(req: NextRequest) {
  const proxyT0 = Date.now();
  try {
    const pathname = req.nextUrl.pathname;
    const publicRoute = isPublic(pathname) || isApi(pathname);

    // Never block public routes or static assets
    if (publicRoute) {
      // #region agent log
      proxyDebugLog("proxy.ts:public-skip", "proxy skipped auth", {
        pathname,
        ms: Date.now() - proxyT0,
        publicRoute: true,
      });
      // #endregion
      return NextResponse.next();
    }

    if (isParableDevGuestAllowed(req)) {
      return NextResponse.next();
    }

    const url = resolveSupabaseUrl().trim();
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !anon) {
      // Avoid throwing in middleware (would surface as Internal Server Error)
      return NextResponse.next();
    }

    let res = NextResponse.next();

    try {
      const supabase = createServerClient(url, anon, {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            res.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            res.cookies.set({ name, value: "", ...options, maxAge: 0 });
          },
        },
      });

      // Prefer getSession() for routing gates — reads JWT from cookies without a round-trip getUser() call.
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        // #region agent log
        proxyDebugLog("proxy.ts:redirect-login", "proxy redirect unauthenticated", {
          pathname,
          ms: Date.now() - proxyT0,
        });
        // #endregion
        return NextResponse.redirect(buildLoginRedirect(req));
      }

      // #region agent log
      proxyDebugLog("proxy.ts:session-ok", "proxy session gate passed", {
        pathname,
        ms: Date.now() - proxyT0,
      });
      // #endregion

      if (pathname.startsWith("/login")) {
        const nextUrl = req.nextUrl.clone();
        nextUrl.pathname = "/my-sanctuary";
        nextUrl.search = "";
        return NextResponse.redirect(nextUrl);
      }
    } catch {
      return NextResponse.next();
    }

    return res;
  } catch {
    return NextResponse.next();
  }
}
