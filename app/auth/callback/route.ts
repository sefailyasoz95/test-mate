import { createServer } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  console.log("=== Auth Callback Debug ===");
  console.log("1. Full request URL:", request.url);
  console.log("2. APP_URL value:", process.env.NEXT_PUBLIC_APP_URL);
  console.log("3. Origin:", request.headers.get("origin"));
  console.log("4. Referer:", request.headers.get("referer"));

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
      console.error("5. Exchange error:", error);
      return NextResponse.redirect(`${APP_URL}/auth-error`);
    }

    console.log("Code exchange successful, getting session...");
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("6. Session established:", !!session);
    console.log("7. Redirecting to:", `${APP_URL}/dashboard`);

    const response = NextResponse.redirect(`${APP_URL}/dashboard`);

    // Log cookies being set
    const supabaseCookies = request.cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-"));
    console.log(
      "8. Auth cookies:",
      supabaseCookies.map((c) => c.name)
    );

    for (const cookie of supabaseCookies) {
      response.cookies.set(cookie.name, cookie.value, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("9. Callback error:", error);
    return NextResponse.redirect(`${APP_URL}/auth-error`);
  }
}
