import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SECRET key.
 * Bypasses RLS — NEVER import this into client components.
 * Authorization MUST be enforced in the API route (see getCurrentUser).
 */
export function createAdminClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const secret = process.env.SUPABASE_SECRET_KEY;

	if (!url || !secret) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
	}

	return createClient(url, secret, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
}
