import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/route";

// List the caller's test cycles (with app + package for the dashboard)
export async function GET() {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("test_cycles")
		.select(`*, app:apps(*), order:orders(*, package:packages(*))`)
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data ?? []);
}
