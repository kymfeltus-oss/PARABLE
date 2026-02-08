import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

// allow Next internals + static assets
function isPublic(pathname: string) {
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }

  return /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|mjs|map|txt|woff|woff2|ttf|eot)$/.test(
    pathname
  );
}

// ✅ Next.js runs this for every request (proxy replaces middleware)
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // never block static assets (fixes /logo.svg redirect)
  if (isPublic(pathname)) return NextResponse.next();

  // always allow auth/onboarding pages
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/create-account") ||
    pathname.startsWith("/welcome")
  ) {
    return NextResponse.next();
  }

  // allow API routes (protect separately if you want)
  if (pathname.startsWith("/api")) return NextResponse.next();

  // auth gate
  const supabase = createClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
