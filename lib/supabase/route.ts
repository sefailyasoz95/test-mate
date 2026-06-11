import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Identify the authenticated caller inside an API route from request cookies,
 * using the PUBLISHABLE key. getUser() validates the JWT against Supabase Auth
 * (don't trust getSession() for authorization). Returns null when unauthenticated.
 *
 * Pattern: getCurrentUser() to authorize, then createAdminClient() for data ops.
 */
export async function getCurrentUser() {
	const cookieStore = await cookies();

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set() {},
				remove() {},
			},
		}
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	return user;
}
