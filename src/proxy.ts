import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

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

  // allow common static file types anywhere (prevents /logo.svg being redirected)
  if (
    pathname.match(
      /\.(?:svg|png|jpg|jpeg|webp|gif|ico|css|js|map|txt|woff|woff2|ttf|eot)$/i
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
  const pathname = req.nextUrl.pathname;

  // Never block public routes or static assets
  if (isPublic(pathname) || isApi(pathname)) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
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

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.redirect(buildLoginRedirect(req));
    }

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
}
