import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/admin-auth";
import { sendReportReadyEmail } from "@/lib/email";
import type { MediaItem } from "@/lib/types/db";

// Read the composed report (if any) for a cycle
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const { id } = await params;
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("reports")
		.select("*")
		.eq("test_cycle_id", id)
		.maybeSingle();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}

/**
 * Admin composes (upsert) and optionally sends the deliverable report.
 * Body: { title, summary, attachments, send }. When `send` is true we stamp
 * sent_at and email the buyer. Idempotent upsert keyed on test_cycle_id.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const { id } = await params;
	const body = await req.json().catch(() => null);
	if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

	const { title, summary, attachments, send } = body as {
		title?: string;
		summary?: string;
		attachments?: MediaItem[];
		send?: boolean;
	};

	const supabase = createAdminClient();

	// Confirm the cycle exists and grab buyer + app for the email.
	const { data: cycle, error: cycleErr } = await supabase
		.from("test_cycles")
		.select("id, user_id, app:apps(name)")
		.eq("id", id)
		.single();
	if (cycleErr || !cycle) return NextResponse.json({ error: "Cycle not found" }, { status: 404 });

	const sentAt = send ? new Date().toISOString() : undefined;

	const { data: report, error: upErr } = await supabase
		.from("reports")
		.upsert(
			{
				test_cycle_id: id,
				title: title?.trim() || null,
				summary: summary?.trim() || null,
				attachments: Array.isArray(attachments) ? attachments : [],
				...(sentAt ? { sent_at: sentAt } : {}),
			},
			{ onConflict: "test_cycle_id" }
		)
		.select()
		.single();

	if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

	let emailed = false;
	if (send) {
		const { data: buyer } = await supabase
			.from("profiles")
			.select("email")
			.eq("id", cycle.user_id)
			.maybeSingle();

		const appName = (cycle as { app?: { name?: string } | null }).app?.name ?? "your app";
		const origin = req.headers.get("origin") ?? new URL(req.url).origin;
		const reportLink = `${origin}/dashboard/cycles/${id}`;

		if (buyer?.email) {
			emailed = await sendReportReadyEmail({
				to: buyer.email,
				appName,
				reportTitle: report.title ?? null,
				reportLink,
			});
		}
	}

	return NextResponse.json({ report, emailed });
}
