import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/admin-auth";

// All payments/orders across buyers, with their app, package and resulting
// cycle(s). orders.user_id references auth.users (not profiles), so the buyer
// email is resolved with a second query — same pattern as /admin/cycles.
export async function GET() {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const supabase = createAdminClient();
	const { data: orders, error } = await supabase
		.from("orders")
		.select(
			`*,
			 app:apps(*),
			 package:packages(*),
			 cycles:test_cycles(id, status, is_rerun)`
		)
		.order("created_at", { ascending: false });

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });

	const rows = orders ?? [];
	const userIds = Array.from(new Set(rows.map((o) => o.user_id))).filter(Boolean);

	let emailById = new Map<string, string>();
	if (userIds.length > 0) {
		const { data: profiles } = await supabase
			.from("profiles")
			.select("id, email")
			.in("id", userIds);
		emailById = new Map((profiles ?? []).map((p) => [p.id, p.email]));
	}

	const withBuyer = rows.map((o) => ({
		...o,
		buyer: emailById.has(o.user_id)
			? { id: o.user_id, email: emailById.get(o.user_id)! }
			: null,
	}));

	return NextResponse.json(withBuyer);
}
