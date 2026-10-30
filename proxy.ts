import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./consts/session";

// Optimistic check only: it looks for the cookie, not for a valid session.
// Protected pages must also call requireUser() to verify the JWT and load the user.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/login" || pathname.startsWith("/api/auth/");
  if (isPublic || request.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Everything except Next internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
