import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/route";

// Cycle detail: cycle + app + package + tester assignments (with tester) + report
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const supabase = createAdminClient();

	const { data, error } = await supabase
		.from("test_cycles")
		.select(
			`*,
			 app:apps(*),
			 order:orders(*, package:packages(*)),
			 assignments:tester_assignments(*, tester:tester_accounts(*)),
			 report:reports(*)`
		)
		.eq("id", id)
		.single();

	if (error || !data) {
		return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 });
	}

	// Authorize: owner or admin
	if (data.user_id !== user.id) {
		const { data: profile } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.single();
		if (profile?.role !== "admin") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}
	}

	// reports embed comes back as an array (child table) — normalize to one|null
	const report = Array.isArray((data as any).report)
		? (data as any).report[0] ?? null
		: (data as any).report ?? null;

	return NextResponse.json({ ...data, report });
}
