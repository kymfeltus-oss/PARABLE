import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/welcome",
  "/create-account",
];

const PUBLIC_FILE = /\.(.*)$/; // allows .svg, .png, .css, .js, etc

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow static files (logo, images, fonts, etc)
  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  // ✅ Allow Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // ✅ Allow public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 🔐 Everything else requires auth
  const isLoggedIn = req.cookies.has("sb-rmerwwmamddqrqtxvkrx-auth-token");

  if (!isLoggedIn) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
