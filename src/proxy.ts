import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

// Allow public assets + public routes
function isPublic(pathname: string) {
  // ✅ static assets must be public (this fixes /logo.svg redirect)
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml")
  ) return true;

  // Any file in /public (logo.svg, png, jpg, css, etc.)
  if (/\.(svg|png|jpg|jpeg|webp|gif|ico|css|js|map|txt|woff|woff2|ttf|eot)$/.test(pathname)) {
    return true;
  }

  // ✅ public pages
  if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/create-account") || pathname.startsWith("/welcome")) {
    return true;
  }

  // ✅ public API routes (if any)
  if (pathname.startsWith("/api/")) return true;

  return false;
}

// IMPORTANT: Next.js runs this for each request
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  // Auth check
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
