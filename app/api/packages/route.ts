import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public: active packages, cheapest first. Pricing lives in the DB, not code.
export async function GET() {
	const supabase = createAdminClient();

	const { data, error } = await supabase
		.from("packages")
		.select("*")
		.eq("active", true)
		.order("price_usd", { ascending: true });

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(data ?? []);
}
