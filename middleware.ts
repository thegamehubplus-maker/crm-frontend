import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple middleware that enforces authentication. It reads the JWT token
 * from cookies and redirects unauthenticated users to the login page. The
 * publicPaths array enumerates routes that should be accessible without
 * authentication (e.g. the login page, built assets, and the login API).
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl;

  // Paths that can be accessed without a token
  const publicPaths = ["/login", "/_next", "/favicon.ico", "/api/auth/login"];
  if (publicPaths.some((p) => url.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Redirect to login if no token present
  if (!token) {
    const to = new URL("/login", req.url);
    return NextResponse.redirect(to);
  }
  return NextResponse.next();
}