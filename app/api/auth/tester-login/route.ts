import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Email/password sign-in for tester accounts (physical devices).
 * Runs server-side through the SSR client so the session is persisted as
 * sb- cookies — which middleware reads to protect /dashboard. The browser
 * client stores sessions in localStorage, which the server can't see, so we
 * deliberately authenticate here instead.
 */
export async function POST(req: NextRequest) {
	const body = await req.json().catch(() => null);
	const email = body?.email?.trim();
	const password = body?.password;

	if (!email || !password) {
		return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
	}

	const supabase = await createClient();
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });

	if (error || !data.session) {
		return NextResponse.json({ error: error?.message || "Invalid credentials" }, { status: 401 });
	}

	// Cookies are now set (for middleware). Return the tokens so the browser
	// client can hydrate its own session store (for client-side useAuth).
	return NextResponse.json({
		ok: true,
		access_token: data.session.access_token,
		refresh_token: data.session.refresh_token,
	});
}
