import { createAdminClient } from "./admin";
import { getCurrentUser } from "./route";

/**
 * Returns the authenticated caller only if their profile role is 'admin'.
 * Returns null otherwise (unauthenticated or non-admin). Use at the top of
 * every /api/admin route to gate access.
 */
export async function getAdminUser() {
	const user = await getCurrentUser();
	if (!user) return null;

	const supabase = createAdminClient();
	const { data } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (data?.role !== "admin") return null;
	return user;
}
