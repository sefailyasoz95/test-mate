import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/route";

/**
 * Self-serve tester opt-in.
 *
 * A logged-in developer can choose to also become a tester. This flips
 * profiles.is_tester and creates (or revives) their tester_accounts row,
 * keyed to their auth user. Their Google sign-in email IS the email we add
 * to closed-test tracks, so no separate collection is needed.
 *
 * GET  → current tester status for the caller.
 * POST → opt in (idempotent). Body: { country?, device_model?, android_version?, accept: true }
 */

export async function GET() {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const supabase = createAdminClient();

	const [{ data: profile }, { data: account }] = await Promise.all([
		supabase.from("profiles").select("is_tester, credits").eq("id", user.id).single(),
		supabase.from("tester_accounts").select("*").eq("user_id", user.id).maybeSingle(),
	]);

	return NextResponse.json({
		is_tester: profile?.is_tester ?? false,
		credits: profile?.credits ?? 0,
		account: account ?? null,
	});
}

export async function POST(req: NextRequest) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await req.json().catch(() => ({}));
	if (body.accept !== true) {
		return NextResponse.json(
			{ error: "You must accept the tester terms to continue." },
			{ status: 400 }
		);
	}

	const email = user.email;
	if (!email) {
		return NextResponse.json(
			{ error: "Your account has no email — cannot become a tester." },
			{ status: 400 }
		);
	}

	const supabase = createAdminClient();
	const now = new Date().toISOString();

	// 1) flip the capability flag
	const { error: profErr } = await supabase
		.from("profiles")
		.update({ is_tester: true })
		.eq("id", user.id);
	if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });

	// 2) upsert the pool row (one per user). Email may already exist if an admin
	//    pre-added it — adopt that row by matching email, otherwise create fresh.
	const googleId =
		(user.user_metadata as Record<string, unknown> | undefined)?.sub as string | undefined;

	const patch = {
		user_id: user.id,
		email,
		google_id: googleId ?? null,
		type: "community" as const,
		country: body.country?.trim() || null,
		device_model: body.device_model?.trim() || null,
		android_version: body.android_version?.trim() || null,
		terms_accepted_at: now,
		status: "available" as const,
	};

	// Adopt an existing row (admin may have pre-seeded by email) instead of
	// overwriting it — crucially, don't reset a reliability_score that was
	// already earned/set. Only brand-new community testers start from scratch.
	const { data: existing } = await supabase
		.from("tester_accounts")
		.select("id")
		.or(`user_id.eq.${user.id},email.eq.${email}`)
		.maybeSingle();

	let account;
	if (existing) {
		const { data, error: updErr } = await supabase
			.from("tester_accounts")
			.update(patch) // reliability_score untouched
			.eq("id", existing.id)
			.select()
			.single();
		if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
		account = data;
	} else {
		const { data, error: insErr } = await supabase
			.from("tester_accounts")
			.insert({ ...patch, reliability_score: 0 }) // start from scratch
			.select()
			.single();
		if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
		account = data;
	}

	return NextResponse.json({ ok: true, is_tester: true, account });
}
