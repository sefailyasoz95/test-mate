import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/admin-auth";

// All signed-up users, with lightweight counts for the admin list view.
// Detail (apps + full purchase history) is fetched per-user on demand via
// /api/admin/users/[id].
export async function GET() {
	const admin = await getAdminUser();
	if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const supabase = createAdminClient();
	const [{ data: profiles, error }, { data: apps }, { data: orders }] = await Promise.all([
		supabase.from("profiles").select("*").order("created_at", { ascending: false }),
		supabase.from("apps").select("id, user_id"),
		supabase.from("orders").select("user_id, amount_usd, status"),
	]);

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });

	const appsByUser = new Map<string, number>();
	for (const a of apps ?? []) {
		appsByUser.set(a.user_id, (appsByUser.get(a.user_id) ?? 0) + 1);
	}

	const ordersByUser = new Map<string, { count: number; total: number }>();
	for (const o of orders ?? []) {
		const entry = ordersByUser.get(o.user_id) ?? { count: 0, total: 0 };
		entry.count += 1;
		if (o.status === "paid") entry.total += Number(o.amount_usd ?? 0);
		ordersByUser.set(o.user_id, entry);
	}

	const rows = (profiles ?? []).map((p) => ({
		...p,
		appsCount: appsByUser.get(p.id) ?? 0,
		ordersCount: ordersByUser.get(p.id)?.count ?? 0,
		totalSpentUsd: ordersByUser.get(p.id)?.total ?? 0,
	}));

	return NextResponse.json(rows);
}
