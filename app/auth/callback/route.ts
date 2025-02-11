import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // If there's an error in the URL, log it and redirect to error page
  if (error) {
    console.error("Auth error:", error, errorDescription);
    return NextResponse.redirect(`${APP_URL}/auth-error`);
  }

  if (code) {
    const supabase = await createClient();

    try {
      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) throw exchangeError;

      // Wait briefly to allow the trigger to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify the user was created properly
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user?.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile verification failed:", profileError);
        throw new Error("Profile creation failed");
      }

      return NextResponse.redirect(`${APP_URL}/dashboard`);
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${APP_URL}/auth-error`);
    }
  }

  // No code or error, redirect to home
  return NextResponse.redirect(APP_URL);
}
