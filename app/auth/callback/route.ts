import { createServer } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  console.log("Auth callback started, URL:", request.url);

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // If there's an error in the URL, log it and redirect to error page
  if (error) {
    console.error("Auth error:", error, errorDescription);
    return NextResponse.redirect(`${APP_URL}/auth-error`);
  }

  if (!code) {
    console.log("No code found in URL");
    return NextResponse.redirect(`${APP_URL}/auth-error`);
  }

  try {
    console.log("Creating Supabase client...");
    const supabase = await createServer({ cookies: () => request.cookies });

    console.log("Exchanging code for session...");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Exchange error:", error);
      return NextResponse.redirect(`${APP_URL}/auth-error`);
    }

    console.log("Code exchange successful, getting session...");
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error("No session found after exchange");
      return NextResponse.redirect(`${APP_URL}/auth-error`);
    }

    console.log("Session established, redirecting to dashboard...");
    const response = NextResponse.redirect(`${APP_URL}/dashboard`);

    // Copy auth cookies to the response
    const supabaseCookies = request.cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-"));

    for (const cookie of supabaseCookies) {
      response.cookies.set(cookie.name, cookie.value, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(`${APP_URL}/auth-error`);
  }
}
