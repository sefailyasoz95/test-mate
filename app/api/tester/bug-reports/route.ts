import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/route";
import type { BugSeverity, MediaItem } from "@/lib/types/db";

const SEVERITIES: BugSeverity[] = ["low", "medium", "high"];

/** Resolve the caller's tester_accounts row id, or null if they aren't a tester. */
async function getTesterAccountId(supabase: ReturnType<typeof createAdminClient>, userId: string) {
	const { data } = await supabase.from("tester_accounts").select("id").eq("user_id", userId).maybeSingle();
	return data?.id ?? null;
}

// List the caller's own bug reports (optionally filtered by ?cycleId=)
export async function GET(req: NextRequest) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const supabase = createAdminClient();
	const accountId = await getTesterAccountId(supabase, user.id);
	if (!accountId) return NextResponse.json([]);

	let query = supabase
		.from("bug_reports")
		.select("*")
		.eq("tester_account_id", accountId)
		.order("created_at", { ascending: false });

	const cycleId = req.nextUrl.searchParams.get("cycleId");
	if (cycleId) query = query.eq("test_cycle_id", cycleId);

	const { data, error } = await query;
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data ?? []);
}

// File a bug report for a cycle the caller is assigned to
export async function POST(req: NextRequest) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await req.json().catch(() => null);
	if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

	const { test_cycle_id, title, description, severity, media } = body as {
		test_cycle_id?: string;
		title?: string;
		description?: string;
		severity?: string;
		media?: MediaItem[];
	};

	if (!test_cycle_id || !title?.trim()) {
		return NextResponse.json({ error: "test_cycle_id and title are required" }, { status: 400 });
	}
	const sev: BugSeverity = SEVERITIES.includes(severity as BugSeverity) ? (severity as BugSeverity) : "medium";

	const supabase = createAdminClient();
	const accountId = await getTesterAccountId(supabase, user.id);
	if (!accountId) return NextResponse.json({ error: "You are not registered as a tester" }, { status: 403 });

	// Ownership: the caller must have an assignment on this cycle.
	const { data: assignment } = await supabase
		.from("tester_assignments")
		.select("id")
		.eq("test_cycle_id", test_cycle_id)
		.eq("tester_account_id", accountId)
		.maybeSingle();
	if (!assignment) {
		return NextResponse.json({ error: "You are not assigned to this app" }, { status: 403 });
	}

	const { data, error } = await supabase
		.from("bug_reports")
		.insert({
			test_cycle_id,
			tester_account_id: accountId,
			title: title.trim(),
			description: description?.trim() || null,
			severity: sev,
			media: Array.isArray(media) ? media : [],
		})
		.select()
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 400 });
	return NextResponse.json(data, { status: 201 });
}
