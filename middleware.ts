import { createMiddleware } from "@/lib/supabase/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const cookieStore = req.cookies;
	const supabase = await createMiddleware({ cookies: () => cookieStore });

	try {
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		// Add debug information to response headers
		res.headers.set("x-middleware-cache", "no-cache");
		res.headers.set("x-debug-session", session ? "exists" : "none");
		res.headers.set("x-debug-url", req.nextUrl.pathname);

		// Handle auth errors gracefully
		if (error) {
			if (!req.nextUrl.pathname.startsWith("/dashboard")) {
				return res;
			}
			return NextResponse.redirect(new URL("/", req.url));
		}

		// Skip auth check for auth callback
		if (req.nextUrl.pathname.startsWith("/auth/callback")) {
			return res;
		}

		// Protect dashboard routes
		if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
			return NextResponse.redirect(new URL("/", req.url));
		}

		// Redirect authenticated users from landing page to dashboard
		if (session && req.nextUrl.pathname === "/") {
			return NextResponse.redirect(new URL("/dashboard", req.url));
		}

		return res;
	} catch (error) {
		console.error("Middleware error:", error);
		// Clear auth cookies on error
		res.cookies.delete("sb-access-token");
		res.cookies.delete("sb-refresh-token");

		if (!req.nextUrl.pathname.startsWith("/dashboard")) {
			return res;
		}
		return NextResponse.redirect(new URL("/", req.url));
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
