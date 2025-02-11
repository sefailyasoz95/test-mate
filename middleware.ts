import { createMiddleware } from "@/lib/supabase/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("Middleware starting, path:", req.nextUrl.pathname);
  console.log(
    "Cookies present:",
    req.cookies.getAll().map((c) => c.name)
  );

  // Skip middleware for auth-related paths
  if (
    req.nextUrl.pathname.startsWith("/auth/") ||
    req.nextUrl.pathname === "/auth-error"
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = await createMiddleware({ cookies: () => req.cookies });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("Session check result:", session ? "Found" : "Not found");

    if (session) {
      if (req.nextUrl.pathname === "/") {
        console.log("Redirecting to dashboard - user is logged in");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } else {
      if (req.nextUrl.pathname.startsWith("/dashboard")) {
        console.log("Redirecting to home - user is not logged in");
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
