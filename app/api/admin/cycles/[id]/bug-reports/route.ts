import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/admin-auth";

/**
 * Admin: all tester-submitted bug reports for a cycle, newest first,
 * joined with the submitting tester for attribution.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const { id } = await params;
	const supabase = createAdminClient();

	const { data, error } = await supabase
		.from("bug_reports")
		.select("*, tester:tester_accounts(id, email, display_name)")
		.eq("test_cycle_id", id)
		.order("created_at", { ascending: false });

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data ?? []);
}
