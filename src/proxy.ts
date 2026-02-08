import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";

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
  if (pathname.startsWith("/create-account")) return true;
  if (pathname.startsWith("/welcome")) return true;

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

  // Create response we can attach cookies to
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  // If no valid user, send to login BEFORE page loads (no flash)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(buildLoginRedirect(req));
  }

  // Logged-in users should not be on /login
  if (pathname.startsWith("/login")) {
    const url = req.nextUrl.clone();
    url.pathname = "/my-sanctuary";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return res;
}
