import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/admin-auth";
import type { TesterType } from "@/lib/types/db";

const TYPES: TesterType[] = ["owned", "recruited", "exchange"];

// List the tester pool (most reliable first).
export async function GET() {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("tester_accounts")
		.select("*")
		.order("reliability_score", { ascending: false });

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data ?? []);
}

// Add a tester to the pool.
export async function POST(req: NextRequest) {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const body = await req.json();
	const email = String(body.email ?? "").trim();
	if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

	const type: TesterType = TYPES.includes(body.type) ? body.type : "owned";

	const supabase = createAdminClient();

	// For our own ("owned") devices we provision a real TestMate auth account so
	// the physical phone can log in later. Default password = email local-part
	// (e.g. "john" for john@gmail.com). Best-effort: if the user already exists
	// or creation fails we still add the tester row.
	let userId: string | null = null;
	if (type === "owned") {
		// Provision a dedicated TestMate login for the physical device.
		// Default password = email local-part (e.g. "john" for john@gmail.com).
		const password = email.split("@")[0] || email;
		const { data: created, error: authErr } = await supabase.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
		});
		if (authErr || !created?.user) {
			return NextResponse.json(
				{ error: `Could not create a login for ${email}: ${authErr?.message ?? "unknown error"}` },
				{ status: 400 }
			);
		}
		userId = created.user.id;

		// The handle_new_user trigger already inserted the profile (role 'user');
		// flag it as a tester so the role is correct and the Testing tab shows.
		await supabase
			.from("profiles")
			.update({ role: "tester", is_tester: true })
			.eq("id", userId);
	}

	const { data, error } = await supabase
		.from("tester_accounts")
		.insert({
			email,
			user_id: userId,
			display_name: body.display_name?.trim() || null,
			google_id: body.google_id?.trim() || null,
			type,
			device_model: body.device_model?.trim() || null,
			android_version: body.android_version?.trim() || null,
			status: "available",
		})
		.select()
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}
