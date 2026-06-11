import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/admin-auth";
import type { EngagementStatus } from "@/lib/types/db";

const ENGAGEMENT: EngagementStatus[] = [
	"invited",
	"opted_in",
	"active",
	"inactive",
	"dropped",
];

/**
 * Admin updates a tester assignment's engagement (and optionally days_active).
 * Sets opted_in_at / last_active_at timestamps as the status advances.
 */
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const { id } = await params;
	const body = (await req.json()) as {
		engagement_status?: EngagementStatus;
		days_active?: number;
	};

	const patch: Record<string, unknown> = {};

	if (body.engagement_status) {
		if (!ENGAGEMENT.includes(body.engagement_status)) {
			return NextResponse.json({ error: "Invalid engagement_status" }, { status: 400 });
		}
		patch.engagement_status = body.engagement_status;
		const now = new Date().toISOString();
		if (body.engagement_status === "opted_in") patch.opted_in_at = now;
		if (body.engagement_status === "active") patch.last_active_at = now;
	}

	if (typeof body.days_active === "number") {
		patch.days_active = Math.max(0, Math.floor(body.days_active));
	}

	if (Object.keys(patch).length === 0) {
		return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
	}

	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("tester_assignments")
		.update(patch)
		.eq("id", id)
		.select()
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}
