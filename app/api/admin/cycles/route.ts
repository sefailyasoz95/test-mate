import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/admin-auth";

// All cycles across all buyers, for the operations board.
// Note: test_cycles.user_id references auth.users (not profiles), so the buyer
// email can't be embedded via PostgREST — we resolve it with a second query.
export async function GET() {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const supabase = createAdminClient();
	const { data: cycles, error } = await supabase
		.from("test_cycles")
		.select(
			`*,
			 app:apps(*),
			 order:orders(*, package:packages(*)),
			 assignments:tester_assignments(*, tester:tester_accounts(*))`
		)
		.order("created_at", { ascending: false });

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });

	const rows = cycles ?? [];
	const userIds = Array.from(new Set(rows.map((c) => c.user_id))).filter(Boolean);

	let emailById = new Map<string, string>();
	if (userIds.length > 0) {
		const { data: profiles } = await supabase
			.from("profiles")
			.select("id, email")
			.in("id", userIds);
		emailById = new Map((profiles ?? []).map((p) => [p.id, p.email]));
	}

	const withBuyer = rows.map((c) => ({
		...c,
		buyer: emailById.has(c.user_id)
			? { id: c.user_id, email: emailById.get(c.user_id)! }
			: null,
	}));

	return NextResponse.json(withBuyer);
}
