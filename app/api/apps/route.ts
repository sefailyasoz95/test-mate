import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/route";

// List the caller's apps
export async function GET() {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("apps")
		.select("*")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data ?? []);
}

// Create an app (enriched v2 fields)
export async function POST(req: NextRequest) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await req.json().catch(() => null);
	if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

	const {
		name,
		package_name,
		category,
		description,
		play_store_link,
		opt_in_link,
	} = body;

	if (!name || !package_name) {
		return NextResponse.json(
			{ error: "name and package_name are required" },
			{ status: 400 }
		);
	}

	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("apps")
		.insert({
			user_id: user.id,
			name,
			package_name,
			category: category ?? null,
			description: description ?? null,
			play_store_link: play_store_link ?? null,
			opt_in_link: opt_in_link ?? null,
		})
		.select()
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 400 });
	return NextResponse.json(data, { status: 201 });
}
