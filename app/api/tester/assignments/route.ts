import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/route";

/**
 * Apps the current tester is assigned to test.
 * Resolves the caller's tester_accounts row, then returns their assignments
 * joined with the cycle + app (opt-in link is what they actually click).
 */
export async function GET() {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const supabase = createAdminClient();

	const { data: account } = await supabase
		.from("tester_accounts")
		.select("id")
		.eq("user_id", user.id)
		.maybeSingle();

	if (!account) return NextResponse.json([]);

	const { data, error } = await supabase
		.from("tester_assignments")
		.select(
			`*,
			 cycle:test_cycles(
				id, status, start_date, end_date, tester_target,
				app:apps(id, name, package_name, category, opt_in_link, play_store_link)
			 )`
		)
		.eq("tester_account_id", account.id)
		.order("created_at", { ascending: false });

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data ?? []);
}
