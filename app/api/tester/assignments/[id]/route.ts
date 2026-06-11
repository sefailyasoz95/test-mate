import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/route";

/**
 * Tester self-service actions on their own assignment.
 *   body { action: "opt_in" }  → invited → opted_in (joined the closed test)
 *   body { action: "checkin" } → records today's activity (once/day), → active
 * Authorization: the assignment must belong to the caller's tester account.
 */
export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { action } = (await req.json().catch(() => ({}))) as { action?: string };
	if (action !== "opt_in" && action !== "checkin") {
		return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	}

	const supabase = createAdminClient();

	// Resolve caller's tester account
	const { data: account } = await supabase
		.from("tester_accounts")
		.select("id")
		.eq("user_id", user.id)
		.maybeSingle();
	if (!account) return NextResponse.json({ error: "Not a tester" }, { status: 403 });

	// Load + ownership check
	const { data: assignment } = await supabase
		.from("tester_assignments")
		.select("*")
		.eq("id", id)
		.maybeSingle();
	if (!assignment || assignment.tester_account_id !== account.id) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const now = new Date();
	const nowIso = now.toISOString();

	if (action === "opt_in") {
		if (assignment.engagement_status !== "invited") {
			return NextResponse.json({ ok: true, engagement_status: assignment.engagement_status });
		}
		const { data, error } = await supabase
			.from("tester_assignments")
			.update({ engagement_status: "opted_in", opted_in_at: nowIso })
			.eq("id", id)
			.select()
			.single();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ ok: true, assignment: data });
	}

	// checkin
	if (assignment.engagement_status === "invited") {
		return NextResponse.json(
			{ error: "Opt in to the closed test first." },
			{ status: 409 }
		);
	}

	// Only one activity credit per calendar day (UTC)
	const today = nowIso.slice(0, 10);
	const last = assignment.last_active_at ? String(assignment.last_active_at).slice(0, 10) : null;
	if (last === today) {
		return NextResponse.json({ ok: true, already: true, days_active: assignment.days_active });
	}

	const { data, error } = await supabase
		.from("tester_assignments")
		.update({
			engagement_status: "active",
			last_active_at: nowIso,
			days_active: (assignment.days_active ?? 0) + 1,
		})
		.eq("id", id)
		.select()
		.single();
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ ok: true, assignment: data });
}
