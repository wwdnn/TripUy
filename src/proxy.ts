import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";





// =============================================================================
const PROTECTED_PREFIXES: readonly string[] = ["/dashboard", "/trips"];
const GUEST_ONLY_PREFIXES: readonly string[] = ["/login", "/register"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}






// =============================================================================
export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = sessionCookie !== null;

  if (isAuthenticated && isGuestOnlyPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!isAuthenticated && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/trips/:path*", "/login", "/register"],
};

export { PROTECTED_PREFIXES, GUEST_ONLY_PREFIXES };
