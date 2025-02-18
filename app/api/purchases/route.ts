import { createServer } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const appId = searchParams.get("appId");
		const userId = searchParams.get("userId");

		if (!appId || !userId) {
			return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
		}

		const supabase = await createServer({ cookies: () => request.cookies });
		const { data, error } = await supabase.from("purchases").select("*").eq("app_id", appId).eq("user_id", userId);

		if (error) {
			throw error;
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching purchases:", error);
		return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
	}
}
