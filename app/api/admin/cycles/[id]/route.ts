import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/admin-auth";
import type { CycleStatus } from "@/lib/types/db";

const ALLOWED: CycleStatus[] = [
	"pending_setup",
	"assigning",
	"active",
	"completed",
	"failed",
	"rerun_scheduled",
];

/**
 * Admin updates a cycle's status. Setting `rerun_scheduled` also spawns a
 * free re-run: a fresh pending_setup cycle linked to the original (the
 * guarantee is a second test cycle, not a cash refund).
 */
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const { id } = await params;
	const { status } = (await req.json()) as { status?: CycleStatus };

	if (!status || !ALLOWED.includes(status)) {
		return NextResponse.json({ error: "Invalid status" }, { status: 400 });
	}

	const supabase = createAdminClient();

	const { data: cycle, error: loadErr } = await supabase
		.from("test_cycles")
		.select("*")
		.eq("id", id)
		.single();
	if (loadErr || !cycle) {
		return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
	}

	const wasCompleted = cycle.status === "completed";

	const { error: updErr } = await supabase
		.from("test_cycles")
		.update({ status, updated_at: new Date().toISOString() })
		.eq("id", id);
	if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

	// On completion (first time only): reward community testers who did the work.
	// Testers are never pool-locked (concurrency is capped per cycle at start),
	// so there's nothing to "release" — they stay available throughout.
	let creditsGranted = 0;
	if (status === "completed" && !wasCompleted) {
		creditsGranted = await settleCompletedCycle(supabase, id);
	}

	let rerunId: string | null = null;
	if (status === "rerun_scheduled") {
		// Avoid duplicating a re-run if one already exists for this parent
		const { data: existing } = await supabase
			.from("test_cycles")
			.select("id")
			.eq("parent_cycle_id", id)
			.maybeSingle();

		if (!existing) {
			const { data: rerun, error: rerunErr } = await supabase
				.from("test_cycles")
				.insert({
					order_id: cycle.order_id,
					app_id: cycle.app_id,
					user_id: cycle.user_id,
					status: "pending_setup",
					tester_target: cycle.tester_target,
					is_rerun: true,
					parent_cycle_id: id,
				})
				.select("id")
				.single();
			if (rerunErr) return NextResponse.json({ error: rerunErr.message }, { status: 500 });
			rerunId = rerun?.id ?? null;
		} else {
			rerunId = existing.id;
		}
	}

	return NextResponse.json({ status, rerun_cycle_id: rerunId, credits_granted: creditsGranted });
}

// A tester "tested an app" if they stayed engaged most of the window.
const TESTED_THRESHOLD_DAYS = 12;
const CREDITS_PER_APPS = 12; // test 12 apps → earn 1 free Basic-12 credit
const RELIABILITY_REWARD = 10; // engaged a full cycle → climb
const RELIABILITY_PENALTY = 15; // fell short → drop
const clampScore = (n: number) => Math.max(0, Math.min(100, n));

type Db = ReturnType<typeof createAdminClient>;

/**
 * Reward + release on cycle completion.
 * - Each community tester who hit the engagement threshold gets
 *   apps_tested_count += 1; crossing a multiple of 12 grants a profile credit.
 * Returns the number of credits granted.
 */
async function settleCompletedCycle(supabase: Db, cycleId: string): Promise<number> {
	const { data: assignments } = await supabase
		.from("tester_assignments")
		.select(
			"tester_account_id, days_active, tester:tester_accounts(id, user_id, apps_tested_count, reliability_score)"
		)
		.eq("test_cycle_id", cycleId);

	const creditByUser = new Map<string, number>();

	for (const a of assignments ?? []) {
		const tester = (a as any).tester as
			| { id: string; user_id: string | null; apps_tested_count: number; reliability_score: number }
			| null;
		if (!tester) continue;

		const engaged = (a.days_active ?? 0) >= TESTED_THRESHOLD_DAYS;

		// reliability climbs for a full cycle, drops when they fall short
		const newScore = clampScore(
			(tester.reliability_score ?? 0) + (engaged ? RELIABILITY_REWARD : -RELIABILITY_PENALTY)
		);

		if (!engaged) {
			await supabase
				.from("tester_accounts")
				.update({ reliability_score: newScore })
				.eq("id", tester.id);
			continue;
		}

		const newCount = (tester.apps_tested_count ?? 0) + 1;
		await supabase
			.from("tester_accounts")
			.update({ apps_tested_count: newCount, reliability_score: newScore })
			.eq("id", tester.id);

		if (tester.user_id && newCount % CREDITS_PER_APPS === 0) {
			creditByUser.set(tester.user_id, (creditByUser.get(tester.user_id) ?? 0) + 1);
		}
	}

	let granted = 0;
	for (const [userId, delta] of Array.from(creditByUser.entries())) {
		const { data: prof } = await supabase
			.from("profiles")
			.select("credits")
			.eq("id", userId)
			.single();
		const next = (prof?.credits ?? 0) + delta;
		await supabase.from("profiles").update({ credits: next }).eq("id", userId);
		granted += delta;
	}

	return granted;
}
