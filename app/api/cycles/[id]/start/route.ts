import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/route";
import { sendAssignmentEmail } from "@/lib/email";

// A tester can be in several closed tests at once (Google allows it), but not
// so many that they can't realistically test each one daily.
const MAX_CONCURRENT = 5;

/**
 * Start a cycle: pending_setup -> active.
 * Sets the 14-day window, assigns N available testers from the pool, and
 * creates `invited` assignments. The buyer triggers this from the setup
 * checklist once the closed-test track + tester group are configured.
 */
export async function POST(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const supabase = createAdminClient();

	const { data: cycle, error: cycleErr } = await supabase
		.from("test_cycles")
		.select(`*, order:orders(*, package:packages(*))`)
		.eq("id", id)
		.single();

	if (cycleErr || !cycle) {
		return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
	}
	if (cycle.user_id !== user.id) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	if (cycle.status !== "pending_setup") {
		return NextResponse.json(
			{ error: `Cycle is not in pending_setup (current: ${cycle.status})` },
			{ status: 409 }
		);
	}

	const durationDays: number = (cycle as any).order?.package?.duration_days ?? 14;
	const target: number = cycle.tester_target ?? 12;

	// --- Idea-safety guard ---
	// Never assign a tester to (a) the buyer's own app, or (b) an app whose
	// category matches one this tester also builds in. Block the buyer and any
	// developer who owns an app in the same category from testing this cycle.
	const { data: app } = await supabase
		.from("apps")
		.select("category, name, opt_in_link")
		.eq("id", cycle.app_id)
		.single();

	const excludedUserIds = new Set<string>([cycle.user_id]);
	if (app?.category) {
		const { data: rivals } = await supabase
			.from("apps")
			.select("user_id")
			.eq("category", app.category);
		for (const r of rivals ?? []) if (r.user_id) excludedUserIds.add(r.user_id);
	}

	// Current load: how many active-cycle assignments each tester already holds.
	// We cap concurrency at MAX_CONCURRENT so nobody is overloaded.
	const { data: loadRows } = await supabase
		.from("tester_assignments")
		.select("tester_account_id, cycle:test_cycles!inner(status)")
		.eq("cycle.status", "active")
		.neq("engagement_status", "dropped");

	const load = new Map<string, number>();
	for (const r of loadRows ?? []) {
		const tid = (r as { tester_account_id: string }).tester_account_id;
		load.set(tid, (load.get(tid) ?? 0) + 1);
	}

	// Candidate testers: available, not idea-conflicted, most reliable first.
	// Rows with a null user_id (our owned/manual testers) always pass the guard.
	let query = supabase
		.from("tester_accounts")
		.select("id, email")
		.eq("status", "available")
		.order("reliability_score", { ascending: false });

	if (excludedUserIds.size > 0) {
		const list = Array.from(excludedUserIds).join(",");
		query = query.or(`user_id.is.null,user_id.not.in.(${list})`);
	}

	const { data: candidates, error: testerErr } = await query;
	if (testerErr) {
		return NextResponse.json({ error: testerErr.message }, { status: 500 });
	}

	// Keep only testers under the concurrency cap, then take the target count.
	const testers = (candidates ?? [])
		.filter((t) => (load.get(t.id) ?? 0) < MAX_CONCURRENT)
		.slice(0, target);

	const today = new Date();
	const end = new Date(today);
	end.setDate(end.getDate() + durationDays);
	const startDate = today.toISOString().slice(0, 10);
	const endDate = end.toISOString().slice(0, 10);

	// Activate the cycle
	const { error: updErr } = await supabase
		.from("test_cycles")
		.update({ status: "active", start_date: startDate, end_date: endDate })
		.eq("id", id);
	if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

	const assigned = testers ?? [];
	const assignedIds = assigned.map((t) => t.id);

	if (assignedIds.length > 0) {
		const { error: assignErr } = await supabase.from("tester_assignments").insert(
			assignedIds.map((testerId) => ({
				test_cycle_id: id,
				tester_account_id: testerId,
				engagement_status: "invited",
			}))
		);
		if (assignErr) return NextResponse.json({ error: assignErr.message }, { status: 500 });

		// Notify each newly-invited tester (best-effort, non-blocking failures).
		const appName = app?.name ?? "an app";
		const optInLink = app?.opt_in_link ?? null;
		await Promise.allSettled(
			assigned
				.filter((t) => t.email)
				.map((t) =>
					sendAssignmentEmail({ to: t.email as string, appName, optInLink })
				)
		);
	}

	return NextResponse.json({
		status: "active",
		start_date: startDate,
		end_date: endDate,
		tester_target: target,
		assigned: assignedIds.length,
		shortfall: Math.max(0, target - assignedIds.length),
	});
}
