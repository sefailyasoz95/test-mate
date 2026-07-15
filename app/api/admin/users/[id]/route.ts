import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/admin-auth";

// One user's full profile: the apps they created and their purchase history.
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const { id } = await params;
	const supabase = createAdminClient();

	const [{ data: profile, error: profileErr }, { data: apps }, { data: orders }] =
		await Promise.all([
			supabase.from("profiles").select("*").eq("id", id).single(),
			supabase.from("apps").select("*").eq("user_id", id).order("created_at", { ascending: false }),
			supabase
				.from("orders")
				.select(`*, app:apps(*), package:packages(*)`)
				.eq("user_id", id)
				.order("created_at", { ascending: false }),
		]);

	if (profileErr || !profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

	return NextResponse.json({ ...profile, apps: apps ?? [], orders: orders ?? [] });
}
